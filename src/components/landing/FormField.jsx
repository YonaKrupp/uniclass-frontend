import React from "react";

export default function FormField({ label, icon: Icon, type = "text", value, onChange, placeholder, required, select, options }) {
  const inputClass = `w-full ${Icon ? "pr-10" : "pr-4"} pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]`;
  return (
    <div className="space-y-2">
      <label className="text-sm font-heading font-medium text-foreground">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
        {select ? (
          <select value={value} onChange={onChange} className={inputClass}>
            <option value="">{placeholder}</option>
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className={inputClass} />
        )}
      </div>
    </div>
  );
}