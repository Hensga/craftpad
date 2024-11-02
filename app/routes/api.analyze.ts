import { json } from "@remix-run/node";
import puppeteer from "puppeteer";

export const action = async ({ request }: { request: Request }) => {
  try {
    const formData = await request.formData();
    let url = formData.get("url") as string;

    if (!url) {
      return json({ error: "URL fehlt" }, { status: 400 });
    }

    // URL validieren und ggf. Protokoll ergänzen
    const validateUrl = (url: string) => {
      return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    };
    url = validateUrl(url);

    // Puppeteer Browser starten
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium', // Pfad zum installierten Chromium
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--single-process",
        "--disable-accelerated-2d-canvas"
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 }); // Höhere Auflösung für bessere Darstellung
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 }); // Warten bis alle Netzwerkanfragen abgeschlossen sind, ohne Timeout

    // Die Seite schrittweise nach unten scrollen, um alle Bereiche zu laden
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Kurze Pause, um Inhalte nachzuladen
      const newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === previousHeight) {
        break;
      }
    }

    // Farben direkt aus dem DOM extrahieren
    const colors = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const uniqueColors = new Set();
      const linkColors = new Set();

      elements.forEach((element) => {
        const elementStyles = window.getComputedStyle(element);

        // Hintergrundfarbe
        if (elementStyles.backgroundColor && elementStyles.backgroundColor !== "rgba(0, 0, 0, 0)") {
          uniqueColors.add(elementStyles.backgroundColor);
        }

        // Textfarbe
        if (elementStyles.color) {
          uniqueColors.add(elementStyles.color);
        }

        // Rahmenfarben
        ["borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"].forEach((border) => {
          if (elementStyles[border] && elementStyles[border] !== "rgba(0, 0, 0, 0)") {
            uniqueColors.add(elementStyles[border]);
          }
        });

        // Box-Schattenfarbe
        if (elementStyles.boxShadow && elementStyles.boxShadow !== "none") {
          const shadowColors = elementStyles.boxShadow.match(/rgba?\(\d+, \d+, \d+(, [\d\.]+)?\)/g);
          if (shadowColors) {
            shadowColors.forEach((color) => uniqueColors.add(color));
          }
        }

        // Linkfarben extrahieren
        if (element.tagName.toLowerCase() === 'a' && elementStyles.color) {
          linkColors.add(elementStyles.color);
        }
      });

      return { allColors: Array.from(uniqueColors), linkColors: Array.from(linkColors) };
    });

    // Link-Hover-Farben durch gezieltes Hovern extrahieren
    const linkHoverColors = new Set();
    const links = await page.$$('a');
    for (let link of links) {
      // Überprüfen, ob der Link sichtbar und klickbar ist
      const isVisible = await link.boundingBox() !== null;
      if (isVisible) {
        try {
          await link.hover();
          const hoverColor = await page.evaluate((link) => {
            const hoverStyles = window.getComputedStyle(link);
            return hoverStyles.color;
          }, link);
          if (hoverColor && hoverColor !== "rgba(0, 0, 0, 0)") {
            linkHoverColors.add(hoverColor);
          }
        } catch (error) {
          console.warn("Fehler beim Hovern über den Link: ", error);
        }
      }
    }

    await browser.close();

    // Farben in Hex umwandeln (falls nötig)
    const rgbToHex = (rgb) => {
      const result = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return result ? `#${((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3])).toString(16).slice(1)}` : rgb;
    };

    // Alle Farben in Hex umwandeln und deduplizieren
    const allHexColors = Array.from(new Set(colors.allColors.map(rgbToHex)));
    const linkHexColors = Array.from(new Set(colors.linkColors.map(rgbToHex)));
    const linkHoverHexColors = Array.from(new Set(Array.from(linkHoverColors).map(rgbToHex)));

    // Funktion zur Bestimmung der Farbintensität
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16); // Hex zu RGB konvertieren
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b; // Standardluminanzformel
    };

    // Schmuckfarben extrahieren - Farben mit höherer Sättigung und mittlerer Helligkeit
    const highlightColors = allHexColors.filter((color) => {
      const luminance = getLuminance(color);
      return luminance > 50 && luminance < 200; // Ausschluss von sehr dunklen und sehr hellen Farben
    });

    // Nur die 4 prägnantesten Farben auswählen
    const selectedColors = highlightColors.slice(0, 4);

    // Sicherstellen, dass alle Farben erhalten bleiben und nur die prägnantesten hervorgehoben werden
    return json({ colors: selectedColors, allColors: allHexColors, linkColors: linkHexColors, linkHoverColors: linkHoverHexColors });
  } catch (error) {
    console.error("Fehler bei der Analyse:", error);
    return json(
      { error: "Interner Serverfehler", details: (error instanceof Error) ? error.message : "Unbekannter Fehler" },
      { status: 500 }
    );
  }
};
