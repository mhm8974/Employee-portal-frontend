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
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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
  isResending = false;

  timerSub!: Subscription;
  errorMessage = '';

  shakeTrigger = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  emailOtpSent = false;
  smsOtpSent = false;
  maskedPhone = '';
  maskedEmail = '';
  activeTab: 'email' | 'sms' = 'email';

  setActiveTab(tab: 'email' | 'sms'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    const smsOtpSentRaw = localStorage.getItem('sms_otp_sent');
    this.smsOtpSent = smsOtpSentRaw === 'true';
    if (this.smsOtpSent) {
      this.activeTab = 'sms';
      this.maskedPhone = localStorage.getItem('masked_phone') || '';
      this.maskedEmail = localStorage.getItem('masked_email') || '';
      this.setExpiry();
      this.startLiveTimer();
    }
  }

  sendEmailOtp(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const empId = localStorage.getItem('employeeId') || '';

    this.authService.resendOtp(empId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.emailOtpSent = true;
          this.setExpiry();
          this.startLiveTimer();

          // Automatically focus first input box
          setTimeout(() => {
            const firstInput = document.getElementById('otp-0') as HTMLInputElement;
            if (firstInput) firstInput.focus();
          }, 50);
        } else {
          this.errorMessage = response.message || 'Failed to send OTP';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Service unavailable';
        this.cdr.detectChanges();
      }
    });
  }

  sendSmsOtp(): void {
    this.isResending = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const empId = localStorage.getItem('employeeId') || '';

    // Request the backend to trigger the SMS OTP
    this.authService.resendOtp(empId).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.smsOtpSent = true;
          this.setExpiry();
          this.startLiveTimer();

          setTimeout(() => {
            const firstInput = document.getElementById('otp-0') as HTMLInputElement;
            if (firstInput) firstInput.focus();
          }, 50);
        } else {
          this.errorMessage = response.message || 'Failed to send SMS OTP';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Service unavailable';
        this.cdr.detectChanges();
      }
    });
  }

  verifyMsg91Token(accessToken: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('[Dashboard] Sending verifyMsg91Token request to backend...');
    this.authService.verifyMsg91Token(accessToken).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('[Dashboard] verifyMsg91Token backend response:', response);
        if (response.success) {
          console.log('[Dashboard] SMS token verified successfully. Navigating...');
          this.router.navigate(['/secure']);
        } else {
          console.warn('[Dashboard] SMS token verification failed:', response.message);
          this.errorMessage = response.message || 'Token verification failed';
          this.triggerShake();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[Dashboard] verifyMsg91Token backend request error:', err);
        this.errorMessage = err.message || 'Server error';
        this.triggerShake();
        this.cdr.detectChanges();
      }
    });
  }

  verifySmsOtp(): void {
    const enteredOtp = this.otpBoxes.join('');

    if (enteredOtp.length !== 6) {
      this.errorMessage = 'Please enter a 6-digit OTP code';
      this.triggerShake();
      return;
    }

    const employeeId = localStorage.getItem('employeeId') || '';
    if (!employeeId) {
      this.errorMessage = 'Employee ID missing. Please log in again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.verifySmsOtp(employeeId, enteredOtp).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          localStorage.setItem('auth_token', response.token || '');
          this.router.navigate(['/secure']);
        } else {
          this.errorMessage = response.message || 'Verification failed. Please try again.';
          this.triggerShake();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Verification failed. Please try again.';
        this.triggerShake();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }

  setExpiry(): void {
    this.expiryTime = Date.now() + 60 * 1000; // 60 seconds from now
  }

  startLiveTimer(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }

    this.timerSub = interval(1000).subscribe(() => {
      const diff = Math.floor((this.expiryTime - Date.now()) / 1000);
      this.remainingTime = diff > 0 ? diff : 0;
      this.cdr.detectChanges();
    });
  }

  isDisabled(index: number): boolean {
    if (this.remainingTime === 0) return true;
    if (index === 0) return false;
    return this.otpBoxes[index - 1] === '';
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  handleInput(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.otpBoxes[index] !== '') {
        this.otpBoxes[index] = '';
      } else if (index > 0) {
        this.otpBoxes[index - 1] = '';
        setTimeout(() => {
          const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
          }
        }, 0);
      }
      this.cdr.detectChanges();
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
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 1);
    this.otpBoxes[index] = value;

    if (value && index < 5) {
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Backspace') {
      return;
    }

    event.preventDefault();
    this.otpBoxes[index] = '';

    if (index > 0) {
      setTimeout(() => {
        const previous = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (previous) {
          previous.focus();
        }
      }, 0);
    }
  }

  triggerShake(): void {
    this.shakeTrigger = !this.shakeTrigger;
  }

  verifyOtp(): void {
    const enteredOtp = this.otpBoxes.join('');

    if (enteredOtp.length < 6) {
      this.errorMessage = 'Please enter a 6-digit OTP code';
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
    this.cdr.detectChanges();

    const empId = localStorage.getItem('employeeId') || '';

    this.authService.verifyOtp({ employee_id: empId, otp_code: enteredOtp }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          console.log('[Dashboard] OTP verified successfully. Navigating...');
          this.router.navigate(['/secure']);
        } else {
          this.errorMessage = response.message || 'Invalid OTP';
          this.triggerShake();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Verification failed';
        this.triggerShake();
        this.cdr.detectChanges();
      }
    });
  }

  resendOtp(): void {
    if (this.remainingTime > 0) return;

    this.isResending = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const empId = localStorage.getItem('employeeId') || '';

    this.authService.resendOtp(empId).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.otpBoxes = ['', '', '', '', '', ''];
          this.setExpiry();
          this.startLiveTimer();

          setTimeout(() => {
            const firstInput = document.getElementById('otp-0') as HTMLInputElement;
            if (firstInput) {
              firstInput.focus();
            }
          }, 0);
        } else {
          this.errorMessage = response.message || 'Resend failed';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isResending = false;
        this.errorMessage = err.message || 'Resend failed';
        this.cdr.detectChanges();
      }
    });
  }

  launchSmsWidget(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const mobile = this.authService.getSmsMobile();
    if (!mobile) {
      this.isLoading = false;
      this.errorMessage = 'SMS OTP unavailable because your phone number is not available. Please use Email OTP.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.initMsg91Widget(
      (data: any) => {
        this.isLoading = false;
        console.log('[Dashboard] MSG91 Success:', data);
        let token: string | null = null;
        if (typeof data === 'string') {
          token = data;
        } else if (data) {
          token = data.access_token || data.response || data.message || data.token;
        }

        if (token) {
          console.log('[Dashboard] MSG91 Success payload:', data);
          console.log('[Dashboard] MSG91 token received. Verifying with backend...', token);
          this.verifyMsg91Token(token);
        } else {
          console.warn('[Dashboard] MSG91 success but no token in payload:', data);
          this.errorMessage = 'SMS Verification succeeded, but no token was returned.';
          this.cdr.detectChanges();
        }
      },
      (error: any) => {
        this.isLoading = false;
        console.error('[Dashboard] MSG91 Error:', error);
        this.errorMessage = 'SMS Verification crashed or was cancelled.';
        this.cdr.detectChanges();
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}