import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout, retry } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface LoginRequest {
  employee_id: string;
  captcha_id: string;
  captcha_text: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  employee_id?: string;
  employee_type?: string;
  sms_otp_sent?: boolean;
  masked_phone?: string;
  masked_email?: string;
  otp_sent_to?: string;
  employee_data?: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    email?: string;
    mobile?: string;
    date_of_birth?: string;
  };
}

export interface VerifyOTPRequest {
  employee_id: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  employee_id?: string;
  employee_type?: string;
  employee_data?: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    email?: string;
    mobile?: string;
    date_of_birth?: string;
  };
}

export interface UserProfile {
  id?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  department?: string;
  position?: string;
  email?: string;
  mobile?: string;
  date_of_birth?: string;
  hire_date?: string;
  appointment_date?: string;
  retirement_date?: string;
  join_date?: string;
  cpf_no?: string;
  profile_image?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bank_account?: string;
  ifsc_code?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  public useMockData = true; // false for backend ,true for mock



  constructor(private http: HttpClient) { }

  getCaptcha(): Observable<{ captcha_id: string, image: string }> {
    console.log('[AuthService] Fetching CAPTCHA from:', `${this.apiUrl}/captcha`);
    return this.http.get<{ captcha_id: string, image: string }>(`${this.apiUrl}/captcha`).pipe(
      timeout(10000), // Wait for 10s
      catchError(error => {
        console.error('[AuthService] CAPTCHA fetch failed:', error);
        return throwError(() => error);
      })
    );
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('[AuthService] Sending login payload (No Password):', loginData);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      loginData,
      { headers }
    ).pipe(
      timeout(15000), // Wait for max 15 seconds
      tap(response => {
        console.log('[AuthService] Login response received:', response);

        // Robust extraction of token and employee_id from potential nested data
        const respData = (response as any).data || response;
        const token = response.token || respData.token;
        const employeeId = response.employee_id || respData.employee_id || (respData.user ? respData.user.employee_id : null);

        if (token) {
          console.log('[AuthService] Saving token...');
          this.setToken(token);
        }

        if (employeeId) {
          console.log('[AuthService] Saving employeeId:', employeeId);
          localStorage.setItem('employeeId', String(employeeId));
        }

        if (response.employee_data || respData.employee_data) {
          this.storeUserData(response.employee_data || respData.employee_data);
        }
      }),
      catchError(error => {
        console.error('[AuthService] Login request failed:', error);
        return this.handleError(error);
      })
    );
  }

  verifyOtp(otpData: VerifyOTPRequest): Observable<VerifyOTPResponse> {
    if (this.useMockData) {
      console.log('[AuthService] Mock Mode: Verifying OTP...', otpData);
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: 'OTP Verified successfully',
            token: 'mock-token-12345',
            employee_data: {
              id: 1,
              employee_id: otpData.employee_id,
              first_name: 'Mock',
              last_name: 'User',
              department: 'IT',
              position: 'Developer',
              email: 'mock@example.com',
              mobile: '9876543210',
              date_of_birth: '1990-01-01'
            }
          });
          observer.complete();
        }, 800);
      });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    console.log('[AuthService] Sending OTP Verification:', {
      url: `${this.apiUrl}/auth/verify-otp`,
      payload: otpData,
      hasToken: !!this.getToken()
    });

    return this.http.post<VerifyOTPResponse>(
      `${this.apiUrl}/auth/verify-otp`,
      otpData,
      { headers }
    ).pipe(
      tap((response: any) => {
        console.log('[AuthService] OTP Verification Response:', response);

        // Save the session token
        if (response.token) {
          this.setToken(response.token);
        }

        // Save the employee_id from the OTP response (critical for profile calls)
        if (response.employee_id) {
          console.log('[AuthService] Storing employee_id from OTP response:', response.employee_id);
          localStorage.setItem('employeeId', String(response.employee_id));
        }

        // Save employee_type if provided
        if (response.employee_type) {
          localStorage.setItem('employee_type', response.employee_type);
        }

        // Store full employee data if nested object is provided
        if (response.employee_data) {
          this.storeUserData(response.employee_data);
        }
      }),
      catchError(error => {
        console.error('[AuthService] OTP Verification Failed:', error);
        return this.handleError(error);
      })
    );
  }

  resendOtp(employeeId: string): Observable<any> {
    if (this.useMockData) {
      console.log('[AuthService] Mock Mode: Resending OTP for:', employeeId);
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true, message: 'OTP resent successfully' });
          observer.complete();
        }, 800);
      });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(
      `${this.apiUrl}/auth/resend-otp`,
      { employee_id: employeeId },
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  initMsg91Widget(successCallback: (data: any) => void, failureCallback: (error: any) => void): void {
    const checkAndInit = (attempts = 0) => {
      if ((window as any).initSendOTP) {
        console.log('[AuthService] MSG91 Script found. Initializing...');

        const mobile = this.getSmsMobile();
        if (!mobile) {
          console.warn('[AuthService] No mobile number available for SMS OTP.');
          failureCallback('SMS OTP unavailable because no mobile number is available from the backend.');
          return;
        }

        const configuration = {
          widgetId: environment.msg91WidgetId,
          tokenAuth: environment.msg91AuthToken,
          identifier: mobile, // Pre-fill the mobile number
          hideMethod: 'mobile', // hide the mobile entry field
          exposeMethods: false, // false = show the SMS popup automatically
          success: (data: any) => {
            console.log('[AuthService] MSG91 Success:', data);
            successCallback(data);
          },
          failure: (error: any) => {
            console.error('[AuthService] MSG91 Failure:', error);
            failureCallback(error);
          }
        };
        (window as any).initSendOTP(configuration);
      } else if (attempts < 5) {
        console.warn(`[AuthService] MSG91 script not ready, retrying attempt ${attempts + 1}...`);
        setTimeout(() => checkAndInit(attempts + 1), 1000);
      } else {
        console.error('[AuthService] MSG91 script not loaded after 5 attempts');
        failureCallback('MSG91 script not loaded');
      }
    };

    checkAndInit();
  }

  verifyMsg91Token(accessToken: string): Observable<VerifyOTPResponse> {
    const employeeId = this.getEmployeeId();
    if (!employeeId) {
      console.error('[AuthService] No employeeId found in localStorage for verification');
      return throwError(() => new Error('Employee ID missing. Please log in again.'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      token: accessToken,
      access_token: accessToken,
      employee_id: employeeId
    };
    console.log('[AuthService] Sending verifyMsg91Token payload:', payload);

    return this.http.post<VerifyOTPResponse>(
      `${this.apiUrl}/auth/verify-msg91-token`,
      payload,
      { headers }
    ).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);

          // Store critical user session data
          if (response.employee_id) {
            localStorage.setItem('employeeId', String(response.employee_id));
          }
          if (response.employee_type) {
            localStorage.setItem('employee_type', response.employee_type);
          }
          if (response.employee_data) {
            this.storeUserData(response.employee_data);
          }
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  verifySmsOtp(employeeId: string, otpCode: string): Observable<VerifyOTPResponse> {
    return this.http.post<VerifyOTPResponse>(
      `${this.apiUrl}/auth/verify-sms-otp`,
      { employee_id: employeeId, otp_code: otpCode }
    );
  }

  getUserProfile(): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<UserProfile>(
      `${this.apiUrl}/auth/profile`,
      { headers }
    ).pipe(
      tap(profile => {
        this.storeUserData(profile);
      }),
      catchError(this.handleError)
    );
  }

  updateUserProfile(userData: Partial<UserProfile>): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.put<UserProfile>(
      `${this.apiUrl}/auth/profile`,
      userData,
      { headers }
    ).pipe(
      tap(updatedProfile => {
        this.storeUserData(updatedProfile);
      }),
      catchError(this.handleError)
    );
  }

  private storeUserData(userData: any): void {
    if (userData.first_name && userData.last_name && !userData.full_name) {
      userData.full_name = `${userData.first_name} ${userData.last_name}`;
    }

    localStorage.setItem('user_data', JSON.stringify(userData));

    if (userData.mobile) {
      const sessionData = {
        mobile: userData.mobile,
        employee_id: userData.employee_id || localStorage.getItem('employeeId') || ''
      };
      localStorage.setItem('pranali_session', JSON.stringify(sessionData));
    }
  }

  getUserData(): UserProfile | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  getSmsMobile(): string | null {
    const userData = this.getUserData();
    if (userData?.mobile) {
      return userData.mobile;
    }

    const sessionData = localStorage.getItem('pranali_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.mobile || null;
      } catch {
        return null;
      }
    }

    return null;
  }

  getCurrentUserName(): string {
    const userData = this.getUserData();
    return userData?.full_name || userData?.first_name || 'Guest';
  }

  getCurrentUserDepartment(): string {
    const userData = this.getUserData();
    return userData?.department || 'N/A';
  }

  getCurrentUserDOB(): string | undefined {
    const userData = this.getUserData();
    return userData?.date_of_birth;
  }

  getFormattedDOB(): string {
    const dob = this.getCurrentUserDOB();
    if (!dob) return 'N/A';

    try {
      const date = new Date(dob);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day} - ${month} - ${year}`;
    } catch (error) {
      return dob;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('user_data');
  }

  getEmployeeId(): string | null {
    return localStorage.getItem('employeeId');
  }

  validateToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.apiUrl}/auth/validate-token`, { headers })
      .pipe(catchError(this.handleError));
  }

  getEmployeeData(): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<UserProfile>(`${this.apiUrl}/employees/me`, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);

    let errorMessage = 'An error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.detail) {
      errorMessage = Array.isArray(error.error.detail)
        ? error.error.detail.map((d: any) => d.msg).join(', ')
        : error.error.detail;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
      this.logout();
    } else if (error.status === 404) {
      errorMessage = 'Employee not found';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden';
    } else if (error.status === 400) {
      errorMessage = error.error?.detail || 'Bad request';
    }

    return throwError(() => new Error(errorMessage));
  }
}