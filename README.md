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
and exchanges, triage exceptions, and bring an AI-first mindset to cutting
down manual work. So I built a small dashboard that simulates that
workflow: a reconciliation table, a live exceptions queue, and a
diagnostic trail view for tracing a stalled payment across systems. It's
not a real integration, the data is mocked, but the interactions are
real.

## What it does

- **KPI strip**: settlement latency (p50/p95), exception rate, today's
  throughput, and open breaks, both by count and dollar value.
- **Reconciliation table**: internal ledger balances next to
  partner-reported balances, with a matched/break status badge, a break
  reason on hover, and a "show breaks only" filter.
- **Exceptions queue**: stalled, returned, rejected, and
  failed-conversion payments, filterable by status, each with an age and
  amount.
- **Diagnostic trail**: click any exception to expand a hop-by-hop trace
  (ledger → partner API → settlement network → bank credit) with
  check/x/clock markers showing exactly where a payment is stuck. This is
  the piece I'm proudest of, it's a direct answer to the JD's line about
  diagnosing failures that span several partners and systems.
- **Live status updates**: the status dropdown in the detail panel
  updates the whole queue immediately.
- **"Suggest root cause" button**: a placeholder for now. I didn't want
  to fake an AI feature just to check a box, so it currently shows an
  honest note about what it would do instead. More on that below.

All data lives in `data/mockLedger.ts` and is completely made up. Partner
names (Circle, Cross River, Evolve Bank, Correspondent Bank) and rails (ACH, Wire,
RTP, SWIFT, SEPA, Solana USDC) are used only because they're realistic,
none of this touches a real account or transaction.

## About the AI-triage button

This was the one open question I carried through the build. The JD
explicitly calls out an "AI-first approach... to improve exception
handling," so I wanted the demo to have some answer to that. I decided to
get the rest of the app solid first rather than rush a half-built AI
feature, so right now the button is an honest placeholder rather than
something faked. Next up: deciding between a real API call that reads the
diagnostic trail and drafts a suggested root cause, versus a realistic
mocked response, and building whichever I land on.

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

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying

I'm deploying this on Vercel, straight from this GitHub repo, no
environment variables needed for the current mocked version.