import { Dashboard } from "@/components/Dashboard";
import {
  kpiSnapshot,
  reconRows,
  exceptions,
  treasuryBalances,
} from "@/data/mockLedger";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-brand text-[10px] font-bold text-text-inverse">
            B
          </span>
          Payment Operations
        </div>
        <h1 className="text-xl font-semibold text-text-primary">
          Reconciliation &amp; exceptions
        </h1>
        <p className="text-sm text-text-secondary">
          Live view of today&apos;s crypto and fiat settlement across banks,
          PFIs, liquidity providers, and exchanges.
        </p>
      </header>

      <Dashboard
        kpi={kpiSnapshot}
        initialRecon={reconRows}
        initialExceptions={exceptions}
        treasuryBalances={treasuryBalances}
      />

      <footer className="mt-2 border-t border-border-primary pt-4 text-xs text-text-tertiary">
        Portfolio demo built for the Bastion Payment Operations Associate
        application. All data is mocked — no real accounts, partners, or
        transactions.
      </footer>
    </div>
  );
}
