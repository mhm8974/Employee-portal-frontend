import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface EmployeeProfile {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  department: string;
  position: string;
  birth_date: string;
  email?: string;
  mobile?: string;
  status: string;
  hire_date?: string;
}

export interface PaySlip {
  id: number;
  employee_id: string;
  year: number;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
  generated_date: string;
}

export interface PaySlipRequest {
  year: number;
  month: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getEmployeeProfile(employeeId: string): Observable<EmployeeProfile> {
    const headers = this.getAuthHeaders();

    return this.http.get<EmployeeProfile>(
      `${this.apiUrl}/employees/${employeeId}/profile`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getMyProfile(): Observable<EmployeeProfile> {
    const headers = this.getAuthHeaders();

    return this.http.get<EmployeeProfile>(
      `${this.apiUrl}/employees/me/profile`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getPaySlip(year: number, month: string): Observable<PaySlip> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month);

    return this.http.get<PaySlip>(
      `${this.apiUrl}/payslip`,
      { headers, params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  downloadPaySlip(year: number, month: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month);

    return this.http.get(
      `${this.apiUrl}/payslip/download`,
      {
        headers,
        params,
        responseType: 'blob'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAvailableYears(): Observable<number[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<number[]>(
      `${this.apiUrl}/payslip/years`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getAvailableMonths(year: number): Observable<string[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<string[]>(
      `${this.apiUrl}/payslip/months`,
      { headers, params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: any) {
    console.error('API Error:', error);

    let errorMessage = 'An error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('employee_id');
      window.location.href = '/';
    } else if (error.status === 404) {
      errorMessage = 'Data not found';
    }

    return throwError(() => new Error(errorMessage));
  }
}