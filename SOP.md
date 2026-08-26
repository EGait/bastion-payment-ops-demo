# SOP: Daily Reconciliation & Exception Handling

**Owner:** Payment Operations
**Applies to:** Fiat and stablecoin settlement across banking partners, PFIs,
liquidity providers, and on/off-ramp rails
**Companion tool:** `bastion-payment-ops-demo` dashboard (recon table +
exceptions queue)

## 1. Purpose

Keep Bastion's internal ledger and partner-reported balances in agreement
every business day, and drive any exception (stalled, returned, rejected,
or failed-conversion payment) to resolution within SLA. This document
covers the standard daily cycle; incident response for systemic outages is
covered separately.

## 2. Daily reconciliation cycle

1. **Pull settlement detail.** At each scheduled cutoff, compare each
   internal ledger entry against the partner's reported settlement, for
   every bank/PFI/liquidity provider/exchange counterparty and every rail
   (ACH, Wire, RTP, SWIFT, SEPA, Solana USDC).
2. **Auto-match.** Rows where internal and partner amounts agree exactly
   are marked `Matched` and require no action.
3. **Flag breaks.** Any mismatch is marked `Break` and classified into one
   of the recurring reason categories below. A break is not closed until
   the internal and partner amounts agree or the discrepancy is explained
   and signed off.
4. **Triage breaks by age and size.** Breaks open past cutoff are
   prioritized by dollar value first, then by age. Anything above the
   material-value threshold (set by Treasury) gets same-day attention
   regardless of age.

### Common break reasons and first response

| Reason | Likely cause | First response |
|---|---|---|
| Amount mismatch | Correspondent/intermediary fee deducted in transit, partial fill, or one instruction in a bulk file returned separately. FX variance only where the two sides are in different currencies, never on a EUR-vs-EUR SEPA leg | Confirm fee schedule or fill status with partner; if unexplained after one cycle, escalate |
| Missing on partner ledger | Payment in flight, not yet settled on partner's side | Recheck next cutoff; if still missing after 2 cycles, contact partner ops |
| On internal ledger, not yet visible on partner API | Webhook/API lag, or the counterparty's indexer/ledger hasn't caught up | Poll partner status endpoint; escalate if lag exceeds partner's stated SLA |
| Duplicate or unexpected entry | Retry logic double-submitted, or partner-side duplicate | Freeze the entry, do not resubmit, escalate to eng + partner before touching balances |

## 3. Exception handling

Exceptions are payments that didn't complete cleanly: **Stalled**,
**Return**, **Reject**, or **Failed conversion**. Every exception gets
logged with a diagnostic trail: the hop-by-hop path the payment took
across Bastion's ledger, the partner's API, the settlement network, and
the receiving bank, so it's clear which system the failure sits in
before anyone starts investigating.

1. **New.** Exception is logged automatically when a payment fails to
   settle, gets returned, is rejected by the receiving side, or a
   crypto↔fiat conversion errors out. Diagnostic trail is captured at
   creation.
2. **Investigating.** Assigned to an operator, who reads the trail to
   identify the failing hop before contacting anyone. Internal-ledger and
   partner-API hops that show `success` are ruled out; the first `failed`
   or stuck `pending` hop is where the actual problem lives.
3. **Escalated.** Used when resolution requires the counterparty, a
   compliance review, or an engineering fix (e.g., a network-level
   failure, a value above the operator's authority to resolve alone, or
   no response from the partner within SLA).
4. **Resolved.** Root cause identified and a next action taken:
   corrected and resubmitted, refunded, written off with sign-off, or
   confirmed as a false positive (payment actually settled, monitoring
   lagged).

### Response targets

Terminal failures carry a flat clock: they need a person regardless of how
fast the rail is.

| Type | First response | Escalate if unresolved after |
|---|---|---|
| Return / Reject | 30 min | 4 hours |
| Failed conversion | 15 min | 1 hour (higher priority, usually blocks downstream settlement) |
| Recon break (amount mismatch) | 1 hour | 8 hours |

A **stall** is different: the target has to follow the rail, because "late"
means something completely different on RTP than on SWIFT. A stalled payment
escalates after two of its rail's normal settlement windows, with a 15-minute
floor so instant rails don't page anyone over ordinary jitter.

| Rail | Normal settlement window | Stall escalation |
|---|---|---|
| RTP | seconds | 15 min |
| Solana USDC | ~5 min | 15 min |
| Wire (domestic) | ~2 hours | 4 hours |
| ACH | next banking day | 48 hours |
| SEPA | next business day | 48 hours |
| SWIFT | up to 2 business days | 96 hours |

Implemented in `lib/sla.ts`; the queue's Age column is measured against these
targets, not against a single global clock.

## 4. Treasury coordination

Reconciliation and exception status feed directly into treasury decisions:
open breaks reduce confidence in available balance, and stalled or
failed-conversion exceptions can affect prefunding and rebalancing timing
across rails. Any break or exception above the material-value threshold is
flagged to Treasury alongside the daily recon summary, not held until it's
resolved.

## 5. Escalation path

Operator → Payment Operations Lead → (Engineering, for system-level
failures) / (Partner ops desk, for counterparty-side issues) /
(Compliance, for anything touching sanctions, fraud, or account status).
Escalations should include the exception ID, the diagnostic trail, and
what's already been ruled out, not just "this is stuck."

## 6. Continuous improvement

Recurring break reasons and exception types are reviewed periodically to
identify automation opportunities: auto-resolving known-benign timing
lags, auto-classifying exceptions by trail pattern, and trail-pattern
root-cause suggestions to cut first-response time on Investigating-stage
exceptions. Those suggestions are rules-based today, reading the diagnostic
trail directly; a model-assisted version is the next step once there's
realistic data to evaluate it against.
