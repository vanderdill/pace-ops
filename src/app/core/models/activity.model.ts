import { SummaryActivity } from '@strava/index';

export interface StravaActivity extends SummaryActivity {
  readonly start_date?: string;
  readonly start_date_local?: string;
  readonly sport_type?: string;
  readonly device_name?: string;
  readonly max_heartrate?: number;
  readonly average_heartrate?: number;
  readonly has_heartrate?: boolean;
}
