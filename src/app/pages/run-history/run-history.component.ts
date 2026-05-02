import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlyDistanceComponent } from './components/yearly-distance/yearly-distance.component';
import { MonthlyHrStatsComponent } from './components/monthly-hr-stats/monthly-hr-stats.component';

@Component({
  selector: 'app-run-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlyDistanceComponent, MonthlyHrStatsComponent],
  templateUrl: './run-history.component.html'
})
export class RunHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);
  
  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
