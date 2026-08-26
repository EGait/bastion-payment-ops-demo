# Bastion Payment Ops Demo

I built this as part of my application for Bastion's Payment Operations
Associate role. Instead of listing payments experience on a resume, I wanted
to show I understand what the job actually involves: daily reconciliation,
exception handling, and the kind of cross-partner diagnosis that takes real
work to trace.

**Live demo:** https://bastion-payment-ops-demo.vercel.app/

## One source of truth

This is the part I'd most want to talk through.

An early version had the treasury balances, the KPI strip, and the
cash-movement view each holding their own hardcoded figures — and they
quietly disagreed with each other. Net USD movement for the day implied a much
larger drawdown than the treasury balance showed. The KPI strip claimed seven
open breaks while the recon table listed five. Nothing was "broken," and
everything looked fine at a glance, which is exactly what makes that class of
bug dangerous in an ops tool: people stop trusting the dashboard, then stop
using it, then go back to spreadsheets.

So the data model now works the way the job does:

- `data/mockLedger.ts` holds **inputs only** — the reconciliation rows and
  each treasury account's **opening** balance.
- `lib/ledger.ts` derives each account's money in, money out, net movement,
  closing balance, funding status, and prefunding requirement from those rows.
- `lib/kpi.ts` derives the open-break count, the unreconciled variance, and
  the exception rate the same way.

The treasury snapshot and the Cash movement tab are now two presentations
of one calculation, so they can't contradict each other. Promoting a break to
an exception moves the exception rate immediately, because nothing is written
down twice.

Two definitions I'd defend in an interview:

- **Unreconciled variance is the delta, not the notional.** A $1.2M wire
  that's $35 short puts $35 in question, not $1.2M. Summing full payment
  values would inflate "open breaks" by orders of magnitude.
- **Settlement latency and throughput stay fixed inputs.** They can't be
  derived from fifteen recon rows, and pretending otherwise would be the same
  mistake in a new place. In a real system they'd come from the processor.

## What it does

- **KPI strip** — average settlement latency, exception rate, throughput, and
  open breaks with their unreconciled variance.
- **Treasury snapshot** — closing balances vs. target by currency and venue,
  each one the account's opening balance plus today's net movement. Funding
  status is derived from the balance against target, and any account below
  target shows the concrete prefunding amount to send Treasury.
- **Reconciliation table** — internal ledger entries against partner-reported
  settlement, leg by leg, with a break reason rendered on the row rather than
  hidden in a tooltip, per-currency totals, and a "show breaks only" filter.
- **Break-to-exception linking** — unresolved breaks have a "Promote to
  exception" action that creates a tracked exception and jumps to it. The
  exception is opened for the *variance*, not the full payment value, and an
  amount mismatch becomes a `Recon break` rather than a `Stalled` payment,
  since nothing is actually stuck.
- **Exceptions queue** — filterable by status, with each row showing its age
  against a rail-aware SLA target.
- **Diagnostic trail** — expand any exception for a hop-by-hop trace across
  Bastion's ledger, the partner's API, the settlement network, and the
  receiving side, with markers showing exactly where the payment sits. This is
  the piece I'm proudest of; it's a direct answer to the job description's
  line about diagnosing failures that span several partners and systems.
- **"Suggest root cause"** — reads the trail, finds the failing hop, and
  returns a root cause and a next action. More on this below.

## SLAs depend on the rail, not just the failure

`lib/sla.ts` is small but it's the piece I'd point at second.

An earlier version keyed escalation targets on exception type alone — every
"Stalled" payment got a flat two-hour clock. That produces a dashboard where a
21-minute RTP stall shows up as unremarkable, even though RTP settles in
seconds and is irrevocable, while a wire behaving completely normally looks
overdue. Terminal failures (a return, a reject, a failed conversion) do get a
flat clock, because they need a human regardless of how fast the rail is. But
a stall is measured against the rail's own settlement window, with a floor so
instant rails don't page anyone over ordinary jitter.

## About the "Suggest root cause" button

The job description calls out an "AI-first approach... to improve exception
handling," so I wanted a real answer rather than a placeholder. I decided
against wiring up a live model call: it needs an API key, and it adds cost and
setup to a portfolio project. What's there instead is a small rules engine
(`lib/rootCause.ts`) that reads an exception's diagnostic trail and finds the
first hop that isn't a clean success.

Being precise about what it generates, since the distinction matters:

- The **root cause** is written from the failing hop's own label and detail,
  so it's specific to that exception — including exceptions created through
  "Promote to exception," not just the original eight.
- The **next action** comes from a category playbook — issuer mint, on-chain
  settlement, conversion, receiving bank, partner ledger, partner gateway,
  compliance hold. That's how a runbook works anyway: what you do next depends
  on which system failed, not on which payment it was.

The compliance-hold category is there because it's the case where generic
advice actively misleads. A wire sitting in sanctions screening is not a
"check the partner's status page" problem; it needs beneficiary detail and
Compliance, which is what the tool says.

It isn't calling a language model, and I don't label it as AI — the button
says what it is in its own output. If I had access to Bastion's API or more
realistic sandbox data, this is the first piece I'd upgrade to a live model
call.

## Data

All data lives in `data/mockLedger.ts` and is fabricated. Partner names
(Circle, Cross River, Evolve Bank) and rails (ACH, Wire, RTP, SWIFT, SEPA,
Solana USDC) are used only because they're realistic; none of this touches a
real account or transaction. The demo's clock is fixed at 10:20 CT, and every
trail timestamp and exception age is consistent with it.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS 4.

Key files:

```
lib/
  ledger.ts     -> derives money in/out, net, closing balance, funding status
  kpi.ts        -> derives open breaks, unreconciled variance, exception rate
  sla.ts        -> rail-aware escalation targets
  rootCause.ts  -> rules engine behind "Suggest root cause"
SOP.md          -> recon + exception handling runbook
```

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying

Deployed on Vercel straight from this repo. No environment variables are
needed for the mocked version.
