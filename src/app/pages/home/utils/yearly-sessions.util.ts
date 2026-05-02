import { StravaActivity } from '../../../core/models/activity.model';

export function getYearlySessions(activities: StravaActivity[]) {
  const data: Record<number, number> = {};
  const gymSports = ['WeightTraining', 'Crossfit', 'HighIntensityIntervalTraining', 'Workout'];
  
  activities.forEach((activity) => {
    const isGym = gymSports.includes(activity.type || '') || 
                  gymSports.includes(activity.sport_type || '');
    
    if (isGym) {
      const rawDate = activity.start_date || activity.start_date_local;
      if (rawDate) {
        const year = new Date(rawDate).getFullYear();
        if (!isNaN(year)) {
          data[year] = (data[year] || 0) + 1;
        }
      }
    }
  });
  
  return Object.entries(data)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);
}
