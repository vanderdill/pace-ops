import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivitiesStore } from '../home/activities.store';
import { YearlySessionComponent } from './components/yearly-session/yearly-session.component';

@Component({
  selector: 'app-gym-history',
  standalone: true,
  imports: [CommonModule, RouterLink, YearlySessionComponent],
  templateUrl: './gym-history.component.html'
})
export class GymHistoryComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);

  public ngOnInit(): void {
    this.store.loadActivities();
  }
}
