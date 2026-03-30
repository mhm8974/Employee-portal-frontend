import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
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
  userData: any = null;
  isMobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.loadUserData();

    // Reset scroll position on every navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);

      // Also ensure shell-content itself is reset if it has internal scroll
      const shellContent = document.querySelector('.shell-content');
      if (shellContent) {
        shellContent.scrollTo(0, 0);
      }
    });
  }

  loadUserData(): void {
    const storedData = this.authService.getUserData();
    if (storedData) {
      this.userData = storedData;
    } else {
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
    if (this.userData?.first_name && this.userData?.last_name) {
      return (this.userData.first_name[0] + this.userData.last_name[0]).toUpperCase();
    }

    const name = this.employeeFullName;
    if (!name || name === 'Employee') return '??';
    const names = name.split(' ').filter(n => n.trim().length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.showLogoutConfirm = true;
    this.closeMobileMenu();
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }
}
