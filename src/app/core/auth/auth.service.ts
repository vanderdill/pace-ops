import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { DetailedAthlete } from '@strava/index';

interface RawDetailedAthlete extends DetailedAthlete {
  readonly profile_medium?: string;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  athlete: RawDetailedAthlete;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  
  private readonly ACCESS_TOKEN_KEY = 'strava_access_token';
  private readonly REFRESH_TOKEN_KEY = 'strava_refresh_token';
  private readonly EXPIRES_AT_KEY = 'strava_expires_at';
  private readonly ATHLETE_KEY = 'strava_athlete';

  protected readonly athlete = signal<DetailedAthlete | null>(this.getStoredAthlete());

  public login(): void {
    const params = new URLSearchParams({
      client_id: environment.strava.clientId,
      redirect_uri: environment.strava.redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all'
    });
    window.location.href = `${environment.strava.authorizeUrl}?${params.toString()}`;
  }

  public async handleCallback(code: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<StravaTokenResponse>(environment.strava.tokenUrl, {
          client_id: environment.strava.clientId,
          client_secret: environment.strava.clientSecret,
          code,
          grant_type: 'authorization_code'
        })
      );

      this.saveTokens(response);
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  }

  public logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.ATHLETE_KEY);
    this.athlete.set(null);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!token || !expiresAt) {
      return false;
    }

    // Check if expired
    return Number(expiresAt) * 1000 > Date.now();
  }

  public getAthlete(): Signal<DetailedAthlete | null> {
    return this.athlete.asReadonly();
  }

  private saveTokens(response: StravaTokenResponse): void {
    // Map raw snake_case response to camelCase interface
    const mappedAthlete: DetailedAthlete = {
      ...response.athlete,
      profileMedium: response.athlete.profile_medium,
    };

    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(this.EXPIRES_AT_KEY, response.expires_at.toString());
    localStorage.setItem(this.ATHLETE_KEY, JSON.stringify(mappedAthlete));
    this.athlete.set(mappedAthlete);
  }

  private getStoredAthlete(): DetailedAthlete | null {
    const stored = localStorage.getItem(this.ATHLETE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
