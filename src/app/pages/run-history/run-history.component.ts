import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlyDistanceComponent } from './components/yearly-distance/yearly-distance.component';
import { MonthlyMaxHrComponent } from './components/monthly-max-hr/monthly-max-hr.component';

@Component({
  selector: 'app-run-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlyDistanceComponent, MonthlyMaxHrComponent],
  templateUrl: './run-history.component.html'
})
export class RunHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);
  
  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
