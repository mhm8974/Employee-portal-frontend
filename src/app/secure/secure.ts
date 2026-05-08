import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
import { TranslationService } from '../services/translation.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { MOCK_EMPLOYEE } from './secure.mocks';

@Component({
  selector: 'app-secure',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule, TranslatePipe],
  templateUrl: './secure.html',
  styleUrls: ['./secure.css']
})
export class SecureComponent implements OnInit {
  showLogoutConfirm = false;
  userData: any = null;
  isMobileMenuOpen = false;
  searchQuery = '';
  searchResults: SearchItem[] = [];
  isSearchOpen = false;

  // Registry of searchable portal features and routes
  private searchableItems: SearchItem[] = [
    // Home
    { label: 'Home', route: '/secure/home', icon: 'fas fa-home', keywords: ['dashboard', 'home', 'overview', 'pranali', 'ifms', 'welcome'] },
    { label: 'What is Pranali?', route: '/secure/home', fragment: 'what-is-pranali', icon: 'fas fa-info-circle', keywords: ['pranali', 'about', 'ifms', 'financial', 'management', 'system', 'sikkim'] },
    { label: 'Core Objectives', route: '/secure/home', fragment: 'core-objectives', icon: 'fas fa-bullseye', keywords: ['objectives', 'goals', 'transparency', 'accountability'] },
    { label: 'Digital Transformation', route: '/secure/home', fragment: 'vision', icon: 'fas fa-rocket', keywords: ['digital', 'transformation', 'vision'] },
    // Employee Profile
    { label: 'Employee Profile', route: '/secure/profile', icon: 'fas fa-user', keywords: ['profile', 'employee', 'personal', 'information', 'details', 'name', 'email', 'phone'] },
    { label: 'Personal Information', route: '/secure/profile', fragment: 'personal-info', icon: 'fas fa-id-card', keywords: ['personal', 'dob', 'date of birth', 'gender', 'marital', 'address'] },
    { label: 'Employment Details', route: '/secure/profile', fragment: 'employment-details', icon: 'fas fa-briefcase', keywords: ['employment', 'department', 'designation', 'joining', 'retirement', 'pay level'] },
    // Payslip
    { label: 'Payslip', route: '/secure/payslip', icon: 'fas fa-file-invoice-dollar', keywords: ['payslip', 'salary', 'pay', 'slip', 'download', 'pdf', 'earnings', 'deductions', 'income'] },
    { label: 'Download Payslip', route: '/secure/payslip', fragment: 'download-payslip', icon: 'fas fa-download', keywords: ['download', 'pdf', 'payslip', 'export', 'print'] },
    // Leaves
    { label: 'Leaves & Time Off', route: '/secure/leaves', icon: 'fas fa-calendar-alt', keywords: ['leave', 'leaves', 'time off', 'vacation', 'holiday', 'absence', 'casual', 'earned', 'sick'] },
    { label: 'Apply for Leave', route: '/secure/leaves', fragment: 'apply-leave', icon: 'fas fa-plus-circle', keywords: ['apply', 'new', 'leave', 'request', 'submit'] },
    { label: 'Leave Balance', route: '/secure/leaves', fragment: 'leave-balance', icon: 'fas fa-chart-pie', keywords: ['balance', 'remaining', 'available', 'leave', 'quota'] },
    // Settings
    { label: 'Settings', route: '/secure/settings', icon: 'fas fa-cog', keywords: ['settings', 'preferences', 'configuration', 'options'] },
    { label: 'Dark Mode', route: '/secure/settings', fragment: 'dark-mode', icon: 'fas fa-moon', keywords: ['dark', 'mode', 'theme', 'light', 'appearance', 'toggle'] },
    { label: 'Change Password', route: '/secure/settings', fragment: 'change-password', icon: 'fas fa-key', keywords: ['password', 'change', 'security', 'update', 'credentials'] },
    // Help
    { label: 'Help Center', route: '/secure/help', icon: 'fas fa-question-circle', keywords: ['help', 'support', 'faq', 'guide', 'contact', 'assistance'] },
  ];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private translationService: TranslationService,
    private router: Router,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.loadUserData();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Scroll to top on navigation without fragment
      if (!this.router.url.includes('#')) {
        window.scrollTo(0, 0);
        const shellContent = document.querySelector('.shell-content');
        if (shellContent) {
          shellContent.scrollTo(0, 0);
        }
      }
      // Close search interface on navigation
      this.clearSearch();
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

  // Filters search results based on user input
  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.searchResults = [];
      this.isSearchOpen = false;
      return;
    }
    // Filter items by matching query against translated labels
    this.searchResults = this.searchableItems.filter(item => {
      const translatedLabel = this.translationService.translate(item.label).toLowerCase();
      return translatedLabel.includes(query);
    });
    this.isSearchOpen = this.searchResults.length > 0;
  }

  // Navigates to the route associated with the selected search result
  selectResult(item: SearchItem): void {
    if (item.fragment) {
      this.router.navigate([item.route], { fragment: item.fragment });
    } else {
      this.router.navigate([item.route]);
    }
    this.clearSearch();
  }

  // Selects the first search result when Enter is pressed
  onSearch(): void {
    if (this.searchResults.length > 0) {
      this.selectResult(this.searchResults[0]);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isSearchOpen = false;
  }

  closeSearchDropdown(): void {
    // Delays dropdown closing to permit result selection
    setTimeout(() => {
      if (!this.searchQuery.trim()) {
        this.isSearchOpen = false;
      }
    }, 200);
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    
    if (this.isSearchOpen) {
      // Resets search state when opening the search bar
      this.searchQuery = '';
      this.searchResults = [];
      
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    } else {
      // Resets search state when closing the search bar via icon
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Closes search dropdown if clicked outside on mobile viewports
    if (window.innerWidth > 900) return;

    const clickedInside = this.el.nativeElement.querySelector('.search-wrapper')?.contains(event.target);
    if (!clickedInside && this.isSearchOpen) {
      this.isSearchOpen = false;
    }
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

interface SearchItem {
  label: string;
  route: string;
  fragment?: string;
  icon: string;
  keywords: string[];
}
