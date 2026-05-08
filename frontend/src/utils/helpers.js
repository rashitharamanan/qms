export const formatTime = (minutes) => {
  if (minutes < 60) return minutes + " min";
  return Math.floor(minutes/60) + "h " + (minutes%60) + "m";
};

export const getStatusColor = (status) => {
  const map = { waiting: "amber", called: "blue", "in-service": "purple", completed: "green", skipped: "gray", cancelled: "red" };
  return map[status] || "gray";
};

export const todayDate = () => new Date().toISOString().split("T")[0];
export const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const formatTime12 = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });