"use client";

import { useState } from "react";
import {
  ExceptionItem,
  ExceptionStatus,
  KpiSnapshot,
  ReconRow,
  TreasuryBalance,
} from "@/data/mockLedger";
import { KPIStrip } from "@/components/KPIStrip";
import { TreasurySnapshot } from "@/components/TreasurySnapshot";
import { ReconTable } from "@/components/ReconTable";
import { ExceptionsQueue } from "@/components/ExceptionsQueue";

let promoteCounter = 0;

function promotedException(row: ReconRow): ExceptionItem {
  promoteCounter += 1;
  return {
    id: `EXC-${5000 + promoteCounter}`,
    type: "Stalled",
    rail: row.rail,
    partner: row.counterparty,
    amount: row.internalAmount,
    currency: row.currency,
    status: "New",
    ageMinutes: 0,
    summary: `Promoted from recon break ${row.id}: ${row.breakReason ?? "unmatched balance"}.`,
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

export function Dashboard({
  kpi,
  initialRecon,
  initialExceptions,
  treasuryBalances,
}: {
  kpi: KpiSnapshot;
  initialRecon: ReconRow[];
  initialExceptions: ExceptionItem[];
  treasuryBalances: TreasuryBalance[];
}) {
  const [reconRows, setReconRows] = useState(initialRecon);
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [expandedId, setExpandedId] = useState<string | null>(
    initialExceptions[0]?.id ?? null
  );

  function handleStatusChange(id: string, status: ExceptionStatus) {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
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
    setExpandedId(exceptionId);
    // Let the newly expanded row render before scrolling to it.
    requestAnimationFrame(() => {
      document
        .getElementById(`exception-${exceptionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <>
      <KPIStrip kpi={kpi} />
      <TreasurySnapshot balances={treasuryBalances} />
      <ReconTable
        rows={reconRows}
        onPromote={handlePromote}
        onViewException={focusException}
      />
      <ExceptionsQueue
        items={exceptions}
        onStatusChange={handleStatusChange}
        expandedId={expandedId}
        onExpandChange={setExpandedId}
      />
    </>
  );
}
