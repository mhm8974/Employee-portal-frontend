import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrgMember {
    name: string;
    designation: string;
    department: string;
    manager: string;
    status: 'Active' | 'On Leave';
}

@Component({
    selector: 'app-org-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './org-chart.html',
    styleUrls: ['./org-chart.css']
})
export class OrgChartComponent {
    teamMembers: OrgMember[] = [
        { name: 'Employee 1', designation: 'General Manager', department: 'Operations', manager: '-', status: 'Active' },
        { name: 'Employee 2', designation: 'Senior Manager', department: 'HR', manager: 'Employee 1', status: 'Active' },
        { name: 'Employee 3', designation: 'Technical Lead', department: 'Engineering', manager: 'Employee 1', status: 'Active' },
        { name: 'Employee 4', designation: 'HR Specialist', department: 'HR', manager: 'Employee 2', status: 'Active' },
        { name: 'Employee 5', designation: 'Software Engineer', department: 'Engineering', manager: 'Employee 3', status: 'On Leave' },
        { name: 'Employee 6', designation: 'QA Engineeer', department: 'Engineering', manager: 'Employee 3', status: 'Active' }
    ];
}
