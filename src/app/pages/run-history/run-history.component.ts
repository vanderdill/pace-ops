import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlyDistanceChartComponent } from './components/yearly-distance-chart/yearly-distance-chart.component';
import { MonthlyHrStatsChartComponent } from '../../shared/components/monthly-hr-stats-chart/monthly-hr-stats-chart.component';

@Component({
  selector: 'app-run-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlyDistanceChartComponent, MonthlyHrStatsChartComponent],
  templateUrl: './run-history.component.html'
})
export class RunHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);
  
  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
