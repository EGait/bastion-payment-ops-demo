import {
  ExceptionItem,
  KpiSnapshot,
  ReconRow,
  toUsd,
} from "@/data/mockLedger";

// KPIs the strip displays. Anything that CAN be computed from the rows on
// screen IS computed from them, so the headline numbers can't contradict the
// tables underneath — including after an operator promotes a break to an
// exception, which moves the exception count in real time.
//
// Settlement latency and throughput stay fixed inputs: in a real system
// they'd come from the processor, not from this handful of recon rows.
export interface DashboardKpis {
  settlementLatencyAvgMinutes: number;
  latencyDeltaPct: number;
  exceptionCount: number;
  exceptionRatePct: number;
  throughputTodayCount: number;
  throughputTodayVolumeUsd: number;
  openBreaksCount: number;
  openBreaksVarianceUsd: number;
}

export function deriveKpis(
  base: KpiSnapshot,
  rows: ReconRow[],
  exceptions: ExceptionItem[]
): DashboardKpis {
  const breaks = rows.filter((r) => r.status === "break");

  // The figure at stake on a break is the unreconciled DELTA between
  // Bastion's ledger and the partner's, not the payment's full value — a
  // $1.2M wire that's $35 short puts $35 in question, not $1.2M. Absolute
  // value per row, so two breaks in opposite directions can't cancel each
  // other out and hide themselves. Mixed currencies are expressed in USD at
  // the demo's frozen rates.
  const openBreaksVarianceUsd = breaks.reduce(
    (sum, r) =>
      sum + toUsd(Math.abs(r.internalAmount - r.partnerAmount), r.currency),
    0
  );

  const exceptionRatePct =
    base.throughputTodayCount > 0
      ? (exceptions.length / base.throughputTodayCount) * 100
      : 0;

  return {
    settlementLatencyAvgMinutes: base.settlementLatencyAvgMinutes,
    latencyDeltaPct: base.latencyDeltaPct,
    exceptionCount: exceptions.length,
    exceptionRatePct: Number(exceptionRatePct.toFixed(2)),
    throughputTodayCount: base.throughputTodayCount,
    throughputTodayVolumeUsd: base.throughputTodayVolumeUsd,
    openBreaksCount: breaks.length,
    openBreaksVarianceUsd: Math.round(openBreaksVarianceUsd),
  };
}
