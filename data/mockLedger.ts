// Mock data layer for the Bastion Payment Ops demo.
//
// Shapes here are deliberately close to what a real payments-ops stack
// exposes: an internal ledger balance next to a partner-reported balance,
// a match/break verdict, and — for exceptions — a hop-by-hop trail across
// the systems a stalled or failed payment could be sitting in.
//
// All data is static and fabricated for demo purposes.

export type Rail = "ACH" | "Wire" | "RTP" | "SWIFT" | "Solana USDC" | "SEPA";

export type Partner =
  | "Circle"
  | "Cross River"
  | "Evolve Bank"
  | "Correspondent Bank";

export type ReconStatus = "matched" | "break";

export interface ReconRow {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  rail: Rail;
  counterparty: Partner;
  currency: "USD" | "USDC" | "EUR";
  internalAmount: number;
  partnerAmount: number;
  status: ReconStatus;
  breakReason?: string;
}

export type ExceptionType =
  | "Stalled"
  | "Return"
  | "Failed conversion"
  | "Reject";

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
  time: string; // HH:MM, 24h, America/Chicago
}

export interface ExceptionItem {
  id: string;
  type: ExceptionType;
  rail: Rail;
  partner: Partner;
  amount: number;
  currency: "USD" | "USDC" | "EUR";
  status: ExceptionStatus;
  ageMinutes: number;
  summary: string;
  trail: TrailHop[];
}

export interface KpiSnapshot {
  settlementLatencyP50Minutes: number;
  settlementLatencyP95Minutes: number;
  latencyDeltaPct: number; // vs. 7-day avg, negative = faster
  exceptionRatePct: number;
  exceptionRateDeltaPct: number; // vs. 7-day avg
  throughputTodayCount: number;
  throughputTodayVolumeUsd: number;
  openBreaksCount: number;
  openBreaksVolumeUsd: number;
}

export const kpiSnapshot: KpiSnapshot = {
  settlementLatencyP50Minutes: 6,
  settlementLatencyP95Minutes: 41,
  latencyDeltaPct: -8,
  exceptionRatePct: 1.8,
  exceptionRateDeltaPct: 0.3,
  throughputTodayCount: 4812,
  throughputTodayVolumeUsd: 38_412_900,
  openBreaksCount: 7,
  openBreaksVolumeUsd: 214_360,
};

