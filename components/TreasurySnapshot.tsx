import { TreasuryBalance } from "@/data/mockLedger";
import { formatUsd } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/Badge";

function statusTone(status: TreasuryBalance["status"]): BadgeTone {
  switch (status) {
    case "Adequate":
      return "success";
    case "Low":
      return "warning";
    case "Rebalancing":
      return "info";
  }
}

export function TreasurySnapshot({ balances }: { balances: TreasuryBalance[] }) {
  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary">
      <div className="border-b border-border-primary px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">
          Treasury snapshot
        </h2>
        <p className="text-xs text-text-secondary">
          Operating balances vs. target, by venue. Feeds prefunding and
          rebalancing decisions alongside today&apos;s throughput and open
          breaks.
        </p>
      </div>
      <div className="grid gap-px bg-border-primary sm:grid-cols-3">
        {balances.map((b) => {
          const pctOfTarget = Math.round((b.balance / b.target) * 100);
          return (
            <div key={b.venue} className="bg-surface-primary p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  {b.currency}
                </span>
                <Badge tone={statusTone(b.status)}>{b.status}</Badge>
              </div>
              <div className="mt-1.5 text-lg font-semibold tabular text-text-primary">
                {formatUsd(b.balance, b.currency)}
              </div>
              <div className="text-xs text-text-secondary">{b.venue}</div>
              <div className="mt-2 text-xs tabular text-text-tertiary">
                Target {formatUsd(b.target, b.currency)} ({pctOfTarget}%)
              </div>
              <div className="mt-1 text-[11px] text-text-tertiary">
                Last rebalanced {b.lastRebalanced}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
