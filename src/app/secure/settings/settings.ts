import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [TranslatePipe, CommonModule, FormsModule],
    templateUrl: './settings.html',
    styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
    // Notification Preferences
    payslipAlerts = true;
    leaveStatusAlerts = true;
    systemAnnouncements = false;

    // Display Settings
    darkMode = false;
    compactView = false;

    // Privacy
    showPhoneInDirectory = true;
    showEmailInDirectory = true;

    // Security Settings
    twoFactorEnabled = false;

    // Global Preferences
    selectedLanguage = 'en';


    // Password Change
    showPasswordForm = false;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordMessage = '';
    passwordError = false;

    constructor(private themeService: ThemeService, private translationService: TranslationService) { }

    ngOnInit(): void {
        this.darkMode = this.themeService.isDarkMode;
        this.selectedLanguage = this.translationService.currentLanguage;
    }

    togglePasswordForm(): void {
        this.showPasswordForm = !this.showPasswordForm;
        this.resetPasswordForm();
    }

    resetPasswordForm(): void {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordMessage = '';
        this.passwordError = false;
    }

    changePassword(): void {
        if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
            this.passwordMessage = 'All fields are required';
            this.passwordError = true;
            return;
        }

        if (this.newPassword.length < 8) {
            this.passwordMessage = 'New password must be at least 8 characters';
            this.passwordError = true;
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.passwordMessage = 'Passwords do not match';
            this.passwordError = true;
            return;
        }

        console.log('[Backend Integration Hook] Password change requested');
        this.passwordMessage = 'Password changed successfully';
        this.passwordError = false;
        this.showPasswordForm = false;
        this.resetPasswordForm();
    }

    saveNotificationPreferences(): void {
        console.log('[Backend Integration Hook] Saving notifications:', {
            payslipAlerts: this.payslipAlerts,
            leaveStatusAlerts: this.leaveStatusAlerts,
            systemAnnouncements: this.systemAnnouncements
        });
    }

    saveDisplayPreferences(): void {
        this.themeService.setDarkMode(this.darkMode);
        this.translationService.setLanguage(this.selectedLanguage);
        console.log('[Backend Integration Hook] Saving display:', {
            darkMode: this.darkMode,
            compactView: this.compactView,
            language: this.selectedLanguage
        });
    }

    savePrivacySettings(): void {
        console.log('[Backend Integration Hook] Saving privacy:', {
            showPhoneInDirectory: this.showPhoneInDirectory,
            showEmailInDirectory: this.showEmailInDirectory
        });
    }

    saveSecurityPreferences(): void {
        console.log('[Backend Integration Hook] Saving security:', {
            twoFactorEnabled: this.twoFactorEnabled
        });
    }
}
