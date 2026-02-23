import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Investment {
    id: number;
    category: string;
    section: string;
    amount: number;
    status: 'Declared' | 'Verified' | 'Rejected';
    proofStatus: 'Pending' | 'Uploaded' | 'Approved';
}

@Component({
    selector: 'app-tax',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tax.html',
    styleUrls: ['./tax.css']
})
export class TaxComponent {
    financialYear = '2025-2026';

    investments: Investment[] = [
        { id: 1, category: 'Life Insurance Premium', section: '80C', amount: 45000, status: 'Verified', proofStatus: 'Approved' },
        { id: 2, category: 'Public Provident Fund (PPF)', section: '80C', amount: 150000, status: 'Verified', proofStatus: 'Approved' },
        { id: 3, category: 'Health Insurance', section: '80D', amount: 25000, status: 'Declared', proofStatus: 'Pending' }
    ];

    summary = {
        grossIncome: 1200000,
        totalInvestments: 220000,
        taxableIncome: 980000,
        estimatedTax: 85000
    };

    showDeclareModal = false;
    newInvestment = {
        category: 'Life Insurance Premium',
        section: '80C',
        amount: 0
    };

    sections = ['80C', '80D', '80E', '80G', 'HRA', 'Section 24 (Housing Loan)'];

    toggleDeclareModal(): void {
        this.showDeclareModal = !this.showDeclareModal;
    }

    submitDeclaration(): void {
        if (this.newInvestment.amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const investment: Investment = {
            id: this.investments.length + 1,
            category: this.newInvestment.category,
            section: this.newInvestment.section,
            amount: this.newInvestment.amount,
            status: 'Declared',
            proofStatus: 'Pending'
        };

        this.investments.unshift(investment);
        this.summary.totalInvestments += investment.amount;
        this.summary.taxableIncome = this.summary.grossIncome - this.summary.totalInvestments;
        // Simple mock tax calculation logic
        this.summary.estimatedTax = Math.max(0, (this.summary.taxableIncome - 500000) * 0.15 + 12500);

        this.showDeclareModal = false;
        this.newInvestment = { category: 'Life Insurance Premium', section: '80C', amount: 0 };

        console.log('[Mock Backend] Tax declaration submitted:', investment);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }
}
