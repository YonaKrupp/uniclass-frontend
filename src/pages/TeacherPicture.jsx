import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, Upload, Loader2, UserCircle, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function TeacherPicture() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || "";
  const defaultEmail = userData.teacherEmail || userData.email || "";

  const [email, setEmail] = useState(defaultEmail);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'info', text }
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const setStatusMsg = (type, text) => setStatus({ type, text });

  // Resize image using canvas (mirrors the C# ResizeImage logic)
  const resizeImage = (file, width, height) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("שגיאה בעיבוד התמונה"));
              resolve(blob);
            },
            "image/jpeg",
            0.85
          );
        };
        img.onerror = () => reject(new Error("שגיאה בטעינת התמונה"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => { handleLoad(); }, []);

  const handleLoad = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setPictureUrl(null);
    setStatus(null);
    try {
      const res = await base44.functions.invoke("teacherPictureProxy", {
        action: "get", email: email.trim(), token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setStatusMsg("error", "פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setStatusMsg("error", data.error);
        return;
      }
      if (!data.found) {
        setStatusMsg("info", "לא נמצאה תמונה למורה זה");
        return;
      }
      setPictureUrl(`data:image/jpeg;base64,${data.pictureData}`);
      setStatusMsg("success", "התמונה נטענה בהצלחה");
    } catch (err) {
      setStatusMsg("error", "שגיאה בטעינת התמונה: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resizedBlob = await resizeImage(file, 250, 330);
      setSelectedFile(resizedBlob);
      setPreviewUrl(URL.createObjectURL(resizedBlob));
      setStatusMsg("success", `תמונה נבחרה (${Math.round(resizedBlob.size / 1024)} KB)`);
    } catch (err) {
      setStatusMsg("error", err.message || "שגיאה בעיבוד התמונה");
    }
  };

  const handleUpload = async () => {
    if (!email.trim()) {
      setStatusMsg("error", "נא להזין אימייל מורה");
      return;
    }
    if (!selectedFile) {
      setStatusMsg("error", "נא לבחור תמונה תחילה");
      return;
    }
    setUploading(true);
    setStatus(null);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result;
          resolve(result.substring(result.indexOf(",") + 1));
        };
        reader.onerror = () => reject(new Error("שגיאה בקריאת הקובץ"));
        reader.readAsDataURL(selectedFile);
      });

      const res = await base44.functions.invoke("teacherPictureProxy", {
        action: "upload", email: email.trim(), token: authToken, pictureData: base64,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setStatusMsg("error", "פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setStatusMsg("error", data.error);
        return;
      }
      setStatusMsg("success", "התמונה הועלתה בהצלחה!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Reload the picture
      handleLoad();
    } catch (err) {
      setStatusMsg("error", "שגיאה בהעלאת התמונה: " + (err.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const statusStyles = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const StatusIcon = status?.type === "success" ? CheckCircle2 : status?.type === "error" ? AlertCircle : AlertCircle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">עריכת תמונת מורה</h1>
          <p className="text-muted-foreground font-body text-sm">טעינה והעלאת תמונת פרופיל למורה</p>
        </div>
        <Link
          to="/teacher-profile"
          className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לפרופיל
        </Link>
      </div>

      {/* Current Picture */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-heading font-semibold text-foreground">תמונה נוכחית</h2>
        <div className="flex items-center justify-center py-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-body">טוען תמונה...</p>
            </div>
          ) : pictureUrl ? (
            <img
              src={pictureUrl}
              alt="תמונת מורה"
              className="w-[150px] h-[200px] object-cover rounded-xl border border-border shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <UserCircle className="w-24 h-24 text-muted-foreground/40" />
              <p className="text-sm font-body">אין תמונה</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload New Picture */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-heading font-semibold text-foreground">העלאת תמונה חדשה</h2>

        <div className="flex flex-col items-center gap-4 py-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="תצוגה מקדימה"
              className="w-[150px] h-[200px] object-cover rounded-xl border border-border shadow-md"
            />
          ) : (
            <div className="w-[150px] h-[200px] rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
              <ImagePlus className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            בחירת תמונה
          </button>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {uploading ? "מעלה..." : "העלאת תמונה"}
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-body ${statusStyles[status.type]}`}>
          <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{status.text}</span>
        </div>
      )}
    </div>
  );
}