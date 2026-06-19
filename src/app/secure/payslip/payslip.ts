import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserProfile } from '../../services/auth.service';
import { catchError, of } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { MOCK_EMPLOYEE, MOCK_PAYSLIP, MOCK_PAYSLIP_MARCH_2024 } from '../secure.mocks';
// Removed html2pdf usage as we are moving to backend-driven PDF generation.

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
    professional_tax?: number;
    stamp_duty?: number;
    // Totals
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    payment_date?: string;
    status?: string;

    // Dynamic fields
    earnings?: { [key: string]: number };
    deductions?: { [key: string]: number };
}

@Component({
    selector: 'app-payslip',
    standalone: true,
    imports: [CommonModule, FormsModule, QRCodeComponent],
    templateUrl: './payslip.html',
    styleUrls: ['./payslip.css']
})
export class PayslipComponent implements OnInit {
    years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    selectedYear = 2026;
    selectedMonth = 'January';

    employeeData: EmployeeData | null = null;
    paySlipData: PaySlipData | null = null;
    qrCodeUrl: string = '';

    isLoading = false;
    isPayslipLoading = false;
    errorMessage = '';
    showActionSheet = false;
    showDropdown = false;

    /* MOCK DATA CONFIG moved to AuthService */
    get useMockData(): boolean {
        return this.authService.useMockData;
    }

    private apiUrl = 'http://192.168.0.133:8000/api';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private location: Location
    ) { }

    ngOnInit(): void {
        this.loadEmployeeData();
        this.loadPaySlipData();
    }
    isMobileScreen(): boolean {
        return window.innerWidth < 900;
    }

    async openPrintDialog() {
        if (this.isMobileScreen()) {
            this.showActionSheet = true;
        } else {
            this.showDropdown = !this.showDropdown;
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        // Automatically close the desktop dropdown when clicking away
        if (!this.showDropdown) return;

        const target = event.target as HTMLElement;
        const isClickInside = target.closest('.download-container');

        if (!isClickInside) {
            this.showDropdown = false;
        }
    }

    private triggerPrint(url: string) {
        // Professional hidden iframe print logic
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                // Cleanup
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 5000);
            } catch (err) {
                console.error('[Print Handler] Error triggering print:', err);
                // Fallback: Just open in new tab if iframe printing is blocked
                window.open(url, '_blank');
            }
        };
    }

    /* Redundant clientside PDF methods removed as we are now using the official backend PDF endpoint */




    async handleAction(action: string) {
        this.showActionSheet = false;
        this.showDropdown = false;

        const employeeId = this.employeeId === 'N/A' || !this.employeeId
            ? (localStorage.getItem('employeeId') || 'CPF12345')
            : this.employeeId;

        if (!employeeId) {
            alert('Please login');
            return;
        }

        const downloadUrl = `${this.apiUrl}/payslips/download?employee_id=${employeeId}&month=${this.selectedMonth}&year=${this.selectedYear}&format=pdf`;

        if (action === 'download') {
            window.open(downloadUrl, '_blank');
        } else if (action === 'print') {
            this.triggerPrint(downloadUrl);
        }
    }

    closeActionSheet(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.showActionSheet = false;
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

        this.http.get<any>(`${this.apiUrl}/employee/${employeeId}`)
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

                // Populate mock earnings and deductions for compatibility
                if (this.paySlipData) {
                    this.paySlipData.earnings = {
                        'DA': this.paySlipData.da || 0,
                        'HRAWS': this.paySlipData.hraws || 0,
                        'NPA': this.paySlipData.npa || 0,
                        'SBCA': this.paySlipData.sbca || 0,
                        'TA': this.paySlipData.ta || 0
                    };
                    this.paySlipData.deductions = {
                        'CPF State': this.paySlipData.cpf_state || 0,
                        'GIS State': this.paySlipData.gis_state || 0,
                        'Professional Tax': this.paySlipData.professional_tax || 0,
                        'Stamp Duty': this.paySlipData.stamp_duty || 0
                    };
                }

                // For mock data, we can generate a dummy verification URL
                if (this.paySlipData) {
                    this.qrCodeUrl = `https://verification.pranali.com/verify?token=MOCK_${this.selectedMonth}_${this.selectedYear}`;
                }

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

        this.http.get<any>(`${this.apiUrl}/payslips`, { params })
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

                    // Step 1: Generate validation token using POST endpoint
                    const employeeId = localStorage.getItem('employeeId') || '20240101000001';
                    this.http.post(`${this.apiUrl}/payslips/generate-verification-token`, null, {
                        params: {
                            employee_id: employeeId,
                            month: this.selectedMonth,
                            year: this.selectedYear.toString()
                        }
                    }).subscribe((res: any) => {
                        if (res.token || res.verification_url) {
                            const baseHost = this.apiUrl.split(':8000')[0] + ':8000';
                            this.qrCodeUrl = `${baseHost}${res.verification_url}`;
                            console.log('[QR Generator] Verification URL Set:', this.qrCodeUrl);
                        }
                        this.cdr.detectChanges();
                    }, err => {
                        console.error('[QR Generator] Failed to generate token:', err);
                        this.qrCodeUrl = `${this.apiUrl}/payslips/verify?employee_id=${employeeId}&month=${this.selectedMonth}`;
                        this.cdr.detectChanges();
                    });
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
        if (this.paySlipData.earnings) {
            const earnings = this.paySlipData.earnings;
            return Object.keys(earnings).reduce((sum, key) => sum + (earnings[key] || 0), 0);
        }
        return (this.paySlipData.da || 0) + (this.paySlipData.hraws || 0) +
            (this.paySlipData.npa || 0) + (this.paySlipData.sbca || 0) + (this.paySlipData.ta || 0);
    }

    get totalDeductions(): number {
        if (!this.paySlipData) return 0;
        if (this.paySlipData.deductions) {
            const deductions = this.paySlipData.deductions;
            return Object.keys(deductions).reduce((sum, key) => sum + (deductions[key] || 0), 0);
        }
        return (this.paySlipData.cpf_state || 0) + (this.paySlipData.gis_state || 0) +
            (this.paySlipData.professional_tax || 0) + (this.paySlipData.stamp_duty || 0);
    }

    downloadPayslip(): void {
        const employeeId = localStorage.getItem('employeeId') || 'CPF12345';

        if (!employeeId) {
            alert('Please login to download payslip');
            return;
        }

        const downloadUrl = `${this.apiUrl}/payslips/download?employee_id=${employeeId}&month=${this.selectedMonth}&year=${this.selectedYear}&format=pdf`;
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

    // Not used anymore as the QR data is fetched from the token endpoint
    getVerifierQrUrl(): string {
        return this.qrCodeUrl;
    }
}