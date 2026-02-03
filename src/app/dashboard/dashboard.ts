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

  generatedOtp = '';
  otpBoxes: string[] = ['', '', '', '', '', ''];

  expiryTime!: number;
  remainingTime = 0;

  timerSub!: Subscription;
  errorMessage = '';

  shakeTrigger = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.generateOtp();
    this.setExpiry();
    this.startLiveTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  trackByIndex(index: number): number {
    return index;
  }

  generateOtp(): void {
    this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP:', this.generatedOtp);
  }

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
      // If all filled, only the last one is active
      return index !== 5;
    }
    // Only the first empty box is active
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
          this.cdr.detectChanges(); // Force update to enable prev input
          prevInput.focus();
        }
      }
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // NEW: Prevent overwriting if already filled
    if (this.otpBoxes[index] !== '') {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    input.value = event.key;
    this.otpBoxes[index] = event.key;
    this.cdr.detectChanges(); // Update state to enable next input

    if (index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        // nextInput.disabled = false; // No longer needed, handled by binding
        nextInput.focus();
      }
    }
  }

  private findLastFilledIndex(): number {
    for (let i = this.otpBoxes.length - 1; i >= 0; i--) {
      if (this.otpBoxes[i] !== '') {
        return i;
      }
    }
    return -1;
  }

  triggerShake(): void {
    this.shakeTrigger = !this.shakeTrigger;
  }

  verifyOtp(): void {
    const enteredOtp = this.otpBoxes.join('');

    if (this.remainingTime === 0) {
      this.errorMessage = 'OTP expired';
      this.triggerShake();
      return;
    }

    if (enteredOtp !== this.generatedOtp) {
      this.errorMessage = 'Invalid OTP';
      this.triggerShake();
      return;
    }

    this.router.navigate(['/secure']);
  }

  resendOtp(): void {
    if (this.remainingTime > 0) return;

    this.generateOtp();
    this.setExpiry();
    this.startLiveTimer();
    this.otpBoxes = ['', '', '', '', '', ''];
    this.errorMessage = '';

    setTimeout(() => {
      for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
        if (input) {
          input.disabled = i > 0;
          input.value = '';
        }
      }

      const firstInput = document.getElementById('otp-0') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }
}