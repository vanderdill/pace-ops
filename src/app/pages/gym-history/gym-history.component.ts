import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlySessionChartComponent } from './components/yearly-session-chart/yearly-session-chart.component';
import { MonthlyHrStatsChartComponent } from '../../shared/components/monthly-hr-stats-chart/monthly-hr-stats-chart.component';

@Component({
  selector: 'app-gym-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlySessionChartComponent, MonthlyHrStatsChartComponent],
  templateUrl: './gym-history.component.html'
})
export class GymHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);

  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
