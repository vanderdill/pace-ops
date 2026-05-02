import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ActivitiesStore } from './activities.store';
import { DeviceStatsComponent } from './components/device-stats/device-stats.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DeviceStatsComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ActivitiesStore);
  private readonly authService = inject(AuthService);
  protected readonly athlete = this.authService.getAthlete();

  public ngOnInit(): void {
    if (this.athlete()) {
      this.store.loadActivities();
    }
  }

  protected login(): void {
    this.authService.login();
  }
}
