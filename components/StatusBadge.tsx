import type { ApplicationStatus } from "@/models/Application";

const styles: Record<ApplicationStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  reviewed: "bg-sky-50 text-sky-700",
  accepted: "bg-brand-50 text-brand-700",
  rejected: "bg-rose-50 text-rose-700",
};

const labels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
