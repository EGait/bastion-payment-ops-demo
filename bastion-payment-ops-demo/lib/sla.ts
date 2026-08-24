import { ExceptionItem, ExceptionType } from "@/data/mockLedger";

// Escalation thresholds, minutes, pulled from SOP.md's response-time targets.
const SLA_ESCALATE_AFTER_MINUTES: Record<ExceptionType, number> = {
  Stalled: 120,
  Return: 240,
  Reject: 240,
  "Failed conversion": 60,
};

export function isSlaBreached(exception: ExceptionItem): boolean {
  if (exception.status === "Resolved") return false;
  return exception.ageMinutes > SLA_ESCALATE_AFTER_MINUTES[exception.type];
}

export function slaTargetMinutes(type: ExceptionType): number {
  return SLA_ESCALATE_AFTER_MINUTES[type];
}
