import { useState, useEffect } from "react";

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [colors, setColors] = useState<string[] | null>(null);
  const [allColors, setAllColors] = useState<string[] | null>(null);
  const [linkColors, setLinkColors] = useState<string[] | null>(null);
  const [linkHoverColors, setLinkHoverColors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debugging useEffect to check if linkHoverColors are received
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
      {loading && <p>Analysiere... Bitte warten</p>}
      {colors && (
        <div>
          <h3>Top 3 prägnanteste Farben:</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {colors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: color,
                  color: "#000",
                  padding: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      )}
      {allColors && (
        <div>
          <h3>Alle gefundene Farben:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {allColors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: color,
                  color: "#000",
                  padding: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      )}
      {linkColors && (
        <div>
          <h3>Link Farben:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {linkColors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: color,
                  color: "#000",
                  padding: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      )}
      {linkHoverColors && linkHoverColors.length > 0 && (
        <div>
          <h3>Link Hover Farben:</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {linkHoverColors.map((color, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: color,
                  color: "#000",
                  padding: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100px",
                  height: "100px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
