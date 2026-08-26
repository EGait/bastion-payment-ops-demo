import { ReconRow } from "@/data/mockLedger";
import { CurrencyPosition } from "@/lib/ledger";
import { Badge } from "@/components/Badge";
import { formatAmount, formatSigned } from "@/lib/format";

function MovementCard({ position }: { position: CurrencyPosition }) {
  const { openingBalance, moneyIn, moneyOut, net, closingBalance } = position;

  return (
    <div className="bg-surface-primary p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          {position.currency}
        </span>
        <span className="text-[11px] text-text-tertiary">{position.venue}</span>
      </div>

      <dl className="mt-2.5 space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">Opening balance</dt>
          <dd className="tabular text-text-primary">
            {formatAmount(openingBalance)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">Money in</dt>
          <dd className="tabular font-medium text-success-text">
            {formatSigned(moneyIn)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-secondary">Money out</dt>
          <dd className="tabular font-medium text-danger-text">
            {formatSigned(-moneyOut)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border-primary pt-1.5">
          <dt className="text-text-secondary">Net movement</dt>
          <dd
            className={`tabular font-medium ${
              net > 0
                ? "text-success-text"
                : net < 0
                  ? "text-danger-text"
                  : "text-text-primary"
            }`}
          >
            {formatSigned(net)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border-primary pt-1.5">
          <dt className="font-medium text-text-primary">Closing balance</dt>
          <dd className="tabular font-semibold text-text-primary">
            {formatAmount(closingBalance)}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] text-text-tertiary">
        {position.rowCount} settlement{position.rowCount === 1 ? "" : "s"} today
      </p>
    </div>
  );
}

export function CreditsDebits({
  rows,
  positions,
}: {
  rows: ReconRow[];
  positions: CurrencyPosition[];
}) {
  const sortedRows = [...rows].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <section
      aria-labelledby="movement-heading"
      className="rounded-lg border border-border-primary bg-surface-primary"
    >
      <div className="border-b border-border-primary px-4 py-3">
        <h2
          id="movement-heading"
          className="text-sm font-semibold text-text-primary"
        >
          Cash movement
        </h2>
        <p className="text-xs text-text-secondary">
          Today&apos;s settlement legs by cash direction, as a movement
          statement per account: opening balance, money in, money out, closing
          balance. Money in and out aren&apos;t expected to net to zero — a
          treasury account has inflow and outflow days — but they do have to
          explain the change in the balance, so each closing figure here is
          the one the Treasury snapshot shows.
        </p>
        <p className="mt-1.5 text-[11px] text-text-tertiary">
          Rows are labelled In/Out rather than credit/debit on purpose: on ACH
          those words name the entry type — an ACH debit <em>pulls</em> funds
          in — and in double-entry a cash receipt is a debit to an asset
          account. In/Out is unambiguous on every rail.
        </p>
      </div>

      <div className="grid gap-px bg-border-primary sm:grid-cols-3">
        {positions.map((p) => (
          <MovementCard key={p.currency} position={p} />
        ))}
      </div>

      <div className="relative overflow-x-auto border-t border-border-primary">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">
            Every settlement leg today with its cash direction and effect on
            Bastion&apos;s balance.
          </caption>
          <thead>
            <tr className="border-b border-border-primary text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
              <th scope="col" className="px-4 py-2 font-medium">
                ID
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Rail
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Counterparty
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Currency
              </th>
              <th scope="col" className="px-4 py-2 font-medium">
                Direction
              </th>
              <th scope="col" className="px-4 py-2 font-medium text-right">
                Effect on balance
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const isIn = row.direction === "in";
              const signed = isIn ? row.internalAmount : -row.internalAmount;
              return (
                <tr
                  key={row.id}
                  className="border-b border-border-primary last:border-0 hover:bg-surface-hover"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">
                    {row.id}
                  </td>
                  <td className="px-4 py-2.5 text-text-primary">{row.rail}</td>
                  <td className="px-4 py-2.5 text-text-primary">
                    {row.counterparty}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone="neutral">{row.currency}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={isIn ? "success" : "danger"}>
                      {isIn ? "In" : "Out"}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right tabular font-medium ${
                      isIn ? "text-success-text" : "text-danger-text"
                    }`}
                  >
                    {formatSigned(signed)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
