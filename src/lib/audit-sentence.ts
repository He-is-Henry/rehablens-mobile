type SentenceFn = (log: AuditLogEntry, currentUserId?: string) => string;

const formatParty = (p: AuditParty) =>
  p.customId ? `${p.name} (${p.customId})` : p.name;

const isActor = (log: AuditLogEntry, uid?: string) =>
  Boolean(uid && log.actor.userId === uid);

const isTarget = (party?: AuditParty, uid?: string) =>
  Boolean(uid && party?.userId === uid);

/**
 * Checks if the action was performed by the actor on themselves
 * or has no external target.
 */
const isSelfAction = (log: AuditLogEntry) =>
  log.affected.length === 0 ||
  (log.affected.length === 1 && log.affected[0].userId === log.actor.userId);

const getActor = (log: AuditLogEntry, currentUserId?: string) =>
  isActor(log, currentUserId) ? "You" : formatParty(log.actor);

const getAffected = (log: AuditLogEntry, currentUserId?: string) => {
  if (isSelfAction(log)) return "";

  const names = log.affected.map((a) => {
    if (isTarget(a, currentUserId)) return "you";
    if (a.userId === log.actor.userId) return "themselves";
    return formatParty(a);
  });

  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

const SENTENCE_TEMPLATES: Record<string, SentenceFn> = {
  "signed in": (log, uid) => {
    const isActorUser = isActor(log, uid);
    if (log.outcome === "failure") {
      const target = isTarget(log.affected[0], uid)
        ? "your"
        : log.affected[0]
          ? `${formatParty(log.affected[0])}'s`
          : "an";
      return `Failed sign-in attempt on ${target} account`;
    }
    return isActorUser
      ? "You signed in"
      : `${formatParty(log.actor)} signed in`;
  },

  "reset the password of": (log, uid) => {
    const target = log.affected[0];
    const isActorUser = isActor(log, uid);
    const isTargetUser = isTarget(target, uid);
    const isSelf = isSelfAction(log);

    if (log.outcome === "failure") {
      if (isTargetUser || (isSelf && isActorUser)) {
        return "Failed password reset attempt on your account";
      }
      return target
        ? `Failed password reset attempt for ${formatParty(target)}`
        : `Failed password reset attempt by ${getActor(log, uid)}`;
    }

    if (isSelf) {
      return isActorUser
        ? "You reset your password"
        : `${formatParty(log.actor)} reset their password`;
    }

    if (isTargetUser) {
      return `${formatParty(log.actor)} reset your password`;
    }

    return `${getActor(log, uid)} reset the password for ${getAffected(log, uid)}`;
  },

  "created an account for": (log, uid) => {
    const target = log.affected[0];
    const isActorUser = isActor(log, uid);
    const isTargetUser = isTarget(target, uid);
    const isSelf = isSelfAction(log);

    if (log.outcome === "failure") {
      return `Failed account creation attempt${
        isTargetUser
          ? " for your account"
          : target
            ? ` for ${formatParty(target)}`
            : ""
      }`;
    }

    if (isSelf) {
      return isActorUser
        ? "You created an account"
        : `${formatParty(log.actor)} created an account`;
    }

    if (isTargetUser) {
      return `${formatParty(log.actor)} created an account for you`;
    }

    return `${getActor(log, uid)} created an account for ${getAffected(log, uid)}`;
  },

  "deleted the account of": (log, uid) => {
    const target = log.affected[0];
    const isActorUser = isActor(log, uid);
    const isTargetUser = isTarget(target, uid);
    const isSelf = isSelfAction(log);

    if (log.outcome === "failure") {
      return `Failed attempt to delete account${
        isTargetUser
          ? " for your account"
          : target
            ? ` for ${formatParty(target)}`
            : ""
      }`;
    }

    if (isSelf) {
      return isActorUser
        ? "You deleted your account"
        : `${formatParty(log.actor)} deleted their account`;
    }

    if (isTargetUser) {
      return `${formatParty(log.actor)} deleted your account`;
    }

    return `${getActor(log, uid)} deleted the account of ${getAffected(log, uid)}`;
  },

  "restored the account of": (log, uid) => {
    const target = log.affected[0];
    const isActorUser = isActor(log, uid);
    const isTargetUser = isTarget(target, uid);
    const isSelf = isSelfAction(log);

    if (log.outcome === "failure") {
      return `Failed attempt to restore account${
        isTargetUser
          ? " for your account"
          : target
            ? ` for ${formatParty(target)}`
            : ""
      }`;
    }

    if (isSelf) {
      return isActorUser
        ? "You restored your account"
        : `${formatParty(log.actor)} restored their account`;
    }

    if (isTargetUser) {
      return `${formatParty(log.actor)} restored your account`;
    }

    return `${getActor(log, uid)} restored the account of ${getAffected(log, uid)}`;
  },

  "ended a session for": (log, uid) => {
    const target = log.affected[0];
    const isActorUser = isActor(log, uid);
    const isTargetUser = isTarget(target, uid);
    const isSelf = isSelfAction(log);

    if (log.outcome === "failure") {
      return "Failed attempt to end session";
    }

    if (isSelf) {
      return isActorUser
        ? "You ended a session on your account"
        : `${formatParty(log.actor)} ended a session on their account`;
    }

    if (isTargetUser) {
      return `${formatParty(log.actor)} ended a session on your account`;
    }

    return `${getActor(log, uid)} ended a session for ${getAffected(log, uid)}`;
  },

  "completed a session for": (log, uid) =>
    `${getActor(log, uid)} completed a session${
      log.object ? ` for "${log.object.name}"` : ""
    }`,

  "created the exercise": (log, uid) =>
    `${getActor(log, uid)} created the exercise "${log.object?.name}"`,

  "created an admin account for": (log, uid) =>
    `${getActor(log, uid)} created an admin account for ${getAffected(log, uid)}`,

  verified: (log, uid) =>
    `${getActor(log, uid)} verified ${getAffected(log, uid)}`,

  "removed verification for": (log, uid) =>
    `${getActor(log, uid)} removed verification for ${getAffected(log, uid)}`,

  "assigned a physiotherapist to": (log, uid) =>
    `${getActor(log, uid)} assigned ${log.object?.name ?? "a physiotherapist"} to ${getAffected(log, uid)}`,

  "assigned an exercise to": (log, uid) =>
    `${getActor(log, uid)} assigned an exercise to ${getAffected(log, uid)}${
      log.object ? ` (${log.object.name})` : ""
    }`,

  "updated an assignment for": (log, uid) =>
    `${getActor(log, uid)} updated an assignment for ${getAffected(log, uid)}${
      log.object ? ` (${log.object.name})` : ""
    }`,

  "removed an assignment for": (log, uid) =>
    `${getActor(log, uid)} removed an assignment for ${getAffected(log, uid)}${
      log.object ? ` (${log.object.name})` : ""
    }`,

  "scheduled sessions for": (log, uid) =>
    `${getActor(log, uid)} scheduled sessions for ${getAffected(log, uid)}`,

  "updated a scheduled session for": (log, uid) =>
    `${formatParty(log.actor)} updated a scheduled session for ${getAffected(log, uid)}`,

  "cancelled a scheduled session for": (log, uid) =>
    `${getActor(log, uid)} cancelled a scheduled session for ${getAffected(log, uid)}`,

  impersonated: (log, uid) =>
    `${getActor(log, uid)} impersonated ${getAffected(log, uid)}`,

  linked: (log, uid) => {
    const isActorUser = isActor(log, uid);
    if (isSelfAction(log)) {
      return isActorUser
        ? `You requested to join ${log.object?.name ?? "a hospital"}`
        : `${formatParty(log.actor)} requested to join ${log.object?.name ?? "a hospital"}`;
    }
    return `${getActor(log, uid)} linked ${getAffected(log, uid)} to ${log.object?.name ?? "the hospital"}`;
  },
};

const DEFAULT_TEMPLATE: SentenceFn = (log, uid) => {
  const actor = getActor(log, uid);
  const affected = getAffected(log, uid);
  const objectStr = log.object ? ` (${log.object.name})` : "";

  if (log.outcome === "failure") {
    return `Failed attempt to ${log.action}${affected ? ` for ${affected}` : ""}${objectStr}`;
  }

  return `${actor} ${log.action}${affected ? ` ${affected}` : ""}${objectStr}`;
};

export function renderAuditSentence(
  log: AuditLogEntry,
  currentUserId?: string,
): string {
  return (SENTENCE_TEMPLATES[log.action] ?? DEFAULT_TEMPLATE)(
    log,
    currentUserId,
  );
}
