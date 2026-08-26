// Mock data layer for the Bastion Payment Ops demo.
//
// Shapes here are deliberately close to what a real payments-ops stack
// exposes: an internal ledger entry next to the partner's reported
// settlement, a match/break verdict, and for exceptions a hop-by-hop
// trail across the systems a stalled or failed payment could be sitting in.
//
// This file holds INPUTS only. Closing balances, funding status, open-break
// counts, and the exception rate are all derived in lib/ledger.ts and
// lib/kpi.ts so that no figure on screen is written down twice.
//
// The demo's "now" is 10:20 America/Chicago. Every trail timestamp and every
// `ageMinutes` below is consistent with that clock.
//
// All data is fabricated. Partner names are used only because they're
// realistic; nothing here touches a real account or transaction.

export const AS_OF = "10:20";

export type Rail = "ACH" | "Wire" | "RTP" | "SWIFT" | "Solana USDC" | "SEPA";

export type Partner =
  | "Circle"
  | "Cross River"
  | "Evolve Bank"
  | "OTC Liquidity Desk"
  | "Correspondent Bank";

export type Currency = "USD" | "USDC" | "EUR";

// Indicative rates, used only to express a mixed-currency total as one USD
// figure (the unreconciled variance across breaks). Frozen so the numbers on
// screen are reproducible. USDC is held at par. Secondary-market price and
// depeg risk are out of scope for this demo.
export const USD_FX: Record<Currency, number> = {
  USD: 1,
  USDC: 1,
  EUR: 1.08,
};

export function toUsd(amount: number, currency: Currency): number {
  return amount * USD_FX[currency];
}

export type ReconStatus = "matched" | "break";

// Direction of CASH relative to Bastion's position: "in" = funds received,
// "out" = funds sent. Deliberately not called credit/debit at the row level:
// on ACH those words name the entry type (an ACH debit *pulls* money in), and
// in double-entry a cash receipt is a debit to an asset account. "In/Out" is
// unambiguous on every rail, which is why the UI labels it that way.
export type CashDirection = "in" | "out";

export interface ReconRow {
  id: string;
  rail: Rail;
  counterparty: Partner;
  currency: Currency;
  internalAmount: number;
  partnerAmount: number;
  status: ReconStatus;
  direction: CashDirection;
  breakReason?: string;
  linkedExceptionId?: string; // set once a break has been promoted to a tracked exception
}

export type ExceptionType =
  | "Stalled"
  | "Return"
  | "Failed conversion"
  | "Reject"
  | "Recon break";

export type ExceptionStatus =
  | "New"
  | "Investigating"
  | "Escalated"
  | "Resolved";

export type HopState = "success" | "failed" | "pending";

export interface TrailHop {
  label: string;
  state: HopState;
  detail: string;
  time: string; // HH:MM, 24h, America/Chicago, or "Yesterday HH:MM"
}

export interface ExceptionItem {
  id: string;
  type: ExceptionType;
  rail: Rail;
  partner: Partner;
  amount: number;
  currency: Currency;
  status: ExceptionStatus;
  ageMinutes: number;
  summary: string;
  trail: TrailHop[];
  linkedReconId?: string; // set when this exception originated from a recon break
}

export type TreasuryStatus = "Adequate" | "Watch" | "Below target";

// A treasury account holds only its OPENING balance for the day, plus the
// counterparties whose settlement flows through it. The closing balance,
// today's net movement, the funding status, and any prefunding requirement
// are all derived from the reconciliation rows in lib/ledger.ts, so the
// treasury snapshot and the cash-movement view cannot tell different
// stories about the same day.
export interface TreasuryAccount {
  currency: Currency;
  venue: string;
  counterparties: Partner[];
  openingBalance: number;
  target: number;
  lastRebalanced: string;
}

export interface KpiSnapshot {
  settlementLatencyAvgMinutes: number;
  latencyDeltaPct: number; // vs. 7-day avg, negative = faster
  throughputTodayCount: number;
  throughputTodayVolumeUsd: number;
}

// Only the figures that genuinely can't be derived from the rows below live
// here. In a real system latency and throughput would come from the
// processor, not from this handful of reconciliation rows.
export const kpiSnapshot: KpiSnapshot = {
  settlementLatencyAvgMinutes: 12,
  latencyDeltaPct: -8,
  throughputTodayCount: 4812,
  throughputTodayVolumeUsd: 38_412_900,
};

