import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { DashboardComponent } from './dashboard/dashboard';

import { SecureComponent } from './secure/secure';

export const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: Profile },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'secure', component: SecureComponent },
  { path: '**', redirectTo: 'profile' }
];