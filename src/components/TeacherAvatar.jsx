import React from "react";
import { GraduationCap } from "lucide-react";

export default function TeacherAvatar({ pictureData }) {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-primary/10">
      {pictureData ? (
        <img src={`data:image/jpeg;base64,${pictureData}`} alt="תמונת מורה" className="w-full h-full object-cover" />
      ) : (
        <GraduationCap className="w-6 h-6 text-primary" />
      )}
    </div>
  );
}