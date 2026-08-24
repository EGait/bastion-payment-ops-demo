# Bastion Payment Ops Demo

A working reconciliation and exceptions dashboard, built as a portfolio piece
for Bastion's **Payment Operations Associate** role. It's a small,
self-contained simulation of the daily workflow the job description
describes — not a real integration, just a demonstration that I understand
what the job actually involves and can build the tooling around it.

**Live demo:** _add your Vercel URL here after deploying_

## Why this exists

The JD asks for someone who can monitor payment flows across rails,
reconcile crypto and fiat across banks/PFIs/liquidity providers/exchanges,
triage exceptions, and bring an "AI-first" approach to cutting manual
effort. Rather than just describing that experience on a resume, this repo
shows a working (if mocked) version of the tools that work would run on.

## What's in the demo

| Feature | Maps to |
|---|---|
| **KPI strip** — settlement latency (p50/p95), exception rate, throughput, open breaks | "KPI tracking: throughput, settlement latency, exception rates" |
| **Reconciliation table** — internal ledger vs. partner ledger, matched/break status, break reasons, "show breaks only" filter | "Daily reconciliation of crypto and fiat across banks, PFIs, liquidity providers, and exchanges — clearing breaks" |
| **Exceptions queue** — stalled/return/failed-conversion/reject, by rail and partner, status filters | "Exception handling: returns, rejects, recalls — driving them to resolution" |
| **Diagnostic trail** (click a row to expand) — hop-by-hop path across ledger → partner API → settlement network → bank credit, with success/fail/pending markers | "Diagnosing failures that span several partners and systems" |
| **Live status updates** — dropdown in the detail panel updates queue state immediately | Day-to-day exception workflow |
| **"Suggest root cause" button** | Placeholder for the JD's "AI-first... improve exception handling" ask — intentionally left as an honest placeholder (see below) rather than faked, while the rest of the app got built first |
| **SOP.md** | "Build or rewrite SOPs and runbooks" |

All data lives in `data/mockLedger.ts` and is fabricated — no real
partners, accounts, or transactions. Partner and rail names (Circle, Cross
River, Evolve Bank, Signet; ACH/Wire/RTP/SWIFT/SEPA/Solana USDC) are used
only as realistic labels.

### About the AI-triage button

The JD explicitly calls out an AI-first approach as a differentiator, so
the exceptions detail panel has a **"Suggest root cause"** button. Right
now it reveals an honest placeholder note rather than a live or faked
result — the decision on how far to take it (a real Claude API call
reading the diagnostic trail vs. a realistic mocked response) was
deliberately deferred until the rest of the app was solid. That's the
next thing to build here.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS 4. Same stack as my other
projects, and a realistic choice for a startup like Bastion.

## Structure

```
bastion-payment-ops-demo/
  app/
    page.tsx            -> the dashboard
    layout.tsx
    globals.css          -> design tokens (surface/text/border/badge roles)
  components/
    KPIStrip.tsx
    ReconTable.tsx
    ExceptionsQueue.tsx
    ExceptionDetail.tsx
    Badge.tsx
  data/
    mockLedger.ts         -> reconciliation + exception mock data
  lib/
    format.ts             -> currency/age formatting helpers
  SOP.md                  -> recon + exception handling runbook
  README.md
```

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying

Push to GitHub and import into Vercel — no environment variables or
external services required for the current (mocked) version.
