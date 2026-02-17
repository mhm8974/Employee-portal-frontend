import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { DashboardComponent } from './dashboard/dashboard';
import { SecureComponent } from './secure/secure';
import { ProfileViewComponent } from './secure/profile-view/profile-view';
import { SettingsComponent } from './secure/settings/settings';
import { PlaceholderComponent } from './secure/placeholder/placeholder';
import { HelpComponent } from './secure/help/help';

export const routes: Routes = [
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'profile', component: Profile },
    { path: 'dashboard', component: DashboardComponent },
    {
        path: 'secure',
        component: SecureComponent,
        children: [
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            { path: 'profile', component: ProfileViewComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'attendance', component: PlaceholderComponent, data: { title: 'Attendance & Timelogs' } },
            { path: 'leaves', component: PlaceholderComponent, data: { title: 'Leaves & Time Off' } },
            { path: 'org-chart', component: PlaceholderComponent, data: { title: 'Organization Chart' } },
            { path: 'company-policy', component: PlaceholderComponent, data: { title: 'Company Policy' } },
            { path: 'tax', component: PlaceholderComponent, data: { title: 'Tax Declarations' } },
            { path: 'assets', component: PlaceholderComponent, data: { title: 'Assets & Devices' } },
            { path: 'help', component: HelpComponent }
        ]
    },
    { path: '**', redirectTo: 'profile' }
];
