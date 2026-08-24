"use client";

import { Fragment, useMemo, useState } from "react";
import { ExceptionItem, ExceptionStatus } from "@/data/mockLedger";
import { Badge, exceptionStatusTone } from "@/components/Badge";
import { ExceptionDetail } from "@/components/ExceptionDetail";
import { formatUsd, formatAge } from "@/lib/format";
import { isSlaBreached } from "@/lib/sla";

const FILTERS: Array<ExceptionStatus | "All"> = [
  "All",
  "New",
  "Investigating",
  "Escalated",
  "Resolved",
];

export function ExceptionsQueue({
  items,
  onStatusChange,
  expandedId,
  onExpandChange,
}: {
  items: ExceptionItem[];
  onStatusChange: (id: string, status: ExceptionStatus) => void;
  expandedId: string | null;
  onExpandChange: (id: string | null) => void;
}) {
  const [filter, setFilter] = useState<ExceptionStatus | "All">("All");

  const visible = useMemo(
    () => (filter === "All" ? items : items.filter((e) => e.status === filter)),
    [items, filter]
  );

  return (
    <section className="rounded-lg border border-border-primary bg-surface-primary">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Exceptions queue
          </h2>
          <p className="text-xs text-text-secondary">
            Stalled, returned, rejected, and failed-conversion payments —
            click a row to see the cross-partner trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-brand bg-brand text-text-inverse"
                  : "border-border-secondary bg-surface-primary text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {f}
              {f !== "All" && (
                <span className="ml-1 tabular opacity-80">
                  {items.filter((e) => e.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border-primary text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Rail</th>
              <th className="px-4 py-2 font-medium">Partner</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((exc) => {
              const isOpen = expandedId === exc.id;
              const breached = isSlaBreached(exc);
              return (
                <Fragment key={exc.id}>
                  <tr
                    id={`exception-${exc.id}`}
                    onClick={() => onExpandChange(isOpen ? null : exc.id)}
                    className={`cursor-pointer scroll-mt-4 border-b border-border-primary last:border-0 hover:bg-surface-hover ${
                      isOpen ? "bg-surface-hover" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 16 16"
                          className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          fill="currentColor"
                        >
                          <path d="M6 4l4 4-4 4V4z" />
                        </svg>
                        {exc.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">
                      {exc.type}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">
                      {exc.rail}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">
                      {exc.partner}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-text-primary">
                      {formatUsd(exc.amount, exc.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={exceptionStatusTone(exc.status)}>
                        {exc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">
                      <span
                        title={breached ? "Past SOP escalation target" : undefined}
                        className={
                          breached
                            ? "inline-flex items-center gap-1 font-semibold text-danger-text"
                            : "text-text-secondary"
                        }
                      >
                        {breached && (
                          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                            <path d="M8 1.5 15 14H1L8 1.5zm0 4.5v4M8 11.5h.01" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {formatAge(exc.ageMinutes)}
                      </span>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${exc.id}-detail`} className="border-b border-border-primary last:border-0">
                      <td colSpan={7} className="p-0">
                        <ExceptionDetail
                          exception={exc}
                          onStatusChange={onStatusChange}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-text-tertiary"
                >
                  No exceptions in this state.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
