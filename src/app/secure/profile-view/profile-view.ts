import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserProfile } from '../../services/auth.service';
import { catchError, of } from 'rxjs';
import { MOCK_EMPLOYEE, MOCK_PAYSLIP, MOCK_PAYSLIP_MARCH_2024 } from '../secure.mocks';
import html2pdf from 'html2pdf.js';

export interface EmployeeData extends UserProfile {
    section?: string;
    designation?: string;
    appointment_date?: string;
    retirement_date?: string;
    cpf_no?: string;
}

export interface PaySlipData {
    id?: number;
    employee_id: string;
    year: number;
    month: string;
    pay_period?: string;
    // Earnings
    basic_salary: number;
    da?: number;
    hraws?: number;
    npa?: number;
    sbca?: number;
    ta?: number;
    // Deductions
    cpf_state?: number;
    gis_state?: number;
    professional_tax: number;
    stamp_duty?: number;
    // Totals
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    payment_date?: string;
    status?: string;
}

@Component({
    selector: 'app-profile-view',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-view.html',
    styleUrls: ['./profile-view.css']
})
export class ProfileViewComponent implements OnInit {
    years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    selectedYear = 2026;
    selectedMonth = 'January';

    employeeData: EmployeeData | null = null;
    paySlipData: PaySlipData | null = null;

    isLoading = false;
    isPayslipLoading = false;
    errorMessage = '';

    /* MOCK DATA CONFIG moved to AuthService */
    get useMockData(): boolean {
        return this.authService.useMockData;
    }

    private apiUrl = 'http://192.168.0.137:8000';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadEmployeeData();
        this.loadPaySlipData();
    }
    async openPrintDialog() {
        // Look for the ID directly in the document
        const element = document.getElementById('payslip');

        if (!element) {
            console.error("Could not find element with id 'payslip'. Is it hidden by an *ngIf?");
            return;
        }

        const options = {
            margin: 10,
            filename: 'payslip.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        } as const;

        const worker = html2pdf().from(element).set(options);
        const pdfOutput = await worker.outputPdf('bloburl');

        // Create a hidden iframe to trigger the print
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfOutput;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            iframe.contentWindow?.print();
        };
    }
    loadEmployeeData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        if (this.useMockData) {
            setTimeout(() => {
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
            setTimeout(() => {
                // User requirement: Support January 2026 and March 2024
                const isJan2026 = this.selectedMonth === 'January' && Number(this.selectedYear) === 2026;
                const isMar2024 = this.selectedMonth === 'March' && Number(this.selectedYear) === 2024;

                if (isJan2026) {
                    this.paySlipData = { ...MOCK_PAYSLIP };
                    console.log(`[Mock] Loaded data for January 2026`);
                } else if (isMar2024) {
                    this.paySlipData = { ...MOCK_PAYSLIP_MARCH_2024 };
                    console.log(`[Mock] Loaded data for March 2024`);
                } else {
                    this.paySlipData = null;
                    console.log(`[Mock] No data for ${this.selectedMonth} ${this.selectedYear}`);
                }

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
        if (this.useMockData) return;
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
        return (this.paySlipData.da || 0) + (this.paySlipData.hraws || 0) +
            (this.paySlipData.npa || 0) + (this.paySlipData.sbca || 0) + (this.paySlipData.ta || 0);
    }

    get totalDeductions(): number {
        if (!this.paySlipData) return 0;
        return (this.paySlipData.cpf_state || 0) + (this.paySlipData.gis_state || 0) +
            (this.paySlipData.professional_tax || 0) + (this.paySlipData.stamp_duty || 0);
    }

    downloadPayslip(): void {
        const employeeId = localStorage.getItem('employeeId') || 'CPF12345';

        if (!employeeId) {
            alert('Please login to download payslip');
            return;
        }

        const downloadUrl = `${this.apiUrl}/api/payslips/download?employee_id=${employeeId}&month=${this.selectedMonth}&year=${this.selectedYear}&format=pdf`;
        window.open(downloadUrl, '_blank');
    }

    downloadPaySlip(): void {
        const employeeId = localStorage.getItem('employeeId') || '20240101000001';
        console.log(`[Backend Integration Hook] Downloading payslip for:`, {
            employeeId,
            year: this.selectedYear,
            month: this.selectedMonth
        });
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

    getVerifierQrUrl(): string {
        if (!this.paySlipData) return '';

        const employeeId = this.paySlipData.employee_id;
        const verifierUrl = `${this.apiUrl}/api/payslips/download?employee_id=${employeeId}&month=${this.selectedMonth}&year=${this.selectedYear}&format=pdf`;

        // Using api.qrserver.com for a high-quality digital QR code
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(verifierUrl)}`;
    }
}
