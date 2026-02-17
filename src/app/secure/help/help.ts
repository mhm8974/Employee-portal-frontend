import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HelpCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
}

interface FAQ {
    question: string;
    answer: string;
    category: string;
    isOpen?: boolean;
}

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './help.html',
    styleUrls: ['./help.css']
})
export class HelpComponent {
    searchQuery: string = '';

    categories: HelpCategory[] = [
        {
            id: 'profile',
            title: 'Profile & Personal Info',
            icon: '',
            description: 'Manage your personal details, documents, and profile settings.'
        },
        {
            id: 'attendance',
            title: 'Attendance & Time',
            icon: '',
            description: 'Tracking logs, shift schedules, and regularizing attendance.'
        },
        {
            id: 'payroll',
            title: 'Payroll & Benefits',
            icon: '',
            description: 'Viewing payslips, tax declarations, and understanding deductions.'
        },
        {
            id: 'leaves',
            title: 'Leaves & Holidays',
            icon: '',
            description: 'Applying for leave, checking balances, and holiday calendars.'
        },
        {
            id: 'it-support',
            title: 'IT & Assets',
            icon: '',
            description: 'Requesting hardware, reporting software issues, and asset tracking.'
        },
        {
            id: 'policy',
            title: 'Company Policies',
            icon: '',
            description: 'Employee handbook, code of conduct, and safety guidelines.'
        }
    ];

    faqs: FAQ[] = [
        {
            category: 'payroll',
            question: 'When is the monthly payslip generated?',
            answer: 'Payslips are usually generated on the last working day of every month after the payroll processing is complete.'
        },
        {
            category: 'leaves',
            question: 'How many days in advance should I apply for leave?',
            answer: 'For planned leaves, it is recommended to apply at least 1 week in advance. Emergency leaves can be applied on the day of absence.'
        },
        {
            category: 'profile',
            question: 'How do I update my bank account details?',
            answer: 'You can update your bank details in the "Settings" section under "Payment Information". This may require HR approval.'
        },
        {
            category: 'attendance',
            question: 'What should I do if I forget to clock in?',
            answer: 'You can use the "Manual Log" feature in the Attendance section to request a correction for missing timestamps.'
        }
    ];

    toggleFaq(faq: FAQ): void {
        faq.isOpen = !faq.isOpen;
    }

    get filteredCategories() {
        if (!this.searchQuery) return this.categories;
        return this.categories.filter(c =>
            c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
}
