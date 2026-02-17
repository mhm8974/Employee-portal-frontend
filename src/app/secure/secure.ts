import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MOCK_EMPLOYEE } from './secure.mocks';

@Component({
  selector: 'app-secure',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './secure.html',
  styleUrls: ['./secure.css']
})
export class SecureComponent implements OnInit {
  showLogoutConfirm = false;
  isSidebarOpen = false;
  userData: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // Retrieve user data from service/local storage
    const storedData = this.authService.getUserData();
    if (storedData) {
      this.userData = storedData;
    } else {
      // Fallback to mock data for demonstration if no data found
      this.userData = MOCK_EMPLOYEE;
    }
  }

  get employeeFullName(): string {
    if (!this.userData) return 'Employee';
    return this.userData.full_name || `${this.userData.first_name || ''} ${this.userData.last_name || ''}`.trim() || 'Employee';
  }

  get employeeId(): string {
    return this.userData?.employee_id || localStorage.getItem('employeeId') || 'N/A';
  }

  getInitials(): string {
    // Extract first name and last name initials as requested
    if (this.userData?.first_name && this.userData?.last_name) {
      return (this.userData.first_name[0] + this.userData.last_name[0]).toUpperCase();
    }

    // Fallback logic using full name if split fields aren't available
    const name = this.employeeFullName;
    if (!name || name === 'Employee') return '??';
    const names = name.split(' ').filter(n => n.trim().length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
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
}
