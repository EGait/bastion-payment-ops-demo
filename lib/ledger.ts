import {
  Currency,
  ReconRow,
  TreasuryAccount,
  TreasuryStatus,
} from "@/data/mockLedger";

// One source of truth for the day.
//
// Treasury accounts carry only an OPENING balance and the counterparties whose
// settlement flows through them. Everything else — today's money in, money
// out, net movement, closing balance, funding status, and any prefunding
// requirement — is derived here from the same reconciliation rows the recon
// table renders. The treasury snapshot and the cash-movement view are two
// presentations of one calculation rather than two hand-written sets of
// numbers that can drift apart.
//
// Amounts come from Bastion's INTERNAL ledger, not the partner-reported
// figure: an unreconciled break means the partner disagrees, but Bastion's own
// books still move on what Bastion recorded. The gap between the two is what
// the recon table's variance column and the "unreconciled variance" KPI
// measure.

export interface CurrencyPosition {
  currency: Currency;
  venue: string;
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  net: number;
  closingBalance: number;
  target: number;
  pctOfTarget: number;
  status: TreasuryStatus;
  /** Amount needed to bring the account back to target; 0 when at or above. */
  prefundRequired: number;
  lastRebalanced: string;
  rowCount: number;
}

// At or above target is Adequate. Within 10% below is a rebalancing
// candidate rather than an alarm. Further below needs prefunding today.
function fundingStatus(closing: number, target: number): TreasuryStatus {
  if (target <= 0) return "Adequate";
  const ratio = closing / target;
  if (ratio >= 1) return "Adequate";
  if (ratio >= 0.9) return "Watch";
  return "Below target";
}

export function buildPositions(
  accounts: TreasuryAccount[],
  rows: ReconRow[]
): CurrencyPosition[] {
  return accounts.map((account) => {
    // Match on currency AND counterparty, so a card never totals flows that
    // don't actually settle through the account it names.
    const forAccount = rows.filter(
      (r) =>
        r.currency === account.currency &&
        account.counterparties.includes(r.counterparty)
    );

    const moneyIn = forAccount
      .filter((r) => r.direction === "in")
      .reduce((sum, r) => sum + r.internalAmount, 0);

    const moneyOut = forAccount
      .filter((r) => r.direction === "out")
      .reduce((sum, r) => sum + r.internalAmount, 0);

    const net = moneyIn - moneyOut;
    const closingBalance = account.openingBalance + net;

    return {
      currency: account.currency,
      venue: account.venue,
      openingBalance: account.openingBalance,
      moneyIn,
      moneyOut,
      net,
      closingBalance,
      target: account.target,
      pctOfTarget:
        account.target > 0
          ? Math.round((closingBalance / account.target) * 100)
          : 0,
      status: fundingStatus(closingBalance, account.target),
      prefundRequired: Math.max(0, account.target - closingBalance),
      lastRebalanced: account.lastRebalanced,
      rowCount: forAccount.length,
    };
  });
}
