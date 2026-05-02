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

interface HistoryState {
  activities: StravaActivity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  activities: [],
  isLoading: false,
  error: null,
};



export const YourHistoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ activities }) => ({
    yearlyKms: computed(() => {
      const data: Record<number, number> = {};
      
      activities().forEach((activity) => {
        const isRun = activity.type === 'Run' || activity.sport_type === 'Run' || activity.sportType === 'Run';
        
        if (isRun) {
          const rawDate = activity.start_date || activity.start_date_local || activity.startDate;
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
        
        patchState(store, { activities, isLoading: false });
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
        
        allActivities = [...allActivities, ...activities];
        page++;
        
        // Safety break to avoid infinite loops if API behaves unexpectedly
        if (page > 100) break; 
      }
      
      return allActivities;
    }
  }))
);
