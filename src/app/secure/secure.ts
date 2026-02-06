import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserProfile } from '../services/auth.service';
import { catchError, of } from 'rxjs';
import { MOCK_EMPLOYEE, MOCK_PAYSLIP } from './secure.mocks';

export interface EmployeeData extends UserProfile { }

export interface PaySlipData {
  id: number;
  employee_id: string;
  year: number;
  month: string;
  pay_period: string;
  basic_salary: number;
  house_rent_allowance: number;
  travel_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  provident_fund: number;
  professional_tax: number;
  income_tax: number;
  other_deductions: number;
  gross_salary: number;
  total_deductions: number;
  net_salary: number;
  payment_date?: string;
  status: string;
}

@Component({
  selector: 'app-secure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './secure.html',
  styleUrls: ['./secure.css']
})
export class SecureComponent implements OnInit {
  years = [2024, 2025, 2026, 2023, 2022, 2021, 2020];
  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  selectedYear = 2024;
  selectedMonth = 'January';

  employeeData: EmployeeData | null = null;
  paySlipData: PaySlipData | null = null;

  isLoading = false;
  isPayslipLoading = false;
  errorMessage = '';
  showLogoutConfirm = false;
  isSidebarOpen = false;
  activeMenuItem = 'Employee Profile'; // Default active item

