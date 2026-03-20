export default function TokenBadge({ status }) {
  const map = {
    pending: "bg-blue-100 text-blue-700",
    waiting: "badge-waiting", called: "badge-called",
    "in-service": "badge-in-service", completed: "badge-completed",
    skipped: "badge-skipped", cancelled: "badge-cancelled",
    rejected: "bg-red-100 text-red-700"
  };
  const labels = {
    pending: "Pending Approval",
    waiting: "Waiting", called: "Called", "in-service": "In Service",
    completed: "Completed", skipped: "Skipped", cancelled: "Cancelled",
    rejected: "Rejected"
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${map[status] || "badge-waiting"}`}>{labels[status] || status}</span>;
}