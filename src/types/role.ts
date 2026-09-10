export const UserRoleValues = {
  HOSPITAL_ADMIN: "hospital_admin",
  STAFF: "staff",
  PATIENT: "patient",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRoleValues)[keyof typeof UserRoleValues];
