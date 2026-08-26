"use client";

import { useEffect, useRef, useState } from "react";
import { ExceptionItem, ExceptionStatus, HopState } from "@/data/mockLedger";
import { formatUsd, formatAge } from "@/lib/format";
import { suggestRootCause, type RootCauseSuggestion } from "@/lib/rootCause";

const STATUS_OPTIONS: ExceptionStatus[] = [
  "New",
  "Investigating",
  "Escalated",
  "Resolved",
];

const HOP_LABEL: Record<HopState, string> = {
  success: "Completed",
  failed: "Failed",
  pending: "Pending",
};

function HopIcon({ state }: { state: HopState }) {
  const shared =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ring-inset";

  if (state === "success") {
    return (
      <span
        className={`${shared} bg-success-bg text-success-text ring-success-border`}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span
        className={`${shared} bg-danger-bg text-danger-text ring-danger-border`}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`${shared} bg-warning-bg text-warning-text ring-warning-border`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 5.2V8L9.8 9.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ExceptionDetail({
  exception,
  slaTargetMinutes,
  breached,
  onStatusChange,
}: {
  exception: ExceptionItem;
  slaTargetMinutes: number;
  breached: boolean;
  onStatusChange: (id: string, status: ExceptionStatus) => void;
}) {
  const [suggestion, setSuggestion] = useState<RootCauseSuggestion | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleSuggest() {
    setLoading(true);
    setSuggestion(null);
    // Deliberate short delay. This is a rules engine reading the trail below,
    // not a live model call, but an instant result reads as a hardcoded
    // string rather than as work being done.
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setSuggestion(suggestRootCause(exception));
      setLoading(false);
    }, 700);
  }

  return (
    <div className="@container bg-surface-secondary p-4">
      <div className="grid gap-5 @3xl:grid-cols-[1fr_260px]">
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Diagnostic trail
          </h3>
          <ol className="relative flex list-none items-start gap-0 overflow-x-auto rounded-md border border-border-primary bg-surface-primary p-4">
            {exception.trail.map((hop, i) => (
              <li key={hop.label} className="flex items-start">
                <div className="flex w-[168px] flex-col items-start gap-1.5">
                  <HopIcon state={hop.state} />
                  <div className="text-xs font-semibold text-text-primary">
                    {hop.label}
                    <span className="sr-only">, {HOP_LABEL[hop.state]}</span>
                  </div>
                  <div className="text-[11px] leading-snug text-text-secondary">
                    {hop.detail}
                  </div>
                  <div className="font-mono text-[11px] text-text-tertiary">
                    {hop.time}
                  </div>
                </div>
                {i < exception.trail.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="mt-3 h-px w-8 shrink-0 bg-border-secondary"
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-secondary bg-surface-primary px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5 text-accent"
                fill="currentColor"
              >
                <path d="M8 1.5l1.2 3.3 3.3 1.2-3.3 1.2L8 10.5l-1.2-3.3-3.3-1.2 3.3-1.2L8 1.5zM13 9.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z" />
              </svg>
              {loading ? "Analyzing trail..." : "Suggest root cause"}
            </button>

            <div aria-live="polite">
              {suggestion && (
                <div className="mt-2 space-y-2 rounded-md border border-info-border bg-info-bg px-3 py-2.5 text-xs leading-relaxed text-info-text">
                  <div>
                    <span className="font-semibold">Root cause: </span>
                    {suggestion.rootCause}
                  </div>
                  <div>
                    <span className="font-semibold">Suggested next action: </span>
                    {suggestion.nextAction}
                  </div>
                  <div className="border-t border-info-border pt-1.5 text-[10px] text-text-tertiary">
                    Rules engine, not a model call. It reads the trail above,
                    finds the first hop that didn&apos;t succeed, and pulls the
                    next action from that category&apos;s playbook.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-border-primary bg-surface-primary p-3 text-xs">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
              <dt className="text-text-tertiary">Type</dt>
              <dd className="text-right text-text-primary">{exception.type}</dd>
              <dt className="text-text-tertiary">Rail</dt>
              <dd className="text-right text-text-primary">{exception.rail}</dd>
              <dt className="text-text-tertiary">Partner</dt>
              <dd className="text-right text-text-primary">
                {exception.partner}
              </dd>
              <dt className="text-text-tertiary">Amount</dt>
              <dd className="text-right tabular text-text-primary">
                {formatUsd(exception.amount, exception.currency)}
              </dd>
              <dt className="text-text-tertiary">Age</dt>
              <dd
                className={`text-right tabular ${
                  breached ? "font-semibold text-danger-text" : "text-text-primary"
                }`}
              >
                {formatAge(exception.ageMinutes)}
              </dd>
              <dt className="text-text-tertiary">SLA target</dt>
              <dd className="text-right tabular text-text-primary">
                {formatAge(slaTargetMinutes)}
                <span className="block text-[10px] font-normal text-text-tertiary">
                  {exception.rail} · {exception.type}
                </span>
              </dd>
            </dl>
          </div>

          {exception.linkedReconId && (
            <p className="text-[11px] text-text-tertiary">
              From recon row{" "}
              <span className="font-mono">{exception.linkedReconId}</span>
            </p>
          )}

          <label className="text-xs font-medium text-text-secondary">
            Status
            <select
              value={exception.status}
              onChange={(e) =>
                onStatusChange(exception.id, e.target.value as ExceptionStatus)
              }
              className="mt-1 block w-full rounded-md border border-border-secondary bg-surface-primary px-2.5 py-1.5 text-sm text-text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <p className="text-[11px] leading-relaxed text-text-tertiary">
            {exception.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