export const reconRows: ReconRow[] = [
  {
    id: "RCN-10231",
    date: "2026-08-24",
    rail: "Wire",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 500_000,
    partnerAmount: 500_000,
    status: "matched",
  },
  {
    id: "RCN-10232",
    date: "2026-08-24",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 1_000_000,
    partnerAmount: 999_000,
    status: "break",
    breakReason: "Amount mismatch — $1,000 short on partner side",
  },
  {
    id: "RCN-10233",
    date: "2026-08-24",
    rail: "ACH",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 84_250,
    partnerAmount: 84_250,
    status: "matched",
  },
  {
    id: "RCN-10234",
    date: "2026-08-24",
    rail: "RTP",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 12_400,
    partnerAmount: 0,
    status: "break",
    breakReason: "Missing on partner ledger — not yet settled",
  },
  {
    id: "RCN-10235",
    date: "2026-08-24",
    rail: "SWIFT",
    counterparty: "Correspondent Bank",
    currency: "USD",
    internalAmount: 2_150_000,
    partnerAmount: 2_150_000,
    status: "matched",
  },
  {
    id: "RCN-10236",
    date: "2026-08-24",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 640_000,
    partnerAmount: 640_000,
    status: "matched",
  },
  {
    id: "RCN-10237",
    date: "2026-08-24",
    rail: "SEPA",
    counterparty: "Correspondent Bank",
    currency: "EUR",
    internalAmount: 96_800,
    partnerAmount: 95_800,
    status: "break",
    breakReason: "Amount mismatch — €1,000 short, likely FX rate variance",
  },
  {
    id: "RCN-10238",
    date: "2026-08-24",
    rail: "ACH",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 27_300,
    partnerAmount: 27_300,
    status: "matched",
  },
  {
    id: "RCN-10239",
    date: "2026-08-24",
    rail: "Wire",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 315_000,
    partnerAmount: 315_000,
    status: "matched",
  },
  {
    id: "RCN-10240",
    date: "2026-08-24",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 48_900,
    partnerAmount: 0,
    status: "break",
    breakReason: "On internal ledger, not yet visible on Circle mint API",
  },
  {
    id: "RCN-10241",
    date: "2026-08-24",
    rail: "RTP",
    counterparty: "Evolve Bank",
    currency: "USD",
    internalAmount: 8_050,
    partnerAmount: 8_050,
    status: "matched",
  },
  {
    id: "RCN-10242",
    date: "2026-08-24",
    rail: "SWIFT",
    counterparty: "Correspondent Bank",
    currency: "USD",
    internalAmount: 1_204_500,
    partnerAmount: 1_202_500,
    status: "break",
    breakReason: "Amount mismatch — $2,000 short, correspondent fee deducted",
  },
  {
    id: "RCN-10243",
    date: "2026-08-24",
    rail: "ACH",
    counterparty: "Cross River",
    currency: "USD",
    internalAmount: 61_000,
    partnerAmount: 61_000,
    status: "matched",
  },
  {
    id: "RCN-10244",
    date: "2026-08-24",
    rail: "Solana USDC",
    counterparty: "Circle",
    currency: "USDC",
    internalAmount: 152_000,
    partnerAmount: 152_000,
    status: "matched",
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
    summary: "Mint confirmed on-chain but not reflected on partner ledger.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Debit posted, transfer initiated.",
        time: "08:12",
      },
      {
        label: "Circle mint API",
        state: "success",
        detail: "Mint request accepted, tx hash returned.",
        time: "08:12",
      },
      {
        label: "Solana settlement",
        state: "success",
        detail: "Transaction finalized on-chain, 32 confirmations.",
        time: "08:13",
      },
      {
        label: "Partner bank credit",
        state: "pending",
        detail: "No credit confirmation from Circle webhook after 47 min.",
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
    summary: "R03 return — no account/unable to locate account.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Outbound ACH batch submitted.",
        time: "09:41",
      },
      {
        label: "Evolve Bank ACH gateway",
        state: "success",
        detail: "Batch accepted, entry transmitted to NACHA.",
        time: "09:42",
      },
      {
        label: "Receiving bank",
        state: "failed",
        detail: "R03 return code — no account / unable to locate account.",
        time: "09:53",
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
    summary: "USDC → USD off-ramp conversion rejected by partner.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Conversion request queued.",
        time: "07:05",
      },
      {
        label: "Circle mint API",
        state: "success",
        detail: "Burn confirmed, conversion request forwarded.",
        time: "07:06",
      },
      {
        label: "Circle off-ramp",
        state: "failed",
        detail: "Conversion rejected — daily off-ramp limit exceeded.",
        time: "07:09",
      },
      {
        label: "Partner bank credit",
        state: "failed",
        detail: "Not attempted — upstream conversion failed.",
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
    summary: "Outbound wire stuck in intermediary review.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Wire instruction submitted.",
        time: "06:20",
      },
      {
        label: "Cross River wire desk",
        state: "success",
        detail: "Instruction accepted, sent to Fedwire.",
        time: "06:24",
      },
      {
        label: "Fedwire / correspondent",
        state: "pending",
        detail: "Held for intermediary bank compliance review.",
        time: "—",
      },
      {
        label: "Beneficiary bank credit",
        state: "pending",
        detail: "Awaiting release from intermediary.",
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
    summary: "AC04 reject — beneficiary account closed.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "SEPA credit transfer submitted.",
        time: "10:02",
      },
      {
        label: "Correspondent Bank payment gateway",
        state: "success",
        detail: "Instruction forwarded to beneficiary bank.",
        time: "10:03",
      },
      {
        label: "Beneficiary bank",
        state: "failed",
        detail: "AC04 reject — account closed.",
        time: "10:07",
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
    summary: "RTP payment sent, no settlement confirmation yet.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "RTP credit transfer submitted.",
        time: "09:32",
      },
      {
        label: "Evolve Bank RTP gateway",
        state: "success",
        detail: "Message sent to The Clearing House network.",
        time: "09:32",
      },
      {
        label: "Receiving participant",
        state: "pending",
        detail: "No completion message received (SLA: 15 sec — exceeded).",
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
    summary: "R01 insufficient funds — resolved, rebilled next cycle.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Outbound ACH debit submitted.",
        time: "Yesterday",
      },
      {
        label: "Cross River ACH gateway",
        state: "success",
        detail: "Entry transmitted.",
        time: "Yesterday",
      },
      {
        label: "Receiving bank",
        state: "failed",
        detail: "R01 insufficient funds.",
        time: "Yesterday",
      },
      {
        label: "Resolution",
        state: "success",
        detail: "Flagged for retry, rebill scheduled next cycle.",
        time: "Yesterday",
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
    summary: "On-chain mint failed — insufficient reserve confirmation.",
    trail: [
      {
        label: "Bastion ledger",
        state: "success",
        detail: "Mint request queued.",
        time: "10:15",
      },
      {
        label: "Circle mint API",
        state: "failed",
        detail: "Rejected — reserve attestation lag on Circle's side.",
        time: "10:16",
      },
      {
        label: "Solana settlement",
        state: "failed",
        detail: "Not attempted — upstream mint failed.",
        time: "—",
      },
    ],
  },
];