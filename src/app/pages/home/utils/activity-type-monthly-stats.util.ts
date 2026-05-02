import { StravaActivity } from '../../../core/models/activity.model';
import { MonthlyDistribution } from '../../../shared/models/monthly-distribution.model';

export function getActivityTypeMonthlyDistribution(activities: StravaActivity[]): MonthlyDistribution {
  const monthGroups: Record<string, Record<string, number>> = {};
  const allTypes = new Set<string>();
  
  activities.forEach((activity) => {
    const rawDate = activity.start_date || activity.start_date_local;
    if (rawDate) {
      const date = new Date(rawDate);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      let type = activity.sport_type || activity.type || 'Unknown';
      
      // Merge types as requested
      if (type === 'Racquetball') type = 'Tennis';
      if (type === 'VirtualRun') type = 'Run';
      if (type === 'WeightTraining') type = 'Workout';
      
      allTypes.add(type);
      
      if (!monthGroups[key]) {
        monthGroups[key] = {};
      }
      monthGroups[key][type] = (monthGroups[key][type] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthGroups).sort();
  const sortedTypes = Array.from(allTypes).sort();

  const series = sortedTypes.map(typeName => {
    const data: number[] = [];
    const counts: number[] = [];

    sortedMonths.forEach(month => {
      const monthData = monthGroups[month];
      const count = monthData[typeName] || 0;
      const total = Object.values(monthData).reduce((a, b) => a + b, 0);
      
      counts.push(count);
      data.push(total > 0 ? Math.round((count / total) * 1000) / 10 : 0);
    });

    return {
      name: typeName,
      data,
      counts
    };
  });

  const sortedSeries = series.sort((a, b) => {
    const totalA = a.counts.reduce((sum, c) => sum + c, 0);
    const totalB = b.counts.reduce((sum, c) => sum + c, 0);
    return totalB - totalA;
  });

  return {
    months: sortedMonths,
    series: sortedSeries
  };
}
