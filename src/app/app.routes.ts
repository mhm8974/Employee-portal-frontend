import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { DashboardComponent } from './dashboard/dashboard';
import { SecureComponent } from './secure/secure';
import { ProfileViewComponent } from './secure/profile-view/profile-view';
import { SettingsComponent } from './secure/settings/settings';
import { PlaceholderComponent } from './secure/placeholder/placeholder';
import { AttendanceComponent } from './secure/attendance/attendance';
import { LeavesComponent } from './secure/leaves/leaves';
import { TaxComponent } from './secure/tax/tax';
import { AssetsComponent } from './secure/assets/assets';
import { HelpComponent } from './secure/help/help';

import { OrgChartComponent } from './secure/org-chart/org-chart';
import { CompanyPolicyComponent } from './secure/company-policy/company-policy';

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
            { path: 'attendance', component: AttendanceComponent },
            { path: 'leaves', component: LeavesComponent },
            { path: 'attendance', component: AttendanceComponent },
            { path: 'leaves', component: LeavesComponent },
            { path: 'tax', component: TaxComponent },
            { path: 'help', component: HelpComponent }
        ]
    },
    { path: '**', redirectTo: 'profile' }
];
