import React, { createContext, useContext, useMemo, useState } from "react";

export const ROLE_BOTH = "both";
export const ROLE_STUDENT = "student";
export const ROLE_TEACHER = "teacher";

const RoleContext = createContext({ role: ROLE_BOTH, setRole: () => {} });

export function WelcomeRoleProvider({ children }) {
  const [role, setRole] = useState(ROLE_BOTH);
  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}

/** True when a card belongs to the role the visitor is NOT exploring. */
export function isDimmed(role, cardRole) {
  return role !== ROLE_BOTH && role !== cardRole;
}