  /* MOCK DATA CONFIG */
  useMockData = true; // Set to true to bypass backend
  private apiUrl = 'http://192.168.0.122:8000';


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEmployeeData();
    this.loadPaySlipData();
  }

  loadEmployeeData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.useMockData) {
      setTimeout(() => { // Simulate network delay
        this.employeeData = MOCK_EMPLOYEE;
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 500);
      return;
    }

    const employeeId = localStorage.getItem('employeeId') || '20240101000001';

    if (!employeeId) {
      this.isLoading = false;
      this.errorMessage = 'Please login to view employee data';
      return;
    }

    this.http.get<any>(`${this.apiUrl}/api/employee/${employeeId}`)
      .pipe(catchError(error => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
        this.loadFromLocalStorage();
        return of(null);
      }))
      .subscribe(response => {
        if (response) {
          this.employeeData = response;
          if (this.employeeData && !this.employeeData.full_name) {
            this.employeeData.full_name = `${this.employeeData.first_name || ''} ${this.employeeData.last_name || ''}`.trim();
          }
          this.cdr.markForCheck();
        } else if (!this.errorMessage) {
          this.errorMessage = 'No employee data found';
        }
        this.isLoading = false;
      });
  }

  loadPaySlipData(): void {
    this.isPayslipLoading = true;

    if (this.useMockData) {
      setTimeout(() => { // Simulate network delay
        this.paySlipData = { ...MOCK_PAYSLIP, month: this.selectedMonth, year: this.selectedYear };
        this.isPayslipLoading = false;
        this.cdr.markForCheck();
      }, 500);
      return;
    }

    const employeeId = localStorage.getItem('employeeId') || '20240101000001';

    if (!employeeId) {
      this.isPayslipLoading = false;
      return;
    }

    const params = { employee_id: employeeId, year: this.selectedYear.toString(), month: this.selectedMonth };

    this.http.get<any>(`${this.apiUrl}/api/payslips`, { params })
      .pipe(catchError(error => {
        this.paySlipData = null;
        this.errorMessage = error.status === 404
          ? `No payslip data found for ${this.selectedMonth} ${this.selectedYear}`
          : error.status === 0 ? 'Cannot connect to server.' : 'Failed to load payslip data.';
        this.isPayslipLoading = false;
        return of(null);
      }))
      .subscribe(response => {
        if (response?.success && response.data) {
          this.paySlipData = response.data;
          this.cdr.markForCheck();
        } else {
          this.paySlipData = null;
        }
        this.isPayslipLoading = false;
      });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.detail) return Array.isArray(error.error.detail) ? error.error.detail.map((d: any) => d.msg).join(', ') : error.error.detail;
    if (error.error?.message) return error.error.message;
    if (error.status === 0) return 'Cannot connect to server.';
    if (error.status === 401) return 'Session expired. Please login again.';
    if (error.status === 404) return 'Employee data not found.';
    if (error.status === 500) return 'Server error. Please try again later.';
    return error.message || 'An error occurred';
  }

  private loadFromLocalStorage(): void {
    if (this.useMockData) return; // Skip local storage if mocking
    const userData = this.authService.getUserData();
    if (userData) {
      this.employeeData = userData as EmployeeData;
      this.cdr.markForCheck();
    }
  }

  onSelectionChange(): void {
    this.loadPaySlipData();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day} - ${month} - ${date.getFullYear()}`;
    } catch { return dateString; }
  }

  get birthDate(): string {
    if (!this.employeeData?.date_of_birth) return '';
    try {
      const date = new Date(this.employeeData.date_of_birth);
      return isNaN(date.getTime()) ? this.employeeData.date_of_birth : date.toISOString().split('T')[0];
    } catch { return this.employeeData.date_of_birth || ''; }
  }

  get employeeFullName(): string {
    if (!this.employeeData) return 'N/A';
    return this.employeeData.full_name || `${this.employeeData.first_name || ''} ${this.employeeData.last_name || ''}`.trim() || 'N/A';
  }

  get employeeId(): string { return this.employeeData?.employee_id || 'N/A'; }
  get department(): string { return this.employeeData?.department || 'N/A'; }
  get position(): string { return this.employeeData?.position || 'N/A'; }
  get payPeriod(): string { return `${this.selectedMonth} ${this.selectedYear}`; }

  get statusText(): string {
    if (!this.employeeData?.status) return 'Active';
    return this.employeeData.status.charAt(0).toUpperCase() + this.employeeData.status.slice(1);
  }

  get statusClass(): string {
    const status = (this.employeeData?.status || 'active').toLowerCase();
    return status === 'inactive' ? 'status-inactive' : status === 'on_leave' ? 'status-leave' : 'status-active';
  }

  get totalAllowances(): number {
    if (!this.paySlipData) return 0;
    return (this.paySlipData.house_rent_allowance || 0) + (this.paySlipData.travel_allowance || 0) +
      (this.paySlipData.medical_allowance || 0) + (this.paySlipData.special_allowance || 0);
  }

  get totalDeductions(): number {
    if (!this.paySlipData) return 0;
    return (this.paySlipData.provident_fund || 0) + (this.paySlipData.professional_tax || 0) +
      (this.paySlipData.income_tax || 0) + (this.paySlipData.other_deductions || 0);
  }

  downloadPayslip(): void {
    this.isPayslipLoading = true;
    const employeeId = localStorage.getItem('employeeId') || '20240101000001';

    if (!employeeId) {
      this.isPayslipLoading = false;
      alert('Please login to download payslip');
      return;
    }

    const params = { employee_id: employeeId, year: this.selectedYear.toString(), month: this.selectedMonth, format: 'pdf' };

    this.http.get<any>(`${this.apiUrl}/api/payslips/download`, { params, responseType: 'json' })
      .pipe(catchError(error => {
        this.isPayslipLoading = false;
        this.cdr.detectChanges();
        const msg = error.status === 404 || error.status === 501 ? 'PDF download not yet implemented.'
          : error.status === 0 ? 'Cannot connect to server.' : `Download failed: ${error.message || 'Try again later.'}`;
        alert(msg);
        return of(null);
      }))
      .subscribe(response => {
        if (response?.message) {
          this.isPayslipLoading = false;
          this.cdr.detectChanges();
          alert(`Backend Message: ${response.message}`);
        }
        if (response instanceof Blob) {
          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payslip_${employeeId}_${this.selectedMonth}_${this.selectedYear}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        this.isPayslipLoading = false;
        this.cdr.detectChanges();
      });
  }

  downloadPaySlip(): void {
    const employeeId = localStorage.getItem('employeeId') || '20240101000001';
    console.log(`[Backend Integration Hook] Downloading payslip for:`, {
      employeeId,
      year: this.selectedYear,
      month: this.selectedMonth
    });

    // BACKEND DEV: Replace with your final API call
    // Example: this.http.get(`${this.apiUrl}/api/payslips/download`, { params, responseType: 'blob' })...
  }

  getInitials(): string {
    if (!this.employeeFullName) return '??';
    const names = this.employeeFullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  setActiveMenuItem(item: string): void {
    this.activeMenuItem = item;
    // We keep toggleSidebar() separate to allow for mobile closing
  }

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate(['/profile']);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
  }

  hasEmployeeData(): boolean { return !!this.employeeData; }
  hasPaySlipData(): boolean { return !!this.paySlipData; }
  getFirstName(): string { return this.employeeData?.first_name || 'N/A'; }
  getLastName(): string { return this.employeeData?.last_name || 'N/A'; }
  getFormattedDOB(): string { return this.formatDate(this.employeeData?.date_of_birth); }
  getEmail(): string { return this.employeeData?.email || 'N/A'; }
  getPhone(): string { return this.employeeData?.mobile || 'N/A'; }
  getJoiningDate(): string { return this.formatDate(this.employeeData?.join_date); }
}
