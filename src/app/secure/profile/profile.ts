// Code editor view loaded
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
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

  // For visual styling only
  get useMockData(): boolean {
    return this.authService.useMockData;
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    this.errorMessage = '';

    const employeeId = localStorage.getItem('employeeId');

    if (!employeeId) {
      this.errorMessage = 'Please login to view profile';
      return;
    }

    // If mock data is ENABLED, use it immediately with zero delay
    if (this.useMockData) {
      this.mapBackendToUi(MOCK_EMPLOYEE);
      return;
    }

    console.log('[Profile] INITIATING LIVE FETCH: Requesting real data from backend...');
    const apiUrl = `http://192.168.0.115:8000/api/employee/${employeeId}`;

    this.http.get<any>(apiUrl).pipe(
      catchError(error => {
        console.error('[Profile] CONNECTION SEVERED: Backend offline or unreachable. Swapping in Mock data...', error);
        this.errorMessage = 'Backend offline. Using cached mock data.';
        this.mapBackendToUi(MOCK_EMPLOYEE);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log('[Profile] LIVE DATA RECEIVED: Successfully synchronized with backend database.', response);
        this.mapBackendToUi(response);
      }
    });
  }

  private mapBackendToUi(data: any): void {
    // Merge names if needed
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
