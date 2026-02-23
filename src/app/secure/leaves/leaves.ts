import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LeaveRequest {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
}

@Component({
    selector: 'app-leaves',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './leaves.html',
    styleUrls: ['./leaves.css']
})
export class LeavesComponent {
    leaveBalances = [
        { type: 'Earned Leave (EL)', current: 15, total: 30, color: '#1f3a8a' },
        { type: 'Casual Leave (CL)', current: 6, total: 12, color: '#0ea5e9' },
        { type: 'Sick Leave (SL)', current: 8, total: 10, color: '#10b981' }
    ];

    history: LeaveRequest[] = [
        { id: 1, type: 'Earned Leave', startDate: 'Feb 10, 2026', endDate: 'Feb 12, 2026', days: 3, status: 'Approved', reason: 'Personal work' },
        { id: 2, type: 'Casual Leave', startDate: 'Jan 15, 2026', endDate: 'Jan 15, 2026', days: 1, status: 'Rejected', reason: 'Critical project delivery' },
        { id: 3, type: 'Sick Leave', startDate: 'Dec 05, 2025', endDate: 'Dec 06, 2025', days: 2, status: 'Approved', reason: 'Medical appointment' }
    ];

    showApplyModal = false;

    newLeave = {
        type: 'Earned Leave',
        startDate: '',
        endDate: '',
        reason: ''
    };

    toggleApplyModal(): void {
        this.showApplyModal = !this.showApplyModal;
    }

    submitLeave(): void {
        if (!this.newLeave.startDate || !this.newLeave.endDate || !this.newLeave.reason) {
            alert('Please fill all fields');
            return;
        }

        const start = new Date(this.newLeave.startDate);
        const end = new Date(this.newLeave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const request: LeaveRequest = {
            id: this.history.length + 1,
            type: this.newLeave.type,
            startDate: new Date(this.newLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: new Date(this.newLeave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            days: diffDays,
            status: 'Pending',
            reason: this.newLeave.reason
        };

        this.history.unshift(request);
        this.showApplyModal = false;
        this.newLeave = { type: 'Earned Leave', startDate: '', endDate: '', reason: '' };

        console.log('[Mock Backend] Leave request submitted:', request);
    }
}
