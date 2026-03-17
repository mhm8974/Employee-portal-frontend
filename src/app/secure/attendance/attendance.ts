import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

interface AttendanceRecord {
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    status: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
}

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './attendance.html',
    styleUrls: ['./attendance.css']
})
export class AttendanceComponent implements OnInit, OnDestroy {
    currentTime: Date = new Date();
    private timerSub!: Subscription;

    history: AttendanceRecord[] = [
        { date: 'Feb 20, 2026', checkIn: '09:05 AM', checkOut: '05:30 PM', totalHours: '08:25', status: 'Present' },
        { date: 'Feb 19, 2026', checkIn: '09:12 AM', checkOut: '05:45 PM', totalHours: '08:33', status: 'Present' },
        { date: 'Feb 18, 2026', checkIn: '08:55 AM', checkOut: '05:15 PM', totalHours: '08:20', status: 'Present' },
        { date: 'Feb 17, 2026', checkIn: '09:30 AM', checkOut: '05:30 PM', totalHours: '08:00', status: 'Present' },
        { date: 'Feb 16, 2026', checkIn: '09:02 AM', checkOut: '05:20 PM', totalHours: '08:18', status: 'Present' },
    ];

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.startLiveClock();
    }

    ngOnDestroy(): void {
        this.timerSub?.unsubscribe();
    }

    startLiveClock(): void {
        this.timerSub = interval(1000).subscribe(() => {
            this.currentTime = new Date();
            this.cdr.detectChanges();
        });
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
}
