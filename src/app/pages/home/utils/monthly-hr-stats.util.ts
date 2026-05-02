import { StravaActivity } from '../../../core/models/activity.model';

export interface MonthlyHrStats {
  month: string;
  maxHr: number;
  avgHr: number;
  stdDev: number;
}

export function getMonthlyHrStats(activities: StravaActivity[]): MonthlyHrStats[] {
  const monthGroups: Record<string, number[]> = {};
  
  activities.forEach((activity) => {
    const isRun = activity.type === 'Run' || activity.sport_type === 'Run';
    
    if (isRun && activity.has_heartrate && activity.average_heartrate) {
      const rawDate = activity.start_date || activity.start_date_local;
      if (rawDate) {
        const date = new Date(rawDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const key = `${year}-${month}`;
        
        if (!monthGroups[key]) {
          monthGroups[key] = [];
        }
        monthGroups[key].push(activity.average_heartrate);
      }
    }
  });

  // Also need max_heartrate for the max metric
  const maxHrByMonth: Record<string, number> = {};
  activities.forEach((activity) => {
    const isRun = activity.type === 'Run' || activity.sport_type === 'Run';
    if (isRun && activity.has_heartrate && activity.max_heartrate) {
      const rawDate = activity.start_date || activity.start_date_local;
      if (rawDate) {
        const date = new Date(rawDate);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        maxHrByMonth[key] = Math.max(maxHrByMonth[key] || 0, activity.max_heartrate);
      }
    }
  });
  
  return Object.entries(monthGroups)
    .map(([month, hrValues]) => {
      const avgHr = hrValues.reduce((a, b) => a + b, 0) / hrValues.length;
      const stdDev = Math.sqrt(
        hrValues.map(x => Math.pow(x - avgHr, 2)).reduce((a, b) => a + b, 0) / hrValues.length
      );
      
      return {
        month,
        maxHr: maxHrByMonth[month] || avgHr, // Fallback to avg if max not found (though unlikely)
        avgHr: Math.round(avgHr * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}
