export interface DistributionSeries {
  name: string;
  data: number[]; // Percentage per month
  counts: number[]; // Absolute count per month
}

export interface MonthlyDistribution {
  months: string[];
  series: DistributionSeries[];
}
