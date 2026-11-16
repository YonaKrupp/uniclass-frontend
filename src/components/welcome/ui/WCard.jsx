import React from "react";

/** Frosted surface with a hairline border and soft layered shadow. */
export default function WCard({ as: Tag = "div", hover = true, className = "", children, ...rest }) {
  return (
    <Tag className={`wl-glass rounded-3xl ${hover ? "wl-lift" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}