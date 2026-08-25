# Bastion Payment Ops Demo

I built this as part of my application for Bastion's Payment Operations
Associate role. Instead of just listing payments experience on a resume, I
wanted to show I actually understand what the job involves: daily
reconciliation, exception handling, and the kind of cross-partner
diagnosis the role description calls out specifically.

**Live demo:** https://bastion-payment-ops-demo.vercel.app/

## Why I built this

The job description asks for someone who can monitor payment flows across
rails, reconcile crypto and fiat across banks, PFIs, liquidity providers,
and exchanges, triage exceptions, coordinate with Treasury, and bring an
AI-first mindset to cutting down manual work. So I built a small dashboard
that simulates that workflow: a reconciliation table, a treasury snapshot,
a live exceptions queue, and a diagnostic trail view for tracing a stalled
payment across systems. It's not a real integration, the data is mocked,
but the interactions are real.

## What it does

- **KPI strip**: average settlement latency, exception rate, today's
  throughput, and open breaks, both by count and dollar value.
- **Treasury snapshot**: operating balances vs. target by currency and
  venue, maps to the JD's treasury coordination, prefunding, and
  rebalancing bullet.
- **Reconciliation table**: internal ledger balances next to
  partner-reported balances, with a matched/break status badge, a break
  reason on hover, a dedicated currency column, and a "show breaks only"
  filter.
- **Break-to-exception linking**: unresolved breaks have a "Promote to
  exception" action that creates a real, tracked exception on the spot and
  jumps to it in the queue below, showing how a recon-level break turns
  into an operator's actual worklist.
- **Exceptions queue**: stalled, returned, rejected, and
  failed-conversion payments, filterable by status, each with an age and
  amount. Ages past their SOP escalation target are flagged in red.
- **Diagnostic trail**: click any exception to expand a hop-by-hop trace
  (ledger → partner API → settlement network → bank credit) with
  check/x/clock markers showing exactly where a payment is stuck. This is
  the piece I'm proudest of, it's a direct answer to the JD's line about
  diagnosing failures that span several partners and systems.
- **Live status updates**: the status dropdown in the detail panel
  updates the whole queue immediately.
- **"Suggest root cause" button**: reads the exception's diagnostic trail,
  finds the actual break point, and generates a root cause and a
  suggested next action from it. More on how this works below.

All data lives in `data/mockLedger.ts` and is completely made up. Partner
names (Circle, Cross River, Evolve Bank, Correspondent Bank) and rails (ACH, Wire,
RTP, SWIFT, SEPA, Solana USDC) are used only because they're realistic,
none of this touches a real account or transaction.

## About the "Suggest root cause" button

The JD explicitly calls out an "AI-first approach... to improve exception
handling," so I wanted the demo to have a real answer to that, not a
placeholder. I decided against wiring up a live model API call for now,
that needs an API key and adds real cost and setup for what's a portfolio
project, and went with something I could stand behind as genuinely useful
instead of just polished-looking: a small rules engine (`lib/rootCause.ts`)
that reads an exception's diagnostic trail, finds the first hop that isn't
a clean success, and generates a root cause and next action from it, both
specific to that exception, not a canned response.

It's not calling a language model, and I'm not labeling it as AI, the
button says exactly what it is in its own output. But it's built as real
logic reading real trail data rather than hardcoded text, which is why it
also works correctly on exceptions created through the "Promote to
exception" button, not just the original eight. If I get access to
Bastion's API or more realistic sandbox data down the line, this is the
piece I'd upgrade to a live model call first.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS 4, the same stack I use
elsewhere, and a realistic choice for a startup like Bastion.

## Project structure

```
bastion-payment-ops-demo/
  app/
    page.tsx            -> the dashboard
    layout.tsx
    globals.css          -> design tokens (surface/text/border/badge roles)
  components/
    Dashboard.tsx         -> shared state, wires recon/exceptions/treasury together
    KPIStrip.tsx
    TreasurySnapshot.tsx
    ReconTable.tsx
    ExceptionsQueue.tsx
    ExceptionDetail.tsx
    Badge.tsx
  data/
    mockLedger.ts         -> reconciliation + exception + treasury mock data
  lib/
    format.ts             -> currency/age formatting helpers
    sla.ts                 -> SOP-based SLA breach thresholds
    rootCause.ts           -> rules engine behind "Suggest root cause"
  SOP.md                  -> recon + exception handling runbook
  README.md
```

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying

I'm deploying this on Vercel, straight from this GitHub repo, no
environment variables needed for the current mocked version.