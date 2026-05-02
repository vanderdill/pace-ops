import { StravaActivity } from '../../../core/models/activity.model';

export function getDeviceStats(activities: StravaActivity[]) {
  const stats: Record<string, number> = {};
  
  activities.forEach((activity) => {
    const device = activity.device_name || 'Manual/Unknown';
    stats[device] = (stats[device] || 0) + 1;
  });
  
  return Object.entries(stats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
