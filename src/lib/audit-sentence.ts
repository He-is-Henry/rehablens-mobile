const affectedNames = (log: AuditLogEntry) =>
  log.affected.map((a) => a.name).join(", ");

const isSelf = (log: AuditLogEntry) => log.affected.length === 0;

type SentenceFn = (log: AuditLogEntry) => string;

const SENTENCE_TEMPLATES: Record<string, SentenceFn> = {
  "signed in": (log) => `${log.actor.name} signed in`,

  "completed a session for": (log) =>
    `${log.actor.name} completed a session${log.object ? ` for "${log.object.name}"` : ""}`,

  "created the exercise": (log) =>
    `${log.actor.name} created the exercise "${log.object?.name}"`,

  "created an admin account for": (log) =>
    `${log.actor.name} created an admin account for ${affectedNames(log)}`,

  verified: (log) => `${log.actor.name} verified ${affectedNames(log)}`,

  "removed verification for": (log) =>
    `${log.actor.name} removed verification for ${affectedNames(log)}`,

  "assigned a physiotherapist to": (log) =>
    `${log.actor.name} assigned ${log.object?.name ?? "a physiotherapist"} to ${affectedNames(log)}`,

  "assigned an exercise to": (log) =>
    `${log.actor.name} assigned an exercise to ${affectedNames(log)}${log.object ? ` (${log.object.name})` : ""}`,

  "updated an assignment for": (log) =>
    `${log.actor.name} updated an assignment for ${affectedNames(log)}${log.object ? ` (${log.object.name})` : ""}`,

  "removed an assignment for": (log) =>
    `${log.actor.name} removed an assignment for ${affectedNames(log)}${log.object ? ` (${log.object.name})` : ""}`,

  "scheduled sessions for": (log) =>
    `${log.actor.name} scheduled sessions for ${affectedNames(log)}`,

  "cancelled a scheduled session for": (log) =>
    `${log.actor.name} cancelled a scheduled session for ${affectedNames(log)}`,

  impersonated: (log) => `${log.actor.name} impersonated ${affectedNames(log)}`,

  // self-or-other, branch on affected
  "reset the password of": (log) =>
    isSelf(log)
      ? `${log.actor.name} reset their own password`
      : `${log.actor.name} reset the password of ${affectedNames(log)}`,

  "created an account for": (log) =>
    isSelf(log)
      ? `${log.actor.name} created an account`
      : `${log.actor.name} created an account for ${affectedNames(log)}`,

  "deleted the account of": (log) =>
    isSelf(log)
      ? `${log.actor.name} deleted their own account`
      : `${log.actor.name} deleted the account of ${affectedNames(log)}`,

  "restored the account of": (log) =>
    isSelf(log)
      ? `${log.actor.name} restored their own account`
      : `${log.actor.name} restored the account of ${affectedNames(log)}`,

  "ended a session for": (log) =>
    isSelf(log)
      ? `${log.actor.name} ended a session on their account`
      : `${log.actor.name} ended a session for ${affectedNames(log)}`,

  linked: (log) =>
    isSelf(log)
      ? `${log.actor.name} requested to join ${log.object?.name ?? "a hospital"}`
      : `${log.actor.name} linked ${affectedNames(log)} to ${log.object?.name ?? "the hospital"}`,
};

const DEFAULT_TEMPLATE: SentenceFn = (log) =>
  `${log.actor.name} ${log.action} ${affectedNames(log)}${
    log.object ? ` (${log.object.name})` : ""
  }`;

export function renderAuditSentence(log: AuditLogEntry): string {
  return (SENTENCE_TEMPLATES[log.action] ?? DEFAULT_TEMPLATE)(log);
}
