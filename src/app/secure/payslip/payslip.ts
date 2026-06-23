import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService, UserProfile } from '../../services/auth.service';
import { catchError, of } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import { environment } from '../../../environments/environment';


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
    
    basic_salary: number;
    da?: number;
    hraws?: number;
    npa?: number;
    sbca?: number;
    ta?: number;
    
    cpf_state?: number;
    gis_state?: number;
    professional_tax?: number;
    stamp_duty?: number;
    
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    payment_date?: string;
    status?: string;

    
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

    

    private apiUrl = environment.apiUrl;;

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
        
        if (!this.showDropdown) return;

        const target = event.target as HTMLElement;
        const isClickInside = target.closest('.download-container');

        if (!isClickInside) {
            this.showDropdown = false;
        }
    }

    private triggerPrint(url: string) {
        // Print using a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                // Clean up memory
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                    if (url.startsWith('blob:')) {
                        window.URL.revokeObjectURL(url);
                    }
                }, 5000);
            } catch (err) {
                console.error('[Print Handler] Error triggering print:', err);
                // If iframe print fails, open PDF in a new tab
                window.open(url, '_blank');
            }
        };
    }

    




    async handleAction(action: string) {
        this.showActionSheet = false;
        this.showDropdown = false;

        if (action === 'download') {
            this.downloadPayslip('download');
        } else if (action === 'print') {
            this.downloadPayslip('print');
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


        const employeeId = localStorage.getItem('employeeId') || '20240101000001';

        if (!employeeId) {
            this.isPayslipLoading = false;
            return;
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNum = monthNames.indexOf(this.selectedMonth) + 1;
        const params = { employee_id: employeeId, year: this.selectedYear.toString(), month: monthNum.toString() };

        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

        this.http.get<any>(`${this.apiUrl}/payslips`, { params, headers })
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

                    
                    const employeeId = localStorage.getItem('employeeId') || '20240101000001';
                    this.http.post(`${this.apiUrl}/payslips/generate-verification-token`, null, {
                        params: {
                            employee_id: employeeId,
                            month: monthNum.toString(),
                            year: this.selectedYear.toString()
                        },
                        headers
                    }).subscribe((res: any) => {
                        if (res.token || res.verification_url) {
                            const hostUrl = window.location.protocol + '//' + window.location.hostname;
                            this.qrCodeUrl = `${hostUrl}:8000${res.verification_url}`;
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
    get section(): string { return this.employeeData?.department || this.employeeData?.section || 'N/A'; }
    get designation(): string { return this.employeeData?.position || this.employeeData?.designation || 'N/A'; }
    get cpfNo(): string { return this.employeeData?.cpf_no || this.employeeData?.employee_id || 'N/A'; }
    get payPeriod(): string { return `${this.selectedMonth} ${this.selectedYear}`; }

    get fundType(): string {
        let type = '';
        if (this.paySlipData && this.paySlipData.deductions) {
            const keys = Object.keys(this.paySlipData.deductions);
            const subKey = keys.find(k => k.toLowerCase().includes('subscription') || 
                                          k.toUpperCase().includes('GPF') || 
                                          k.toUpperCase().includes('CPF') || 
                                          k.toLowerCase().includes('godsped'));
            if (subKey) {
                const extracted = subKey.replace(/subscription/i, '').trim();
                if (extracted) {
                    const upper = extracted.toUpperCase();
                    if (upper === 'GPF') type = 'GPF';
                    else if (upper === 'CPF') type = 'CPF';
                    else if (extracted.toLowerCase() === 'godsped') type = 'Godsped';
                    else type = extracted;
                }
            }
        }
        if (type && (type === 'GPF' || type === 'CPF' || type === 'Godsped')) {
            localStorage.setItem('detected_fund_type', type);
            return type;
        }
        const stored = localStorage.getItem('detected_fund_type') || localStorage.getItem('employee_type');
        if (stored) {
            const upper = stored.toUpperCase();
            if (upper === 'GPF') return 'GPF';
            if (upper === 'CPF') return 'CPF';
            if (stored.toLowerCase() === 'godsped') return 'Godsped';
            return stored;
        }
        return 'Employee';
    }

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

    downloadPayslip(action: 'download' | 'print' = 'download'): void {
        const employeeId = localStorage.getItem('employeeId') || 'CPF12345';

        if (!employeeId) {
            alert('Please login to process payslip');
            return;
        }

        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNum = monthNames.indexOf(this.selectedMonth) + 1;

        const downloadUrl = `${this.apiUrl}/payslips/download?employee_id=${employeeId}&month=${monthNum}&year=${this.selectedYear}&format=pdf`;
        
        this.http.get(downloadUrl, { headers, responseType: 'blob' }).subscribe(
            (blob) => {
                const url = window.URL.createObjectURL(blob);
                if (action === 'download') {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Payslip_${this.selectedMonth}_${this.selectedYear}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                } else if (action === 'print') {
                    this.triggerPrint(url);
                }
            },
            (error) => {
                console.error('Payslip processing failed', error);
                alert('Failed to process payslip. Please try again.');
            }
        );
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

    // QR data is now fetched directly from the backend
    getVerifierQrUrl(): string {
        return this.qrCodeUrl;
    }
}