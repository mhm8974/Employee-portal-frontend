import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PolicyDocument {
    name: string;
    category: string;
    lastUpdated: string;
    content: string;
}

@Component({
    selector: 'app-company-policy',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './company-policy.html',
    styleUrls: ['./company-policy.css']
})
export class CompanyPolicyComponent {
    policies: PolicyDocument[] = [
        {
            name: 'Code of Conduct & Ethics',
            category: 'General',
            lastUpdated: 'Jan 10, 2026',
            content: 'Employees are expected to maintain the highest standards of professional and personal integrity. This includes honesty in all dealings, respect for colleagues, and adherence to legal requirements.'
        },
        {
            name: 'IT & Security Policy',
            category: 'Technology',
            lastUpdated: 'Dec 15, 2025',
            content: 'Company hardware and software resources are provided for professional use. Users must ensure strong passwords, avoid unauthorized downloads, and report suspicious activities immediately.'
        },
        {
            name: 'Leave & Attendance Policy',
            category: 'HR',
            lastUpdated: 'Feb 01, 2026',
            content: 'Standard working hours are 9:30 AM to 6:00 PM. Leave requests must be submitted via the portal at least 48 hours in advance for planned time off.'
        },
        {
            name: 'Travel & Reimbursement',
            category: 'Finance',
            lastUpdated: 'Jan 05, 2026',
            content: 'All business-related expenses must be pre-approved. Claims should be submitted within 7 days of the transaction with valid physical or digital invoices.'
        }
    ];

    get groupedPolicies() {
        return this.policies.reduce((acc, policy) => {
            if (!acc[policy.category]) {
                acc[policy.category] = [];
            }
            acc[policy.category].push(policy);
            return acc;
        }, {} as { [key: string]: PolicyDocument[] });
    }

    get categories() {
        return Object.keys(this.groupedPolicies);
    }

    viewPolicy(policy: PolicyDocument): void {
        console.log('Viewing policy:', policy.name);
        // Mock action: alert('Opening ' + policy.name);
    }
}
