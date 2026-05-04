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
import { getActivityTypeMonthlyDistribution } from './utils/activity-type-monthly-stats.util';
import { getGearMonthlyDistribution } from './utils/gear-monthly-stats.util';
import { GearsService } from '@strava/index';

interface ActivitiesState {
  activities: StravaActivity[];
  gearNames: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  gearNames: {},
  isLoading: false,
  error: null,
};

export const ActivitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {
      yearlyKms: computed(() => getYearlyKms(store.activities())),
      deviceStats: computed(() => getDeviceStats(store.activities())),
      yearlySessions: computed(() => getYearlySessions(store.activities())),
      hrStats: computed(() => getMonthlyHrStats(store.activities(), ['Run'])),
      gymHrStats: computed(() => getMonthlyHrStats(store.activities(), ['WeightTraining', 'Crossfit', 'HighIntensityIntervalTraining', 'Workout'])),
      deviceMonthlyDistribution: computed(() => getDeviceMonthlyDistribution(store.activities())),
      activityTypeMonthlyDistribution: computed(() => getActivityTypeMonthlyDistribution(store.activities())),
      gearMonthlyDistribution: computed(() => {
        const runActivities = store.activities().filter(a => 
          ['Run', 'TrailRun', 'VirtualRun'].includes(a.sport_type || '')
        );
        return getGearMonthlyDistribution(runActivities, store.gearNames());
      })
    };
  }),
  withMethods((store, activitiesService = inject(ActivitiesService), gearsService = inject(GearsService), dbService = inject(IndexedDbService)) => ({
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

        // Load gear names for runs
        const runActivities = (activities as StravaActivity[]).filter(a => 
          ['Run', 'TrailRun', 'VirtualRun'].includes(a.sport_type || '')
        );
        const gearIds = Array.from(new Set(runActivities.map(a => a.gear_id).filter(id => !!id))) as string[];
        if (gearIds.length > 0) {
          await this.loadGearNames(gearIds);
        }
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'Failed to load activities';
        patchState(store, { isLoading: false, error });
      }
    },

    async loadGearNames(gearIds: string[]) {
      const currentGearNames = store.gearNames();
      const idsToFetch = gearIds.filter(id => id && !currentGearNames[id]);
      
      if (idsToFetch.length === 0) return;

      try {
        const newGearNames = { ...currentGearNames };
        const results = await Promise.all(
          idsToFetch.map(id => firstValueFrom(gearsService.getGearById(id)))
        );

        results.forEach(gear => {
          if (gear.id && gear.name) {
            newGearNames[gear.id] = gear.name;
          }
        });

        patchState(store, { gearNames: newGearNames });
      } catch (e) {
        console.error('Failed to load gear names', e);
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
