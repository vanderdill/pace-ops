import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div class="relative flex flex-col items-center max-w-sm w-full text-center">
        <!-- Spinner Backdrop -->
        <div class="absolute inset-0 bg-strava/5 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        <!-- Loading Spinner -->
        <div class="relative mb-8">
          <div class="w-20 h-20 border-4 border-strava/20 border-t-strava rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-strava animate-pulse">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.596l2.836 5.598h4.172L10.463 0l-7.85 15.483h4.173" fill="currentColor" />
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold mb-3 tracking-tight">Authenticating...</h2>
        <p class="text-text-muted leading-relaxed">
          Connecting your Strava account to <span class="text-strava font-semibold">Pace Ops</span>. 
          This will only take a moment.
        </p>
        
        <!-- Progress Indicator -->
        <div class="mt-8 w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div class="bg-strava h-full animate-progress-indeterminate"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes progress-indeterminate {
      0% { transform: translateX(-100%) scaleX(0.2); }
      50% { transform: translateX(0%) scaleX(0.5); }
      100% { transform: translateX(100%) scaleX(0.2); }
    }
    .animate-progress-indeterminate {
      animation: progress-indeterminate 2s infinite linear;
      transform-origin: left;
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