export const reconRows: ReconRow[] = [
  {
    id: "RCN-10231",
    rail: "Wire",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 425_000,
    partnerAmount: 425_000,
    status: "matched",
    direction: "out",
  },
  {
    id: "RCN-10232",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 1_000_000,
    partnerAmount: 999_000,
    status: "break",
    direction: "out",
    breakReason:
      "Partner reports 999,000. One 1,000 USDC transfer in the batch not yet attributed",
  },
  {
    id: "RCN-10233",
    rail: "ACH",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 84_250,
    partnerAmount: 84_250,
    status: "matched",
    direction: "in",
  },
  {
    id: "RCN-10234",
    rail: "RTP",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 12_400,
    partnerAmount: 0,
    status: "break",
    direction: "out",
    breakReason: "Missing on partner ledger, no completion message received",
    linkedExceptionId: "EXC-4476",
  },
  {
    id: "RCN-10235",
    rail: "SWIFT",
    counterparty: "Correspondent Bank",
    currency: "USD",
    internalAmount: 2_150_000,
    partnerAmount: 2_150_000,
    status: "matched",
    direction: "in",
  },
  {
    id: "RCN-10236",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 640_000,
    partnerAmount: 640_000,
    status: "matched",
    direction: "in",
  },
  {
    id: "RCN-10237",
    rail: "SEPA",
    counterparty: "Correspondent Bank",
    currency: "EUR",
    internalAmount: 96_800,
    partnerAmount: 95_800,
    status: "break",
    direction: "out",
    // SEPA SCT is euro-only and full-amount (charges are always SHA), so a
    // EUR-vs-EUR gap here is a settlement/attribution problem, never FX.
    breakReason:
      "Amount mismatch: one €1,000 instruction in the bulk file rejected and returned separately",
  },
  {
    id: "RCN-10238",
    rail: "ACH",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 27_300,
    partnerAmount: 27_300,
    status: "matched",
    direction: "in",
  },
  {
    id: "RCN-10239",
    rail: "Wire",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 315_000,
    partnerAmount: 315_000,
    status: "matched",
    direction: "out",
  },
  {
    id: "RCN-10240",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 48_900,
    partnerAmount: 0,
    status: "break",
    direction: "in",
    breakReason: "Minted on-chain, not yet visible on Circle's ledger",
    linkedExceptionId: "EXC-4471",
  },
  {
    id: "RCN-10241",
    rail: "RTP",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 8_050,
    partnerAmount: 8_050,
    status: "matched",
    direction: "out",
  },
  {
    id: "RCN-10242",
    rail: "SWIFT",
    counterparty: "Correspondent Bank",
    currency: "USD",
    internalAmount: 1_204_500,
    partnerAmount: 1_204_465,
    status: "break",
    direction: "out",
    breakReason:
      "Amount mismatch: $35 intermediary lifting fee deducted in transit",
  },
  {
    id: "RCN-10243",
    rail: "ACH",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 61_000,
    partnerAmount: 61_000,
    status: "matched",
    direction: "out",
  },
  {
    id: "RCN-10244",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 152_000,
    partnerAmount: 152_000,
    status: "matched",
    direction: "out",
  },
  {
    id: "RCN-10245",
    rail: "Solana USDC",
    counterparty: "OTC Liquidity Desk",
    currency: "USDC",
    internalAmount: 250_000,
    partnerAmount: 240_000,
    status: "break",
    direction: "in",
    breakReason:
      "Partial fill: 240,000 of 250,000 USDC delivered, balance still working",
  },
];

