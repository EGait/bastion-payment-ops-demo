"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExceptionItem,
  ExceptionStatus,
  ExceptionType,
  KpiSnapshot,
  ReconRow,
  TreasuryAccount,
} from "@/data/mockLedger";
import { buildPositions } from "@/lib/ledger";
import { deriveKpis } from "@/lib/kpi";
import { KPIStrip } from "@/components/KPIStrip";
import { TreasurySnapshot } from "@/components/TreasurySnapshot";
import { ReconTable } from "@/components/ReconTable";
import { ExceptionsQueue, type QueueFilter } from "@/components/ExceptionsQueue";
import { CreditsDebits } from "@/components/CreditsDebits";

type DashboardTab = "overview" | "movement";

const TABS: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "movement", label: "Cash movement" },
];

// A break where the partner reports nothing at all is a stalled payment. A
// break where both sides posted but disagree on the amount is a different
// animal, nothing is stuck and the books just don't agree, so it gets its own
// type and its own (longer) SLA clock.
function exceptionTypeForBreak(row: ReconRow): ExceptionType {
  return row.partnerAmount === 0 ? "Stalled" : "Recon break";
}

export function Dashboard({
  kpi,
  initialRecon,
  initialExceptions,
  treasuryAccounts,
}: {
  kpi: KpiSnapshot;
  initialRecon: ReconRow[];
  initialExceptions: ExceptionItem[];
  treasuryAccounts: TreasuryAccount[];
}) {
  const [reconRows, setReconRows] = useState(initialRecon);
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [expandedId, setExpandedId] = useState<string | null>(
    initialExceptions[0]?.id ?? null
  );
  const [tab, setTab] = useState<DashboardTab>("overview");

  // Filters live here rather than inside the tables, so switching tabs doesn't
  // silently reset an operator's view, and so focusing an exception can clear
  // a filter that would otherwise hide it.
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("All");
  const [breaksOnly, setBreaksOnly] = useState(false);

  const promoteCounter = useRef(0);
  const pendingScrollId = useRef<string | null>(null);

  // Everything downstream reads from the same rows, so the KPI strip, the
  // treasury snapshot, and the cash-movement view stay in agreement, even
  // after an operator promotes a break to an exception.
  const positions = useMemo(
    () => buildPositions(treasuryAccounts, reconRows),
    [treasuryAccounts, reconRows]
  );
  const kpis = useMemo(
    () => deriveKpis(kpi, reconRows, exceptions),
    [kpi, reconRows, exceptions]
  );

  // Scroll after commit rather than inside the click handler, so the target
  // row is guaranteed to exist in the DOM.
  useEffect(() => {
    const id = pendingScrollId.current;
    if (!id) return;
    pendingScrollId.current = null;
    document
      .getElementById(`exception-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [expandedId, tab, queueFilter]);

  function handleStatusChange(id: string, status: ExceptionStatus) {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  }

  function promotedException(row: ReconRow): ExceptionItem {
    promoteCounter.current += 1;
    // The amount in question is the unreconciled DELTA, not the payment's
    // full value. Same rule the "unreconciled variance" KPI uses. When
    // the partner reports nothing, the delta is the whole payment anyway.
    const variance = Math.abs(row.internalAmount - row.partnerAmount);
    return {
      id: `EXC-${5000 + promoteCounter.current}`,
      type: exceptionTypeForBreak(row),
      rail: row.rail,
      partner: row.counterparty,
      amount: variance,
      currency: row.currency,
      status: "New",
      ageMinutes: 0,
      summary: `Promoted from recon break ${row.id}: ${
        row.breakReason ?? "unmatched balance"
      }`,
      linkedReconId: row.id,
      trail: [
        {
          label: "Bastion ledger",
          state: "success",
          detail: "Recon break promoted to a tracked exception.",
          time: "Just now",
        },
        {
          label: `${row.counterparty} ledger`,
          state: "pending",
          detail: row.breakReason ?? "Awaiting partner confirmation.",
          time: "—",
        },
      ],
    };
  }

  function handlePromote(reconId: string) {
    const row = reconRows.find((r) => r.id === reconId);
    if (!row) return;
    const newException = promotedException(row);
    setExceptions((prev) => [newException, ...prev]);
    setReconRows((prev) =>
      prev.map((r) =>
        r.id === reconId ? { ...r, linkedExceptionId: newException.id } : r
      )
    );
    focusException(newException.id);
  }

  function focusException(exceptionId: string) {
    setTab("overview");
    // Without this, jumping to an exception that the current filter hides is
    // a silent no-op, since the row simply isn't rendered.
    setQueueFilter("All");
    setExpandedId(exceptionId);
    pendingScrollId.current = exceptionId;
  }

  return (
    <>
      <div
        role="group"
        aria-label="Dashboard views"
        className="flex gap-1 border-b border-border-primary"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus ${
              tab === t.id
                ? "border-brand text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <KPIStrip kpi={kpis} />

      {tab === "overview" ? (
        <>
          <TreasurySnapshot positions={positions} />
          <ReconTable
            rows={reconRows}
            breaksOnly={breaksOnly}
            onBreaksOnlyChange={setBreaksOnly}
            onPromote={handlePromote}
            onViewException={focusException}
          />
          <ExceptionsQueue
            items={exceptions}
            filter={queueFilter}
            onFilterChange={setQueueFilter}
            onStatusChange={handleStatusChange}
            expandedId={expandedId}
            onExpandChange={setExpandedId}
          />
        </>
      ) : (
        <CreditsDebits rows={reconRows} positions={positions} />
      )}
    </>
  );
}
