import { ExceptionItem, ExceptionType, Rail } from "@/data/mockLedger";

// Escalation targets, in minutes.
//
// The thing worth noticing here: a stalled payment's clock has to depend on
// the RAIL, not just the exception type. RTP settles in seconds and is
// irrevocable; SWIFT can legitimately take two business days. Giving both a
// flat "stalled = escalate after 2 hours" target is how an ops dashboard ends
// up showing a 21-minute RTP stall — 84× past its window — as unremarkable,
// while paging someone about a wire that's behaving normally.

// Roughly how long each rail should take to settle end to end.
const RAIL_SETTLEMENT_WINDOW: Record<Rail, number> = {
  RTP: 1, // near-instant, 24/7
  "Solana USDC": 5, // on-chain finality plus partner confirmation
  Wire: 120, // same-day domestic
  ACH: 1440, // next-banking-day
  SEPA: 1440, // next-business-day
  SWIFT: 2880, // up to two business days cross-border
};

// Terminal failures — a return, a reject, a failed conversion — need a human
// regardless of how fast the rail is, so they carry a flat clock.
const TERMINAL_ESCALATION: Partial<Record<ExceptionType, number>> = {
  Return: 240,
  Reject: 240,
  "Failed conversion": 60,
  "Recon break": 480,
};

export function slaTargetMinutes(type: ExceptionType, rail: Rail): number {
  const terminal = TERMINAL_ESCALATION[type];
  if (terminal !== undefined) return terminal;
  // Stalled: give the rail two full settlement windows before escalating,
  // with a 15-minute floor so instant rails don't page on ordinary jitter.
  return Math.max(15, RAIL_SETTLEMENT_WINDOW[rail] * 2);
}

export function isSlaBreached(exception: ExceptionItem): boolean {
  if (exception.status === "Resolved") return false;
  return (
    exception.ageMinutes > slaTargetMinutes(exception.type, exception.rail)
  );
}
