import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { ActivitiesService, SummaryActivity } from '@strava/index';
import { IndexedDbService } from '../../core/storage/indexed-db.service';
import { firstValueFrom } from 'rxjs';

interface StravaActivity extends SummaryActivity {
  readonly start_date?: string;
  readonly start_date_local?: string;
  readonly sport_type?: string;
}

interface GymHistoryState {
  activities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GymHistoryState = {
  activities: [],
  isLoading: false,
  error: null,
};

export const GymHistoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ activities }) => ({
    yearlySessions: computed(() => {
      const data: Record<number, number> = {};
      const gymSports = ['WeightTraining', 'Crossfit', 'HighIntensityIntervalTraining', 'Workout'];
      
      activities().forEach((activity) => {
        const isGym = gymSports.includes(activity.type || '') || 
                      gymSports.includes(activity.sport_type || '') || 
                      gymSports.includes(activity.sportType || '');
        
        if (isGym) {
          const rawDate = activity.start_date || activity.start_date_local || activity.startDate;
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
    })
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
        
        allActivities = [...allActivities, ...(activities as StravaActivity[])];
        page++;
        
        if (page > 100) break; 
      }
      
      return allActivities;
    }
  }))
);
