import { StravaActivity } from "../../../core/models/activity.model";
import { MonthlyDistribution } from "../../../shared/models/monthly-distribution.model";

export function getGearMonthlyDistribution(
  activities: StravaActivity[],
  gearNames: Record<string, string>,
): MonthlyDistribution {
  const monthGroups: Record<string, Record<string, number>> = {};
  const allGear = new Set<string>();

  activities.forEach((activity) => {
    const rawDate = activity.start_date || activity.start_date_local;
    if (rawDate) {
      const date = new Date(rawDate);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      const gearId = activity.gear_id;
      const gearName = gearId ? gearNames[gearId] || "Unknown Gear" : "No Gear";

      allGear.add(gearName);

      if (!monthGroups[key]) {
        monthGroups[key] = {};
      }
      monthGroups[key][gearName] = (monthGroups[key][gearName] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthGroups).sort();
  const sortedGearNames = Array.from(allGear).sort();

  const series = sortedGearNames.map((gearName) => {
    const data: number[] = [];
    const counts: number[] = [];

    sortedMonths.forEach((month) => {
      const monthData = monthGroups[month];
      const count = monthData[gearName] || 0;
      const total = Object.values(monthData).reduce((a, b) => a + b, 0);

      counts.push(count);
      data.push(total > 0 ? Math.round((count / total) * 1000) / 10 : 0);
    });

    return {
      name: gearName,
      data,
      counts,
    };
  });

  const sortedSeries = series.sort((a, b) => {
    const totalA = a.counts.reduce((sum, c) => sum + c, 0);
    const totalB = b.counts.reduce((sum, c) => sum + c, 0);
    return totalB - totalA;
  });

  return {
    months: sortedMonths,
    series: sortedSeries,
  };
}
