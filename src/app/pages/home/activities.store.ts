import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { ActivitiesService } from '@strava/index';
import { IndexedDbService } from '../../core/storage/indexed-db.service';
import { firstValueFrom } from 'rxjs';
import { StravaActivity } from '../../core/models/activity.model';
import { getYearlyKms } from './utils/yearly-kms.util';
import { getDeviceStats } from './utils/device-stats.util';
import { getYearlySessions } from './utils/yearly-sessions.util';
import { getMonthlyHrStats } from './utils/monthly-hr-stats.util';
import { getDeviceMonthlyDistribution } from './utils/device-monthly-stats.util';

interface ActivitiesState {
  activities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  isLoading: false,
  error: null,
};

export const ActivitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ activities }) => ({
    yearlyKms: computed(() => getYearlyKms(activities())),
    deviceStats: computed(() => getDeviceStats(activities())),
    yearlySessions: computed(() => getYearlySessions(activities())),
    hrStats: computed(() => getMonthlyHrStats(activities(), ['Run'])),
    gymHrStats: computed(() => getMonthlyHrStats(activities(), ['WeightTraining', 'Crossfit', 'HighIntensityIntervalTraining', 'Workout'])),
    deviceMonthlyDistribution: computed(() => getDeviceMonthlyDistribution(activities()))
  })),
  withMethods((store, activitiesService = inject(ActivitiesService), dbService = inject(IndexedDbService)) => ({
    async loadActivities(forceRefresh = false) {
      patchState(store, { isLoading: true, error: null });
      
      try {
        let activities = await dbService.getActivities();
        
        if (activities.length === 0 || forceRefresh) {
          activities = await this.fetchAllFromApi(activitiesService);
          await dbService.clearActivities();
          await dbService.saveActivities(activities);
        }
        
        patchState(store, { activities: activities as StravaActivity[], isLoading: false });
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'Failed to load activities';
        patchState(store, { isLoading: false, error });
      }
    },

    async fetchAllFromApi(service: ActivitiesService): Promise<StravaActivity[]> {
      let allActivities: StravaActivity[] = [];
      let page = 1;
      const perPage = 100;
      
      while (true) {
        const activities = await firstValueFrom(
          service.getLoggedInAthleteActivities(undefined, undefined, page, perPage)
        );
        
        if (activities.length === 0) break;
        
        allActivities = [...allActivities, ...activities as StravaActivity[]];
        page++;
        
        if (page > 100) break; 
      }
      
      return allActivities;
    }
  }))
);
