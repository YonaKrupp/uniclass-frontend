import React, { useRef, useState } from "react";
import { ImagePlus, UserCircle } from "lucide-react";

const resizeToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 250;
        canvas.height = 330;
        canvas.getContext("2d").drawImage(img, 0, 0, 250, 330);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("שגיאה בטעינת התמונה"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
    reader.readAsDataURL(file);
  });

export default function PictureStep({ preview, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const dataUrl = await resizeToDataUrl(file);
      onChange({ preview: dataUrl, base64: dataUrl.split(",")[1] });
    } catch (err) {
      setError(err.message || "שגיאה בעיבוד התמונה");
    }
  };

  return (
    <div className="space-y-4 text-center">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />

      <div className="flex justify-center">
        {preview ? (
          <img
            src={preview}
            alt="תצוגה מקדימה של תמונת הפרופיל"
            className="w-[110px] h-[145px] object-cover rounded-xl border border-border shadow"
          />
        ) : (
          <div className="w-[110px] h-[145px] rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-muted text-foreground text-sm font-heading font-medium hover:bg-accent transition-colors"
      >
        <ImagePlus className="w-4 h-4" />
        {preview ? "בחירת תמונה אחרת" : "בחירת תמונה"}
      </button>

      <p className="text-xs font-body text-muted-foreground">אפשר גם לדלג ולהוסיף תמונה מאוחר יותר.</p>
      {error && <p className="text-xs font-body text-destructive">{error}</p>}
    </div>
  );
}