import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { SecureComponent } from './secure/secure';
import { PayslipComponent } from './secure/payslip/payslip';
import { SettingsComponent } from './secure/settings/settings';
import { LeavesComponent } from './secure/leaves/leaves';
import { HelpComponent } from './secure/help/help';
import { HomeComponent } from './secure/home/home';
import { ProfileComponent } from './secure/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    {
        path: 'secure',
        component: SecureComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'payslip', component: PayslipComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'leaves', component: LeavesComponent },
            { path: 'help', component: HelpComponent }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
