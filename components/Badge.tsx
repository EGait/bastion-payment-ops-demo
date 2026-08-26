import { ExceptionStatus, ReconStatus, TreasuryStatus } from "@/data/mockLedger";

export type BadgeTone = "success" | "danger" | "warning" | "info" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success-text border-success-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  info: "bg-info-bg text-info-text border-info-border",
  neutral: "bg-neutral-bg text-neutral-text border-neutral-border",
};

export function Badge({
  tone,
  children,
  title,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function reconStatusTone(status: ReconStatus): BadgeTone {
  return status === "matched" ? "success" : "danger";
}

export function exceptionStatusTone(status: ExceptionStatus): BadgeTone {
  switch (status) {
    case "New":
      return "info";
    case "Investigating":
      return "warning";
    case "Escalated":
      return "danger";
    case "Resolved":
      return "success";
  }
}

export function treasuryStatusTone(status: TreasuryStatus): BadgeTone {
  switch (status) {
    case "Adequate":
      return "success";
    case "Watch":
      return "info";
    case "Below target":
      return "warning";
  }
}
