import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlySessionComponent } from './components/yearly-session/yearly-session.component';
import { MonthlyHrStatsComponent } from '../../shared/components/monthly-hr-stats/monthly-hr-stats.component';

@Component({
  selector: 'app-gym-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlySessionComponent, MonthlyHrStatsComponent],
  templateUrl: './gym-history.component.html'
})
export class GymHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);

  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
