import { toast, Toaster } from "react-hot-toast";

type ColorDisplayProps = {
  title: string;
  colors: string[];
};

export default function ColorDisplay({ title, colors }: ColorDisplayProps) {
  const handleColorClick = (color: string) => {
    navigator.clipboard
      .writeText(color)
      .then(() => {
        toast.success(`Farbe ${color} wurde in die Zwischenablage kopiert`);
      })
      .catch((error) => {
        console.error("Fehler beim Kopieren der Farbe: ", error);
      });
  };

  return (
    <div className="my-8">
      <h3 className="mb-4">{title}</h3>
      <div className="flex flex-wrap gap-4">
        {colors.map((color, index) => (
          <div
            role="button"
            tabIndex={0}
            aria-label={`Farbe ${color}`}
            key={index}
            className="w-14 h-14 flex items-center justify-center rounded-md text-black text-xs border-2 border-solid cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleColorClick(color);
              }
            }}
          >
            {color}
            <Toaster />
          </div>
        ))}
      </div>
    </div>
  );
}
