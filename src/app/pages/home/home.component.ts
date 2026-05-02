import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  protected readonly athlete = this.authService.getAthlete();

  protected login(): void {
    this.authService.login();
  }
}
