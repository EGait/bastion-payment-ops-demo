"use client";

import { useMemo, useState } from "react";
import { ReconRow } from "@/data/mockLedger";
import { Badge, reconStatusTone } from "@/components/Badge";
import { formatUsd } from "@/lib/format";

export function ReconTable({ rows }: { rows: ReconRow[] }) {
  const [breaksOnly, setBreaksOnly] = useState(false);

  const visibleRows = useMemo(
    () => (breaksOnly ? rows.filter((r) => r.status === "break") : rows),
    [rows, breaksOnly]
  );

  const breakCount = rows.filter((r) => r.status === "break").length;

  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Daily reconciliation
          </h2>
          <p className="text-xs text-text-secondary">
            Internal ledger vs. partner-reported balances — banks, PFIs,
            liquidity providers, exchanges.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-text-secondary select-none">
          <input
            type="checkbox"
            checked={breaksOnly}
            onChange={(e) => setBreaksOnly(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border-secondary text-accent focus:ring-accent"
          />
          Show breaks only
          <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[11px] font-medium text-danger-text">
            {breakCount}
          </span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border-primary text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">Rail</th>
              <th className="px-4 py-2 font-medium">Counterparty</th>
              <th className="px-4 py-2 font-medium text-right">
                Internal ledger
              </th>
              <th className="px-4 py-2 font-medium text-right">
                Partner ledger
              </th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-primary last:border-0 hover:bg-surface-hover"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">
                  {row.id}
                </td>
                <td className="px-4 py-2.5 text-text-primary">{row.rail}</td>
                <td className="px-4 py-2.5 text-text-primary">
                  {row.counterparty}
                </td>
                <td className="px-4 py-2.5 text-right tabular text-text-primary">
                  {formatUsd(row.internalAmount, row.currency)}
                </td>
                <td className="px-4 py-2.5 text-right tabular text-text-primary">
                  {formatUsd(row.partnerAmount, row.currency)}
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    tone={reconStatusTone(row.status)}
                    title={row.breakReason}
                  >
                    {row.status === "matched" ? "Matched" : "Break"}
                  </Badge>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-text-tertiary"
                >
                  No breaks — everything reconciled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
