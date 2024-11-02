import { useState, useEffect } from "react";
import ColorDisplay from "./ColorDisplay";
import { toast, Toaster } from "react-hot-toast";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [colors, setColors] = useState<string[] | null>(null);
  const [allColors, setAllColors] = useState<string[] | null>(null);
  const [linkColors, setLinkColors] = useState<string[] | null>(null);
  const [linkHoverColors, setLinkHoverColors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const resetColors = () => {
    setColors(null);
    setAllColors(null);
    setLinkColors(null);
    setLinkHoverColors(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    resetColors();
    const toastId = toast.loading("Lade Daten...");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: new URLSearchParams({ url }),
      });
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Daten");
      }
      const data = await response.json();
      setColors(data.colors);
      setAllColors(data.allColors);
      setLinkColors(data.linkColors);
      setLinkHoverColors(data.linkHoverColors);
      toast.dismiss(toastId);
      toast.success("Daten erfolgreich geladen!");
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten: ", error);
      toast.dismiss(toastId);
      toast.error("Fehler beim Abrufen der Daten");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkHoverColors) {
      console.log("Link Hover Colors: ", linkHoverColors);
    }
  }, [linkHoverColors]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">Website URL:</label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <button type="submit" disabled={loading}>
          Analysieren
        </button>
      </form>
      <Toaster />
      {colors && (
        <ColorDisplay title="Top 3 prägnanteste Farben" colors={colors} />
      )}
      {allColors && (
        <ColorDisplay title="Alle gefundene Farben" colors={allColors} />
      )}
      <div className="flex gap-12">
        {linkColors && <ColorDisplay title="Link Farben" colors={linkColors} />}
        {linkHoverColors && linkHoverColors.length > 0 && (
          <ColorDisplay title="Link Hover Farben" colors={linkHoverColors} />
        )}
      </div>
    </div>
  );
}
