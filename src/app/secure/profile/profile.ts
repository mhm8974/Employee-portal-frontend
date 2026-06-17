import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, UserProfile } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MOCK_EMPLOYEE } from '../secure.mocks';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  employeeData: any = {
    name: '',
    section: '',
    dob: '',
    designation: '',
    appointmentDate: '',
    retirementDate: '',
    cpfNo: '',
    gender: '',
    phone: '',
    email: '',
    location: ''
  };

  errorMessage = '';

  get useMockData(): boolean {
    return this.authService.useMockData;
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Instantly load from local storage to avoid a blank screen
    this.loadFromLocalStorage();
    // 2. Fetch fresh data from backend
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    this.errorMessage = '';

    const employeeId = localStorage.getItem('employeeId');

    if (!employeeId) {
      this.errorMessage = 'Please login to view profile';
      this.cdr.detectChanges();
      return;
    }

    if (this.useMockData) {
      this.mapBackendToUi(MOCK_EMPLOYEE);
      this.cdr.detectChanges();
      return;
    }

    console.log('[Profile] INITIATING LIVE FETCH: Requesting real data from backend...');
    const apiUrl = `${environment.apiUrl}/employee/${employeeId}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.get<any>(apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('[Profile] CONNECTION SEVERED: Backend offline or unreachable.', error);
        // If we don't have any cached data loaded, use mock data as a last resort
        if (!this.employeeData.name) {
          this.errorMessage = 'Backend offline. Using cached mock data.';
          this.mapBackendToUi(MOCK_EMPLOYEE);
        } else {
          this.errorMessage = 'Backend offline. Showing cached profile.';
        }
        this.cdr.detectChanges();
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log('[Profile] LIVE DATA RECEIVED: Successfully synchronized with backend database.', response);
        this.mapBackendToUi(response);
        localStorage.setItem('user_data', JSON.stringify(response));
        this.cdr.detectChanges();
      }
    });
  }

  private mapBackendToUi(data: any): void {
    const fullName = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();

    this.employeeData = {
      name: fullName,
      section: data.department || data.section || 'N/A',
      dob: data.date_of_birth || 'N/A',
      designation: data.position || data.designation || 'N/A',
      appointmentDate: data.appointment_date || data.hire_date || 'N/A',
      retirementDate: data.retirement_date || 'N/A',
      cpfNo: data.cpf_no || data.employee_id || 'N/A',
      gender: data.gender || 'N/A',
      phone: data.mobile || 'N/A',
      email: data.email || 'N/A',
      location: data.address || data.location || 'N/A'
    };
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('user_data');
    if (stored) {
      this.mapBackendToUi(JSON.parse(stored));
      this.cdr.detectChanges();
    }
  }

  getInitials(): string {
    if (!this.employeeData.name) return 'BB';
    const parts = this.employeeData.name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}
