import { ExceptionItem, TrailHop } from "@/data/mockLedger";

export interface RootCauseSuggestion {
  brokenHop: string;
  rootCause: string;
  nextAction: string;
}

type Category =
  | "issuerMint"
  | "onchainSettlement"
  | "conversion"
  | "receivingBank"
  | "partnerLedger"
  | "partnerGateway"
  | "unknown";

function categorize(label: string): Category {
  const l = label.toLowerCase();
  if (l.includes("mint")) return "issuerMint";
  if (l.includes("settlement") || l.includes("solana")) return "onchainSettlement";
  if (l.includes("off-ramp") || l.includes("conversion")) return "conversion";
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
  issuerMint: {
    failed:
      "Escalate directly to the issuer's mint desk with the transaction reference. This failed before anything reached the chain, so it's safe to retry once they confirm the cause.",
    pending:
      "Check the issuer's mint API status before escalating, this step occasionally lags during high network load rather than being a real failure.",
  },
  onchainSettlement: {
    failed:
      "Confirm the transaction hash on a Solana block explorer before assuming it failed outright, on-chain rejections are rare and may just need resubmission with adjusted parameters.",
    pending:
      "Check the transaction hash on a Solana block explorer. If it shows confirmed on-chain, this is a reporting lag, not a lost payment.",
  },
  conversion: {
    failed:
      "Do not resubmit the underlying mint or burn. Escalate the conversion specifically to the partner's off-ramp desk, the on-chain leg already completed.",
    pending:
      "Give the conversion a little more time before escalating, off-ramp confirmations sometimes trail the on-chain leg by several minutes.",
  },
  receivingBank: {
    failed:
      "Contact the receiving bank with the return or reject code, and confirm updated beneficiary details with the customer before resubmitting.",
    pending:
      "Everything upstream completed cleanly, so this reads as a confirmation delay on the receiving side rather than a lost payment. Worth one more check before escalating.",
  },
  partnerLedger: {
    failed:
      "Confirm directly with the partner whether the transaction shows on their side before writing off the balance.",
    pending:
      "This was just promoted from a recon break and hasn't been independently verified with the partner yet, follow up with them directly rather than re-running reconciliation.",
  },
  partnerGateway: {
    failed:
      "Escalate to the partner's operations desk with the exception ID, the failure is isolated to their gateway rather than anything upstream.",
    pending:
      "This step is past its normal turnaround. Check the partner's status page or reach out to their ops desk before escalating internally.",
  },
  unknown: {
    failed:
      "Escalate to the Payment Operations Lead with the exception ID, the failure point doesn't match a recognized pattern and needs manual review.",
    pending:
      "This step is taking longer than usual. Recheck in a few minutes, and escalate if it's still open next cycle.",
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