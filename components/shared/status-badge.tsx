import { Badge } from "@/components/ui/badge";
import { enumLabel } from "@/lib/format";

const POSITIVE = new Set([
  "APPROVED",
  "APPROVED_BY_OWNER",
  "ACTIVE",
  "SIGNED",
  "PAID",
  "COMPLETED",
  "RESOLVED",
  "VERIFIED",
  "APPROVE",
]);

const NEGATIVE = new Set(["REJECTED", "TERMINATED", "EVICTED", "OVERDUE", "FAILED", "CANCELLED", "REJECT"]);

const PENDING = new Set([
  "UNVERIFIED",
  "PENDING",
  "PENDING_SIGNATURE",
  "REQUESTED",
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "OPEN",
  "REOPENED",
  "NOTICE_SERVED",
]);

export function statusTone(status: string | null | undefined): "default" | "success" | "destructive" | "warning" | "secondary" {
  if (!status) return "secondary";
  if (POSITIVE.has(status)) return "success";
  if (NEGATIVE.has(status)) return "destructive";
  if (PENDING.has(status)) return "warning";
  return "secondary";
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <Badge variant={statusTone(status)} className="capitalize shadow-none text-[11px]">
      {enumLabel(status)}
    </Badge>
  );
}
