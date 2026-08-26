import { DashboardKpis } from "@/lib/kpi";
import { formatCompactUsd } from "@/lib/format";

function DeltaTag({ value, invert = false }: { value: number; invert?: boolean }) {
  const isGood = invert ? value <= 0 : value >= 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`text-xs font-medium ${
        isGood ? "text-success-text" : "text-danger-text"
      }`}
    >
      {sign}
      {value}% vs. 7d avg
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[180px] rounded-lg border border-border-primary bg-surface-primary p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular text-text-primary">
        {value}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
        {sub && <span>{sub}</span>}
        {delta}
      </div>
    </div>
  );
}

export function KPIStrip({ kpi }: { kpi: DashboardKpis }) {
  return (
    <div className="flex flex-wrap gap-3">
      <StatCard
        label="Settlement latency"
        value={`${kpi.settlementLatencyAvgMinutes}m avg`}
        sub="submission → partner ack"
        delta={<DeltaTag value={kpi.latencyDeltaPct} invert />}
      />
      <StatCard
        label="Exception rate"
        value={`${kpi.exceptionRatePct}%`}
        sub={`${kpi.exceptionCount} of ${kpi.throughputTodayCount.toLocaleString(
          "en-US"
        )} payments today`}
      />
      <StatCard
        label="Throughput today"
        value={kpi.throughputTodayCount.toLocaleString("en-US")}
        sub={`${formatCompactUsd(kpi.throughputTodayVolumeUsd)} moved`}
      />
      <StatCard
        label="Open breaks"
        value={`${kpi.openBreaksCount}`}
        sub={`${formatCompactUsd(
          kpi.openBreaksVarianceUsd
        )} unreconciled variance`}
      />
    </div>
  );
}
