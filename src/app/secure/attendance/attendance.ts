import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class AttendanceComponent implements OnInit {
    isCheckedIn = false;
    checkInTime: Date | null = null;
    currentTime: Date = new Date();

    history: AttendanceRecord[] = [
        { date: 'Feb 20, 2026', checkIn: '09:05 AM', checkOut: '05:30 PM', totalHours: '08:25', status: 'Present' },
        { date: 'Feb 19, 2026', checkIn: '09:12 AM', checkOut: '05:45 PM', totalHours: '08:33', status: 'Present' },
        { date: 'Feb 18, 2026', checkIn: '08:55 AM', checkOut: '05:15 PM', totalHours: '08:20', status: 'Present' },
        { date: 'Feb 17, 2026', checkIn: '09:30 AM', checkOut: '05:30 PM', totalHours: '08:00', status: 'Present' },
        { date: 'Feb 16, 2026', checkIn: '09:02 AM', checkOut: '05:20 PM', totalHours: '08:18', status: 'Present' },
    ];

    ngOnInit(): void {
        setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    }

    toggleCheckIn(): void {
        if (!this.isCheckedIn) {
            this.isCheckedIn = true;
            this.checkInTime = new Date();
        } else {
            const checkOutTime = new Date();
            const newRecord: AttendanceRecord = {
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                checkIn: this.formatTime(this.checkInTime!),
                checkOut: this.formatTime(checkOutTime),
                totalHours: '08:00', // Mock value for now
                status: 'Present'
            };
            this.history.unshift(newRecord);
            this.isCheckedIn = false;
            this.checkInTime = null;
        }
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

}
