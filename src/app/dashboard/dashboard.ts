import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import {
  trigger,
  transition,
  animate,
  keyframes,
  style
} from '@angular/animations';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    trigger('shake', [
      transition('false <=> true', [
        animate(
          '0.5s',
          keyframes([
            style({ transform: 'translateX(0)', offset: 0 }),
            style({ transform: 'translateX(-6px)', offset: 0.1 }),
            style({ transform: 'translateX(6px)', offset: 0.2 }),
            style({ transform: 'translateX(-6px)', offset: 0.3 }),
            style({ transform: 'translateX(6px)', offset: 0.4 }),
            style({ transform: 'translateX(-6px)', offset: 0.5 }),
            style({ transform: 'translateX(6px)', offset: 0.6 }),
            style({ transform: 'translateX(-6px)', offset: 0.7 }),
            style({ transform: 'translateX(6px)', offset: 0.8 }),
            style({ transform: 'translateX(-6px)', offset: 0.9 }),
            style({ transform: 'translateX(0)', offset: 1 })
          ])
        )
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  otpBoxes: string[] = ['', '', '', '', '', ''];

  expiryTime!: number;
  remainingTime = 0;
  isLoading = false;

  timerSub!: Subscription;
  errorMessage = '';

  shakeTrigger = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // We NO LONGER generate OTP locally. The backend has already sent it.
    this.setExpiry();
    this.startLiveTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // DELETED: generateOtp() - Backend handles this now

  setExpiry(): void {
    this.expiryTime = Date.now() + 60 * 1000;
  }

  startLiveTimer(): void {
    this.timerSub?.unsubscribe();

    this.timerSub = interval(1000).subscribe(() => {
      const diff = Math.floor((this.expiryTime - Date.now()) / 1000);
      this.remainingTime = diff > 0 ? diff : 0;
      this.cdr.detectChanges();
    });
  }

  isDisabled(index: number): boolean {
    const firstEmptyIndex = this.otpBoxes.findIndex(val => val === '');
    if (firstEmptyIndex === -1) {
      return index !== 5;
    }
    return index !== firstEmptyIndex;
  }

  handleInput(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.otpBoxes[index] !== '') {
        input.value = '';
        this.otpBoxes[index] = '';
        return;
      }

      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.value = '';
          this.otpBoxes[index - 1] = '';
          this.cdr.detectChanges();
          prevInput.focus();
        }
      }
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (this.otpBoxes[index] !== '') {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    input.value = event.key;
    this.otpBoxes[index] = event.key;
    this.cdr.detectChanges();

    if (index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  triggerShake(): void {
    this.shakeTrigger = !this.shakeTrigger;
  }

  verifyOtp(): void {
    const enteredOtp = this.otpBoxes.join('');

    if (enteredOtp.length < 6) {
      this.errorMessage = 'Please enter complete code';
      this.triggerShake();
      return;
    }

    if (this.remainingTime === 0) {
      this.errorMessage = 'OTP expired';
      this.triggerShake();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const employeeId = this.authService.getEmployeeId() || '';

    console.log('[Dashboard] Attempting OTP verification:', {
      employeeId: employeeId,
      otpEntered: enteredOtp,
      length: enteredOtp.length
    });

    this.authService.verifyOtp({
      employee_id: employeeId,
      otp_code: enteredOtp
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('[Dashboard] Verification detail:', response);
        if (response.success) {
          console.log('[Dashboard] OTP Verified successfully');
          this.router.navigate(['/secure']);
        } else {
          this.errorMessage = response.message || 'Verification failed';
          this.triggerShake();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Invalid OTP';
        this.triggerShake();
        console.error('[Dashboard] OTP Verification Error:', err);
      }
    });
  }

  resendOtp(): void {
    if (this.remainingTime > 0) return;

    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Add resendOtp to AuthService if available on backend
    // For now, we manually refresh the timer to allow retry
    this.setExpiry();
    this.startLiveTimer();
    this.otpBoxes = ['', '', '', '', '', ''];
    this.isLoading = false;

    setTimeout(() => {
      const firstInput = document.getElementById('otp-0') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 0);
  }
}