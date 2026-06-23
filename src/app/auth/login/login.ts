import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
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
export class LoginComponent implements OnInit {
  employeeId = '';
  captchaId = '';
  captchaImage = '';
  captchaInput = '';

  showIdError = false;
  captchaError = false;
  errorMessage = '';
  shakeTrigger = false;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    
    setTimeout(() => {
      this.loadCaptcha();
    }, 500);
  }

  loadCaptcha(): void {
    console.log('[Profile] Initializing CAPTCHA load...');

    this.authService.getCaptcha().subscribe({
      next: (response: any) => {
        console.log('[Profile] CAPTCHA loaded successfully:', response.captcha_id);

        this.captchaImage = response.image;
        this.captchaId = response.captcha_id;

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('[Profile] Failed to load CAPTCHA:', err);
        this.errorMessage = 'Failed to load CAPTCHA. Please refresh.';
        this.cdr.detectChanges(); 
      }
    });
  }

  validateId(): void {
    this.showIdError = this.employeeId.trim() === '';
  }

  triggerShake(): void {
    this.shakeTrigger = !this.shakeTrigger;
    this.errorMessage = '';
  }

  login(): void {
    if (this.isLoading) return; 

    this.errorMessage = '';
    this.showIdError = false;
    this.captchaError = false;
    this.isLoading = true;

    if (this.employeeId.trim() === '') {
      this.showIdError = true;
      this.triggerShake();
      this.isLoading = false;
      return;
    }

    
    if (!this.captchaInput) {
      this.errorMessage = 'CAPTCHA is required';
      this.triggerShake();
      this.isLoading = false;
      return;
    }

    const cleanId = (this.captchaId || '').trim();
    const cleanInput = (this.captchaInput || '').trim();
    const cleanEmployeeId = (this.employeeId || '').trim();

    const loginData = {
      employee_id: cleanEmployeeId,
      captcha_id: cleanId,
      captcha_text: cleanInput
    };

    console.warn('[Profile] SENDING LOGIN:', loginData);


    this.authService.login(loginData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        console.log('[Profile] Login response payload:', response);

        
        if ((response as any).dev_hint_otp) {
          console.warn('--- DEV MODE: OTP IS ' + (response as any).dev_hint_otp + ' ---');
          alert('DEV MODE DETECTED! OTP is: ' + (response as any).dev_hint_otp);
        }

        const respData = (response as any).data || response;
        console.log('[Profile] Normalized Response Data:', respData);

        const isSuccess = response.success === true ||
          respData.success === true ||
          (response as any).status === 'success' ||
          (respData as any).status === 'success';

        if (isSuccess) {
          const idToStore = respData.employee_id || response.employee_id || cleanEmployeeId;
          localStorage.setItem('employeeId', String(idToStore));
          localStorage.setItem('sms_otp_sent', String(respData.sms_otp_sent === true));
          localStorage.setItem('masked_phone', respData.masked_phone || '');
          localStorage.setItem('masked_email', respData.masked_email || '');
          localStorage.setItem('unmasked_phone', respData.unmasked_phone || response.unmasked_phone || '');

          const requiresOtp = response.requires_otp !== false && respData.requires_otp !== false;
          const target = requiresOtp ? '/dashboard' : '/secure'; 
          console.log(`[Profile] Success detected. Navigating to ${target}...`);

          this.router.navigate([target]).then(navSuccess => {
            if (navSuccess) {
              console.log(`[Profile] Successfully navigated to ${target}`);
            } else {
              console.error(`[Profile] Navigation to ${target} was REJECTED by the router. Check your Route Guards.`);
            }
          }).catch(err => {
            console.error(`[Profile] Navigation to ${target} CRASHED:`, err);
          });
        } else {
          const msg = response.message || 'Login failed';
          this.errorMessage = msg;
          console.warn('[Profile] Login rejected by backend:', msg);

          
          const isCaptchaError = msg.toLowerCase().includes('captcha');
          if (isCaptchaError) {
            this.captchaError = true;
            this.captchaInput = ''; 
            this.loadCaptcha();
          } 

          this.triggerShake();
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || err.message || 'Server error';
        this.errorMessage = msg;
        console.error('[Profile] HTTP Error during login:', err);

        const isCaptchaError = msg.toLowerCase().includes('captcha');
        if (isCaptchaError) {
          this.captchaError = true;
          this.loadCaptcha();
        }

        this.triggerShake();
      }
    });
  }

  resetForNewLogin(): void {
    this.employeeId = '';
    this.captchaInput = '';
    this.errorMessage = '';
    this.showIdError = false;
    this.shakeTrigger = false;
    this.isLoading = false;
    this.loadCaptcha();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getStoredEmployeeId(): string | null {
    return this.authService.getEmployeeId();
  }

  logout(): void {
    this.authService.logout();
    this.resetForNewLogin();
  }
}