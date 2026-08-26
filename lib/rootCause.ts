import { ExceptionItem, TrailHop } from "@/data/mockLedger";

export interface RootCauseSuggestion {
  brokenHop: string;
  rootCause: string;
  nextAction: string;
}

type Category =
  | "complianceHold"
  | "issuerMint"
  | "onchainSettlement"
  | "conversion"
  | "receivingBank"
  | "partnerLedger"
  | "partnerGateway"
  | "unknown";

function categorize(label: string): Category {
  const l = label.toLowerCase();
  // Compliance holds first: a sanctions review sitting on a partner's wire
  // desk is not a gateway problem, and the right next step is completely
  // different from "check their status page".
  if (
    l.includes("sanctions") ||
    l.includes("screening") ||
    l.includes("ofac") ||
    l.includes("compliance")
  )
    return "complianceHold";
  if (l.includes("mint")) return "issuerMint";
  if (l.includes("settlement") || l.includes("solana"))
    return "onchainSettlement";
  if (
    l.includes("off-ramp") ||
    l.includes("conversion") ||
    l.includes("redemption") ||
    l.includes("burn")
  )
    return "conversion";
  if (
    l.includes("bank credit") ||
    l.includes("beneficiary") ||
    l.includes("receiving bank") ||
    l.includes("receiving participant")
  )
    return "receivingBank";
  if (l.includes("ledger") && !l.includes("bastion")) return "partnerLedger";
  if (
    l.includes("gateway") ||
    l.includes("desk") ||
    l.includes("fedwire") ||
    l.includes("correspondent")
  )
    return "partnerGateway";
  return "unknown";
}

const NEXT_ACTIONS: Record<Category, { failed: string; pending: string }> = {
  complianceHold: {
    failed:
      "Treat this as a compliance matter, not a payments one. Loop in Compliance with the beneficiary details and the screening hit; do not resubmit the payment until they clear it.",
    pending:
      "Supply the partner's compliance team with full beneficiary details and purpose of payment. That's what releases a fuzzy-match hold. Escalate internally to Compliance in parallel rather than waiting on the wire desk.",
  },
  issuerMint: {
    failed:
      "Check the funding balance in the Mint account before anything else; most mint rejections are an unposted funding wire rather than an issuer fault. Escalate to the issuer's mint desk with the request reference only if the balance is there.",
    pending:
      "Check the issuer's mint API status before escalating. This step occasionally lags during high network load rather than failing outright.",
  },
  onchainSettlement: {
    failed:
      "Confirm the transaction signature on a Solana explorer before assuming it failed outright. On-chain rejections are rare and usually need resubmission with adjusted parameters rather than escalation.",
    pending:
      "Check the transaction signature on a Solana explorer. If it shows finalized, this is a reporting lag rather than a lost payment.",
  },
  conversion: {
    failed:
      "Confirm whether the burn actually executed before doing anything else. If it didn't, the funds are intact and this is a limit or eligibility problem to raise with the partner's redemption desk, not something to retry blindly.",
    pending:
      "Give the conversion a little more time before escalating; off-ramp confirmations sometimes trail the on-chain leg by several minutes.",
  },
  receivingBank: {
    failed:
      "Contact the receiving bank with the return or reject code, and confirm updated beneficiary details with the customer before resubmitting.",
    pending:
      "Everything upstream completed cleanly, so this reads as a confirmation delay on the receiving side rather than a lost payment. On an instant rail, though, a missing completion message past the settlement window is a hard stall. Raise it with the partner rather than waiting.",
  },
  partnerLedger: {
    failed:
      "Confirm directly with the partner whether the transaction shows on their side before writing off the balance.",
    pending:
      "The payment itself has settled; what's missing is the partner's confirmation. Poll their status endpoint and, if the lag is past their stated SLA, raise it with their ops team. Reconciliation won't resolve this on its own.",
  },
  partnerGateway: {
    failed:
      "Escalate to the partner's operations desk with the exception ID. The failure is isolated to their gateway rather than anything upstream.",
    pending:
      "This step is past its normal turnaround. Check the partner's status page or reach out to their ops desk before escalating internally.",
  },
  unknown: {
    failed:
      "Escalate to the Payment Operations Lead with the exception ID. The failure point doesn't match a recognized pattern and needs manual review.",
    pending:
      "This step is taking longer than usual. Recheck in a few minutes and escalate if it's still open next cycle.",
  },
};

export function suggestRootCause(exception: ExceptionItem): RootCauseSuggestion {
  const breakHop: TrailHop | undefined = exception.trail.find(
    (hop) => hop.state !== "success"
  );

  if (!breakHop) {
    return {
      brokenHop: "none",
      rootCause:
        "Every step in the recorded trail completed successfully. If this exception is still open, the issue likely sits outside the visible trail and needs a manual look.",
      nextAction:
        "Re-check the exception's current status against the partner's own records before closing it out.",
    };
  }

  const category = categorize(breakHop.label);
  const actions = NEXT_ACTIONS[category];
  const state = breakHop.state === "failed" ? "failed" : "pending";

  const priorHops = exception.trail.slice(0, exception.trail.indexOf(breakHop));
  const leadIn =
    priorHops.length > 0
      ? `Every step before ${breakHop.label} completed successfully, so the issue is isolated to this stage. `
      : "";

  const rootCause =
    breakHop.state === "failed"
      ? `${leadIn}${breakHop.label} failed: ${breakHop.detail}`
      : `${leadIn}${breakHop.label} has not confirmed: ${breakHop.detail}`;

  return {
    brokenHop: breakHop.label,
    rootCause,
    nextAction: actions[state],
  };
}
