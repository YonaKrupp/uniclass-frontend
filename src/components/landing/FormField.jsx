import React, { useId } from "react";

export default function FormField({ label, icon: Icon, type = "text", value, onChange, placeholder, required, select, options, autoComplete, describedBy }) {
  const fieldId = useId();
  const inputClass = `w-full ${Icon ? "pr-10" : "pr-4"} pl-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary focus:shadow-sm focus:shadow-primary/10 transition-all text-base font-body min-h-[48px]`;
  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-heading font-medium text-foreground block">
        {label}
        {required && <span aria-hidden="true" className="text-primary mr-1">*</span>}
        {required && <span className="sr-only"> (שדה חובה)</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />}
        {select ? (
          <select id={fieldId} value={value} onChange={onChange} required={required} aria-required={required ? "true" : undefined} aria-describedby={describedBy || undefined} className={inputClass}>
            <option value="">{placeholder}</option>
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input id={fieldId} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} aria-required={required ? "true" : undefined} aria-describedby={describedBy || undefined} className={inputClass} />
        )}
      </div>
    </div>
  );
}