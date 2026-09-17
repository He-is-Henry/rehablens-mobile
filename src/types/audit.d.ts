type AuditParty = {
  userId: string;
  name: string;
  role: string;
  customId?: string;
};

type AuditObject = {
  id?: string;
  name: string;
  type: string;
};

type AuditLogEntry = {
  _id: string;
  action: string;
  actor: AuditParty;
  object?: AuditObject;
  affected: AuditParty[];
  outcome: "success" | "failure";
  note?: string;
  seenBy: string[];
  createdAt: string;
};
