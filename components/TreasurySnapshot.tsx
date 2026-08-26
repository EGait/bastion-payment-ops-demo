import { CurrencyPosition } from "@/lib/ledger";
import { formatAmount, formatSigned } from "@/lib/format";
import { Badge, treasuryStatusTone } from "@/components/Badge";

export function TreasurySnapshot({
  positions,
}: {
  positions: CurrencyPosition[];
}) {
  return (
    <section
      aria-labelledby="treasury-heading"
      className="rounded-lg border border-border-primary bg-surface-primary"
    >
      <div className="border-b border-border-primary px-4 py-3">
        <h2
          id="treasury-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Treasury snapshot
        </h2>
        <p className="text-xs text-text-secondary">
          Closing balances against target, by account. Each one is the
          opening balance plus today&apos;s net movement.
        </p>
      </div>
      <div className="grid gap-px bg-border-primary sm:grid-cols-3">
        {positions.map((p) => (
          <div key={p.currency} className="bg-surface-primary p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                {p.currency}
              </span>
              <Badge tone={treasuryStatusTone(p.status)}>{p.status}</Badge>
            </div>
            <div className="mt-1.5 text-lg font-semibold tabular text-text-primary">
              {formatAmount(p.closingBalance)}
            </div>
            <div className="text-xs text-text-secondary">{p.venue}</div>
            <div className="mt-2 text-xs tabular text-text-tertiary">
              Target {formatAmount(p.target)} ({p.pctOfTarget}%)
            </div>

            {p.prefundRequired > 0 ? (
              <div className="mt-2 rounded border border-warning-border bg-warning-bg px-2 py-1 text-[11px] font-medium text-warning-text">
                Prefund {formatAmount(p.prefundRequired)} {p.currency} to reach
                target
              </div>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[11px] text-text-tertiary">
              <span>Net today</span>
              <span
                className={`tabular font-medium ${
                  p.net > 0
                    ? "text-success-text"
                    : p.net < 0
                      ? "text-danger-text"
                      : "text-text-tertiary"
                }`}
              >
                {formatSigned(p.net)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Last rebalanced {p.lastRebalanced}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
