# Bastion Payment Ops Demo

Built for my application to Bastion's Payment Operations Associate role.
Rather than list payments experience on a resume, I wanted to show I
understand the actual work: daily reconciliation, exception handling, and
tracing a payment that's stuck somewhere across a few different partners.

**Live demo:** https://bastion-payment-ops-demo.vercel.app/

## What's in it

- **KPI strip:** settlement latency, exception rate, throughput, open breaks.
- **Treasury snapshot:** closing balances against target, with a prefunding
  amount for any account that's short.
- **Reconciliation table:** our ledger against what each partner reported,
  with break reasons and per-currency totals.
- **Cash movement:** money in and out per account, opening through closing.
- **Exceptions queue:** filterable, with each row aged against its SLA.
- **Diagnostic trail:** open any exception to see the hop-by-hop path and
  where it stopped.
- **Suggest root cause:** reads the trail, finds the failing hop, returns a
  root cause and a next action.

## How it's built

Three layers, one direction:

- `data/mockLedger.ts` holds inputs only: the recon rows, the exceptions, and
  each account's **opening** balance.
- `lib/` derives everything else: closing balances, funding status, open-break
  counts, the exception rate, SLA targets.
- `components/` renders it. One component holds state, the rest just display
  what they're given.

Nothing on screen is written down twice, so two parts of the dashboard can't
disagree about the same day. An earlier version had them each holding their
own hardcoded numbers, and the KPI strip ended up claiming seven open breaks
while the table below it listed five.

A few decisions worth mentioning:

- **A break puts the difference at stake, not the whole payment.** A $1.2M
  wire that's $35 short is a $35 problem.
- **SLA depends on the rail.** RTP settles in seconds, SWIFT can take two
  business days. A flat "stalled = escalate in 2 hours" clock hides the first
  and cries wolf on the second.
- **Latency and throughput stay hardcoded.** They can't be derived from
  fifteen rows, and faking it would recreate the problem above.

## About "Suggest root cause"

The job description mentions an AI-first approach to exception handling, so I
wanted something real there rather than a placeholder. It's a rules engine,
not a model call, and the button says so in its own output.

It reads the trail, finds the first hop that didn't succeed, and writes the
root cause from that hop. The next action comes from a category playbook:
issuer mint, on-chain settlement, conversion, receiving bank, partner ledger,
partner gateway, compliance hold. That's how a runbook works anyway. What you
do next depends on which system broke.

I skipped a live model call because it needs an API key and adds cost to a
portfolio project. With real data it's the first thing I'd upgrade.

## Data

All fabricated. Partner names and rails are realistic but nothing here touches
a real account or transaction. The clock is fixed at 10:20 CT, and every
timestamp and age lines up with it.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS 4. Deployed on Vercel.

```bash
npm install
npm run dev
```
