import { StravaActivity } from '../../../core/models/activity.model';

export function getYearlyKms(activities: StravaActivity[]) {
  const data: Record<number, number> = {};
  
  activities.forEach((activity) => {
    const isRun = activity.type === 'Run' || activity.sport_type === 'Run';
    
    if (isRun) {
      const rawDate = activity.start_date || activity.start_date_local;
      if (rawDate) {
        const year = new Date(rawDate).getFullYear();
        if (!isNaN(year)) {
          data[year] = (data[year] || 0) + (activity.distance || 0) / 1000;
        }
      }
    }
  });
  
  return Object.entries(data)
    .map(([year, distance]) => ({ year: Number(year), distance: Math.round(distance * 10) / 10 }))
    .sort((a, b) => a.year - b.year);
}
