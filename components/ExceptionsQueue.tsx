"use client";

import { Fragment, useMemo } from "react";
import { ExceptionItem, ExceptionStatus } from "@/data/mockLedger";
import { Badge, exceptionStatusTone } from "@/components/Badge";
import { ExceptionDetail } from "@/components/ExceptionDetail";
import { formatAmount, formatAge } from "@/lib/format";
import { isSlaBreached, slaTargetMinutes } from "@/lib/sla";

export type QueueFilter = ExceptionStatus | "All";

const FILTERS: QueueFilter[] = [
  "All",
  "New",
  "Investigating",
  "Escalated",
  "Resolved",
];

export function ExceptionsQueue({
  items,
  filter,
  onFilterChange,
  onStatusChange,
  expandedId,
  onExpandChange,
}: {
  items: ExceptionItem[];
  filter: QueueFilter;
  onFilterChange: (next: QueueFilter) => void;
  onStatusChange: (id: string, status: ExceptionStatus) => void;
  expandedId: string | null;
  onExpandChange: (id: string | null) => void;
}) {
  const visible = useMemo(
    () => (filter === "All" ? items : items.filter((e) => e.status === filter)),
    [items, filter]
  );

  return (
    <section
      aria-labelledby="queue-heading"
      className="rounded-lg border border-border-primary bg-surface-primary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-4 py-3">
        <div>
          <h2
            id="queue-heading"
            className="text-sm font-semibold text-text-primary"
          >
            Exceptions queue
          </h2>
          <p className="text-xs text-text-secondary">
            Stalled, returned, rejected, and failed-conversion payments —
            open a row to see the cross-partner trail.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter exceptions by status"
          className="flex flex-wrap gap-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => onFilterChange(f)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus ${
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

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <caption className="sr-only">
            Open payment exceptions with type, rail, partner, amount, status
            and age against SLA.
          </caption>
          <thead>
            <tr className="border-b border-border-primary text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <th scope="col" className="px-4 py-2 font-medium">
                ID
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Rail
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Partner
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Currency
              </th>
              <th scope="col" className="px-4 py-2 font-medium text-right">
                Amount
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-2 font-medium text-right">
                Age
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((exc) => {
              const isOpen = expandedId === exc.id;
              const breached = isSlaBreached(exc);
              const target = slaTargetMinutes(exc.type, exc.rail);
              const detailId = `exception-detail-${exc.id}`;
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
                      {/* A real button so the row is reachable and operable by
                          keyboard; the row click is a mouse-only convenience. */}
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={detailId}
                        onClick={(e) => {
                          e.stopPropagation();
                          onExpandChange(isOpen ? null : exc.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded font-mono text-xs text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          className={`h-3 w-3 shrink-0 text-text-tertiary transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          fill="currentColor"
                        >
                          <path d="M6 4l4 4-4 4V4z" />
                        </svg>
                        {exc.id}
                        <span className="sr-only">
                          {isOpen ? " — hide" : " — show"} diagnostic trail
                        </span>
                      </button>
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
                    <td className="px-4 py-2.5">
                      <Badge tone="neutral">{exc.currency}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-text-primary">
                      {formatAmount(exc.amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={exceptionStatusTone(exc.status)}>
                        {exc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">
                      <span
                        className={
                          breached
                            ? "inline-flex items-center gap-1 font-semibold text-danger-text"
                            : "text-text-secondary"
                        }
                      >
                        {breached && (
                          <>
                            <svg
                              viewBox="0 0 16 16"
                              aria-hidden="true"
                              className="h-3 w-3"
                              fill="none"
                            >
                              <path
                                d="M8 1.5 15 14H1L8 1.5zm0 4.5v4M8 11.5h.01"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="sr-only">
                              Past SLA — target {formatAge(target)}.{" "}
                            </span>
                          </>
                        )}
                        {formatAge(exc.ageMinutes)}
                      </span>
                      <div className="text-[11px] font-normal text-text-tertiary">
                        target {formatAge(target)}
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border-primary last:border-0">
                      <td colSpan={8} className="p-0">
                        <div id={detailId}>
                          <ExceptionDetail
                            exception={exc}
                            slaTargetMinutes={target}
                            breached={breached}
                            onStatusChange={onStatusChange}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={8}
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
