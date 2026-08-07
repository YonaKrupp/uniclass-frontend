import React from "react";

export default function PageLogo({ className = "" }) {
  return (
    <div className="flex justify-center">
      <img
        src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png"
        alt="UniClass"
        className={`h-12 sm:h-14 w-auto object-contain ${className}`}
      />
    </div>
  );
}