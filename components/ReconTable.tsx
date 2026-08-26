"use client";

import { useMemo } from "react";
import { ReconRow } from "@/data/mockLedger";
import { Badge, reconStatusTone } from "@/components/Badge";
import { formatAmount, formatSigned } from "@/lib/format";

export function ReconTable({
  rows,
  breaksOnly,
  onBreaksOnlyChange,
  onPromote,
  onViewException,
}: {
  rows: ReconRow[];
  breaksOnly: boolean;
  onBreaksOnlyChange: (next: boolean) => void;
  onPromote: (reconId: string) => void;
  onViewException: (exceptionId: string) => void;
}) {
  const visibleRows = useMemo(
    () => (breaksOnly ? rows.filter((r) => r.status === "break") : rows),
    [rows, breaksOnly]
  );

  const breakCount = useMemo(
    () => rows.filter((r) => r.status === "break").length,
    [rows]
  );

  const totalsByCurrency = useMemo(() => {
    const totals = new Map<string, { internal: number; partner: number }>();
    for (const row of rows) {
      const entry = totals.get(row.currency) ?? { internal: 0, partner: 0 };
      entry.internal += row.internalAmount;
      entry.partner += row.partnerAmount;
      totals.set(row.currency, entry);
    }
    return Array.from(totals.entries());
  }, [rows]);

  return (
    <section
      aria-labelledby="recon-heading"
      className="rounded-lg border border-border-primary bg-surface-primary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-4 py-3">
        <div>
          <h2
            id="recon-heading"
            className="text-sm font-semibold text-text-primary"
          >
            Daily reconciliation
          </h2>
          <p className="text-xs text-text-secondary">
            Internal ledger entries vs. partner-reported settlement, leg by
            leg — banks, a stablecoin issuer, an OTC liquidity desk, and
            correspondent partners.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-text-secondary select-none">
          <input
            type="checkbox"
            checked={breaksOnly}
            onChange={(e) => onBreaksOnlyChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-accent"
          />
          Show breaks only
          <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[11px] font-medium text-danger-text">
            {breakCount}
          </span>
        </label>
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <caption className="sr-only">
            Daily reconciliation: internal ledger entries compared against
            partner-reported settlement, with break status and linked
            exceptions.
          </caption>
          <thead>
            <tr className="border-b border-border-primary text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <th scope="col" className="px-4 py-2 font-medium">
                ID
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Rail
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Counterparty
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Currency
              </th>
              <th scope="col" className="px-4 py-2 font-medium text-right">
                Internal amount
              </th>
              <th scope="col" className="px-4 py-2 font-medium text-right">
                Partner amount
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Exception
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-primary last:border-0 hover:bg-surface-hover"
              >
                <td className="whitespace-nowrap px-4 py-2.5 align-top font-mono text-xs text-text-secondary">
                  {row.id}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 align-top text-text-primary">
                  {row.rail}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 align-top text-text-primary">
                  {row.counterparty}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <Badge tone="neutral">{row.currency}</Badge>
                </td>
                <td className="px-4 py-2.5 text-right align-top tabular text-text-primary">
                  {formatAmount(row.internalAmount)}
                </td>
                <td className="px-4 py-2.5 text-right align-top tabular text-text-primary">
                  {formatAmount(row.partnerAmount)}
                </td>
                <td className="px-4 py-2.5 align-top">
                  <Badge tone={reconStatusTone(row.status)}>
                    {row.status === "matched" ? "Matched" : "Break"}
                  </Badge>
                  {/* The break reason is the most useful field in this table,
                      so it's rendered rather than hidden in a hover tooltip. */}
                  {row.breakReason && (
                    <div className="mt-1 max-w-[260px] text-[11px] leading-snug text-text-secondary">
                      {row.breakReason}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2.5 align-top">
                  {row.status !== "break" ? (
                    <span className="text-xs text-text-tertiary" aria-hidden="true">
                      —
                    </span>
                  ) : row.linkedExceptionId ? (
                    <button
                      type="button"
                      onClick={() => onViewException(row.linkedExceptionId!)}
                      className="rounded-md border border-info-border bg-info-bg px-2 py-1 text-xs font-medium text-info-text hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                    >
                      View {row.linkedExceptionId}
                      <span aria-hidden="true"> →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onPromote(row.id)}
                      className="rounded-md border border-border-secondary bg-surface-primary px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                    >
                      Promote {row.id} to exception
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-text-tertiary"
                >
                  No breaks — everything reconciled.
                </td>
              </tr>
            )}
          </tbody>
          {totalsByCurrency.length > 0 && (
            <tfoot>
              {totalsByCurrency.map(([currency, t]) => {
                const variance = t.internal - t.partner;
                return (
                  <tr
                    key={currency}
                    className="border-t border-border-primary bg-surface-secondary text-xs font-semibold"
                  >
                    <th
                      scope="row"
                      colSpan={3}
                      className="px-4 py-2 text-left font-semibold text-text-tertiary"
                      title="Gross settlement value reconciled today, per currency — not a balance."
                    >
                      Total reconciled
                    </th>
                    <td className="px-4 py-2">
                      <Badge tone="neutral">{currency}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right tabular text-text-primary">
                      {formatAmount(t.internal)}
                    </td>
                    <td className="px-4 py-2 text-right tabular text-text-primary">
                      {formatAmount(t.partner)}
                    </td>
                    <td
                      className="px-4 py-2 tabular text-text-tertiary"
                      colSpan={2}
                    >
                      {variance === 0
                        ? "Balanced"
                        : `${formatSigned(variance)} net variance`}
                    </td>
                  </tr>
                );
              })}
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
