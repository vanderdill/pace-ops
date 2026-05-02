import { Routes } from '@angular/router';
import { CallbackComponent } from './pages/callback/callback.component';
import { HomeComponent } from './pages/home/home.component';
import { YourHistoryComponent } from './pages/your-history/your-history.component';
import { GymHistoryComponent } from './pages/gym-history/gym-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'your-history', component: YourHistoryComponent },
  { path: 'gym-history', component: GymHistoryComponent }
];
