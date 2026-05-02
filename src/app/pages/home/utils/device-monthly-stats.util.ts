import { StravaActivity } from '../../../core/models/activity.model';

export interface DeviceMonthlyDistribution {
  months: string[];
  devices: {
    name: string;
    data: number[]; // Percentage per month
    counts: number[]; // Absolute count per month
  }[];
}

export function getDeviceMonthlyDistribution(activities: StravaActivity[]): DeviceMonthlyDistribution {
  const monthGroups: Record<string, Record<string, number>> = {};
  const allDevices = new Set<string>();
  
  activities.forEach((activity) => {
    const rawDate = activity.start_date || activity.start_date_local;
    if (rawDate) {
      const date = new Date(rawDate);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const device = activity.device_name || 'Manual/Unknown';
      
      allDevices.add(device);
      
      if (!monthGroups[key]) {
        monthGroups[key] = {};
      }
      monthGroups[key][device] = (monthGroups[key][device] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthGroups).sort();
  const sortedDevices = Array.from(allDevices).sort();

  const devices = sortedDevices.map(deviceName => {
    const data: number[] = [];
    const counts: number[] = [];

    sortedMonths.forEach(month => {
      const monthData = monthGroups[month];
      const count = monthData[deviceName] || 0;
      const total = Object.values(monthData).reduce((a, b) => a + b, 0);
      
      counts.push(count);
      data.push(total > 0 ? Math.round((count / total) * 1000) / 10 : 0);
    });

    return {
      name: deviceName,
      data,
      counts
    };
  });

  return {
    months: sortedMonths,
    devices
  };
}
