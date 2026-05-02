import { Routes } from '@angular/router';
import { CallbackComponent } from './pages/callback/callback.component';
import { HomeComponent } from './pages/home/home.component';
import { RunHistoryComponent } from './pages/run-history/run-history.component';
import { GymHistoryComponent } from './pages/gym-history/gym-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'run-history', component: RunHistoryComponent },
  { path: 'gym-history', component: GymHistoryComponent }
];
