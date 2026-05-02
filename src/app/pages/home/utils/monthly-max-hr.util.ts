import { StravaActivity } from "../../../core/models/activity.model";

export function getMonthlyMaxHr(activities: StravaActivity[]) {
  const data: Record<string, number> = {};

  activities.forEach((activity) => {
    const isRun = activity.type === "Run" || activity.sport_type === "Run";

    if (isRun && activity.has_heartrate && activity.max_heartrate) {
      const rawDate = activity.start_date || activity.start_date_local;
      if (rawDate) {
        const date = new Date(rawDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const key = `${year}-${month}`;
        data[key] = Math.max(data[key] || 0, activity.max_heartrate);
      }
    }
  });

  return Object.entries(data)
    .map(([month, maxHr]) => ({ month, maxHr }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
