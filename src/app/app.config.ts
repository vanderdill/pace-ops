import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ApiModule, Configuration } from '@strava/index';
import { AuthService } from './core/auth/auth.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      ApiModule.forRoot(() => {
        const authService = inject(AuthService);
        return new Configuration({
          accessToken: () => authService.getToken() || ''
        });
      })
    )
  ]
};