export const exceptions: ExceptionItem[] = [
  {
    id: "EXC-4471",
    type: "Stalled",
    rail: "Solana USDC",
    partner: "Circle",
    amount: 48_900,
    currency: "USDC",
    status: "Investigating",
    ageMinutes: 47,
    summary:
      "Mint finalized on-chain but not yet reflected on Circle's ledger. A reporting lag, not a lost payment.",
    linkedReconId: "RCN-10240",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "USD funding leg debited, mint request initiated.",
        time: "09:31",
      },
      {
        label: "Circle Mint API",
        state: "success",
        detail: "Mint request accepted, transaction signature returned.",
        time: "09:31",
      },
      {
        label: "Solana settlement",
        state: "success",
        detail: "Transaction finalized on-chain (32 slots).",
        time: "09:33",
      },
      {
        label: "Circle ledger confirmation",
        state: "pending",
        detail:
          "No confirmation webhook from Circle after 47 min. Their ledger still doesn't show the mint.",
        time: "—",
      },
    ],
  },
  {
    id: "EXC-4472",
    type: "Return",
    rail: "ACH",
    partner: "Evolve Bank",
    amount: 3_200,
    currency: "USD",
    status: "New",
    ageMinutes: 12,
    summary:
      "R03 return on yesterday's outbound credit, received in this morning's return file.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Outbound ACH credit originated.",
        time: "Yesterday 14:30",
      },
      {
        label: "Evolve Bank ACH gateway",
        state: "success",
        detail:
          "Batch accepted, entries transmitted to the ACH operator (FedACH).",
        time: "Yesterday 14:32",
      },
      {
        label: "Receiving bank",
        state: "failed",
        detail: "R03 return: no account / unable to locate account.",
        time: "10:08",
      },
    ],
  },
  {
    id: "EXC-4473",
    type: "Failed conversion",
    rail: "Solana USDC",
    partner: "Circle",
    amount: 210_000,
    currency: "USDC",
    status: "Escalated",
    ageMinutes: 134,
    summary:
      "USDC to USD redemption rejected at Circle before the burn. Funds intact, nothing to recover.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Redemption request queued.",
        time: "08:06",
      },
      {
        label: "Circle redemption API",
        state: "failed",
        detail: "Redemption rejected: daily redemption limit exceeded.",
        time: "08:06",
      },
      {
        label: "USDC burn",
        state: "failed",
        detail:
          "Not attempted, request rejected upstream. Funds intact in the Circle Mint account.",
        time: "—",
      },
      {
        label: "Bank credit",
        state: "failed",
        detail: "Not attempted, no burn so nothing to settle.",
        time: "—",
      },
    ],
  },
  {
    id: "EXC-4474",
    type: "Stalled",
    rail: "Wire",
    partner: "Cross River",
    amount: 500_000,
    currency: "USD",
    status: "Investigating",
    ageMinutes: 88,
    summary: "Outbound wire held in sanctions screening before release.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Wire instruction submitted.",
        time: "08:52",
      },
      {
        label: "Cross River wire desk",
        state: "success",
        detail: "Instruction accepted, queued for release.",
        time: "08:56",
      },
      {
        label: "Cross River sanctions screening",
        state: "pending",
        detail:
          "Held for OFAC review before release. Beneficiary name hit a watchlist fuzzy match.",
        time: "—",
      },
      {
        label: "Fedwire execution",
        state: "pending",
        detail: "Not yet released to Fedwire.",
        time: "—",
      },
    ],
  },
  {
    id: "EXC-4475",
    type: "Reject",
    rail: "SEPA",
    partner: "Correspondent Bank",
    amount: 18_400,
    currency: "EUR",
    status: "New",
    ageMinutes: 6,
    summary: "AC04 reject: beneficiary account closed.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "SEPA credit transfer submitted.",
        time: "10:09",
      },
      {
        label: "Correspondent Bank payment gateway",
        state: "success",
        detail: "Instruction forwarded to beneficiary bank.",
        time: "10:10",
      },
      {
        label: "Beneficiary bank",
        state: "failed",
        detail: "AC04 reject: account closed.",
        time: "10:14",
      },
    ],
  },
  {
    id: "EXC-4476",
    type: "Stalled",
    rail: "RTP",
    partner: "Evolve Bank",
    amount: 12_400,
    currency: "USD",
    status: "New",
    ageMinutes: 21,
    summary:
      "RTP payment sent with no completion message. RTP settles in seconds, so 21 min is a hard stall.",
    linkedReconId: "RCN-10234",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "RTP credit transfer submitted.",
        time: "09:59",
      },
      {
        label: "Evolve Bank RTP gateway",
        state: "success",
        detail: "Message sent to The Clearing House RTP network.",
        time: "09:59",
      },
      {
        label: "Receiving participant",
        state: "pending",
        detail:
          "No completion or rejection message received. RTP is instant and irrevocable, so this is well past any normal window.",
        time: "—",
      },
    ],
  },
  {
    id: "EXC-4477",
    type: "Return",
    rail: "ACH",
    partner: "Cross River",
    amount: 950,
    currency: "USD",
    status: "Resolved",
    ageMinutes: 612,
    summary: "R01 insufficient funds. Resolved, rebilled next cycle.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Outbound ACH debit submitted.",
        time: "Yesterday 09:15",
      },
      {
        label: "Cross River ACH gateway",
        state: "success",
        detail: "Entry transmitted to the ACH operator.",
        time: "Yesterday 09:17",
      },
      {
        label: "Receiving bank",
        state: "failed",
        detail: "R01 insufficient funds.",
        time: "Yesterday 23:58",
      },
      {
        label: "Resolution",
        state: "success",
        detail: "Flagged for retry, rebill scheduled next cycle.",
        time: "Yesterday 23:59",
      },
    ],
  },
  {
    id: "EXC-4478",
    type: "Failed conversion",
    rail: "Solana USDC",
    partner: "Circle",
    amount: 4_300,
    currency: "USDC",
    status: "Investigating",
    ageMinutes: 33,
    summary:
      "Mint rejected: USD funding wire hasn't posted to the Circle Mint account yet.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Mint request queued.",
        time: "09:47",
      },
      {
        label: "Circle Mint API",
        state: "failed",
        detail:
          "Rejected: insufficient available balance, USD funding wire not posted.",
        time: "09:47",
      },
      {
        label: "Solana settlement",
        state: "failed",
        detail: "Not attempted, mint rejected upstream.",
        time: "—",
      },
    ],
  },
];

export const treasuryAccounts: TreasuryAccount[] = [
  {
    currency: "USD",
    venue: "USD operating position",
    counterparties: ["Cross River", "Evolve Bank", "Correspondent Bank"],
    openingBalance: 2_179_400,
    target: 2_000_000,
    lastRebalanced: "Today, 06:00",
  },
  {
    currency: "USDC",
    venue: "Circle Mint account",
    counterparties: ["Circle", "OTC Liquidity Desk"],
    openingBalance: 1_025_100,
    target: 1_000_000,
    lastRebalanced: "Yesterday, 18:30",
  },
  {
    currency: "EUR",
    venue: "EUR nostro at correspondent bank",
    counterparties: ["Correspondent Bank"],
    openingBalance: 503_300,
    target: 400_000,
    lastRebalanced: "Today, 06:00",
  },
];
