import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  animations: [
    trigger('shake', [
      state('false', style({ transform: 'translateX(0)' })),
      state('true', style({ transform: 'translateX(0)' })),
      transition('false <=> true', [
        animate('0.5s', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.1 }),
          style({ transform: 'translateX(10px)', offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-10px)', offset: 0.5 }),
          style({ transform: 'translateX(10px)', offset: 0.6 }),
          style({ transform: 'translateX(-10px)', offset: 0.7 }),
          style({ transform: 'translateX(10px)', offset: 0.8 }),
          style({ transform: 'translateX(-10px)', offset: 0.9 }),
          style({ transform: 'translateX(0)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class Profile {
  employeeId = '';
  captcha = '';
  captchaInput = '';

  showIdError = false;
  errorMessage = '';

  shakeTrigger = false;

  private freshLogin = true;

  isLoading = false;

  constructor(
    private router: Router
  ) {
    if (this.freshLogin) {
      this.generateCaptcha();
      this.freshLogin = false;
    }
  }

  generateCaptcha(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captcha = '';
    for (let i = 0; i < 5; i++) {
      this.captcha += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  validateId(): void {
    this.showIdError = this.employeeId.trim() === '';
  }

  triggerShake(): void {
    this.shakeTrigger = !this.shakeTrigger;
    this.errorMessage = '';
  }

  login(): void {
    this.errorMessage = '';
    this.showIdError = false;
    this.isLoading = true;

    if (this.employeeId.trim() === '') {
      this.showIdError = true;
      this.triggerShake();
      this.isLoading = false;
      return;
    }

    if (this.captchaInput.trim().toUpperCase() !== this.captcha) {
      this.captchaInput = '';
      this.triggerShake();
      this.isLoading = false;
      return;
    }

    this.shakeTrigger = false;
    this.errorMessage = '';

    this.freshLogin = true;

    setTimeout(() => {
      this.isLoading = false;

      localStorage.setItem('employeeId', this.employeeId);

      console.log('Login successful. Navigating to dashboard...');

      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  resetForNewLogin(): void {
    this.employeeId = '';
    this.captchaInput = '';
    this.errorMessage = '';
    this.showIdError = false;
    this.shakeTrigger = false;
    this.isLoading = false;

    if (this.freshLogin) {
      this.generateCaptcha();
      this.freshLogin = false;
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('employeeId') !== null;
  }

  getStoredEmployeeId(): string | null {
    return localStorage.getItem('employeeId');
  }

  logout(): void {
    localStorage.removeItem('employeeId');
    this.resetForNewLogin();
  }
}