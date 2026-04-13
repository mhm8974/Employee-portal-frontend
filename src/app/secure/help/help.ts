import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
    imports: [CommonModule, TranslatePipe, FormsModule],
    templateUrl: './help.html',
    styleUrls: ['./help.css']
})
export class HelpComponent {
    activeCategory: string | null = null;


    categories: HelpCategory[] = [
        {
            id: 'profile',
            title: 'Employee Profile',
            icon: '',
            description: 'Manage your personal information, employment details, and documents.'
        },
        {
            id: 'payslip',
            title: 'Payslip & Payroll',
            icon: '',
            description: 'View your salary details, download payslip PDFs, and track earnings.'
        },
        {
            id: 'leaves',
            title: 'Leaves & Time Off',
            icon: '',
            description: 'Apply for leaves, check your leave balance, and view absence policies.'
        },
        {
            id: 'settings',
            title: 'Account Settings',
            icon: '',
            description: 'Change your password, toggle Dark Mode, and update preferences.'
        }
    ];

    faqs: FAQ[] = [
        {
            category: 'payslip',
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
            category: 'settings',
            question: 'What should I do if I forget to clock in?',
            answer: 'You can use the "Manual Log" feature in the Attendance section to request a correction for missing timestamps.'
        }
    ];

    get filteredFaqs(): FAQ[] {
        if (!this.activeCategory) return this.faqs;
        return this.faqs.filter(faq => faq.category === this.activeCategory);
    }

    viewCategory(categoryId: string): void {
        this.activeCategory = categoryId;
        
        // Collapse all, then expand the first relevant one
        this.faqs.forEach(f => f.isOpen = false);
        const filtered = this.filteredFaqs;
        if (filtered.length > 0) {
            filtered[0].isOpen = true;
        }

        // Smooth scroll to the FAQ section
        setTimeout(() => {
            const faqSection = document.querySelector('.faq-section');
            if (faqSection) {
                faqSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    }

    clearFilter(): void {
        this.activeCategory = null;
    }

    toggleFaq(faq: FAQ): void {
        faq.isOpen = !faq.isOpen;
    }

}
