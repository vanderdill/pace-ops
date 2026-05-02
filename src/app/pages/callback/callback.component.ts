import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <p>Authenticating with Strava...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: sans-serif;
    }
  `]
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.authService.handleCallback(code).then(() => {
        this.router.navigate(['/']);
      }).catch(err => {
        console.error('Login failed', err);
        this.router.navigate(['/']);
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}
