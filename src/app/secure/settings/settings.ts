import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';
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



    // Global Preferences
    selectedLanguage = 'en';

    constructor(
        private themeService: ThemeService,
        private translationService: TranslationService,
        private preferencesService: PreferencesService
    ) { }

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        const prefs = this.preferencesService.currentPreferences;
        this.payslipAlerts = prefs.notifPayslip;
        this.leaveStatusAlerts = prefs.notifLeave;
        this.systemAnnouncements = prefs.notifSystem;
        this.compactView = prefs.isCompactView;
        this.showPhoneInDirectory = prefs.privacyShowPhone;
        this.showEmailInDirectory = prefs.privacyShowEmail;

        this.darkMode = this.themeService.isDarkMode;
        this.selectedLanguage = this.translationService.currentLanguage;
    }



    saveNotificationPreferences(): void {
        this.preferencesService.updatePreference('notifPayslip', this.payslipAlerts);
        this.preferencesService.updatePreference('notifLeave', this.leaveStatusAlerts);
        this.preferencesService.updatePreference('notifSystem', this.systemAnnouncements);
    }

    saveDisplayPreferences(): void {
        this.themeService.setDarkMode(this.darkMode);
        this.translationService.setLanguage(this.selectedLanguage);
        this.preferencesService.updatePreference('isCompactView', this.compactView);
    }

    savePrivacySettings(): void {
        this.preferencesService.updatePreference('privacyShowPhone', this.showPhoneInDirectory);
        this.preferencesService.updatePreference('privacyShowEmail', this.showEmailInDirectory);
    }


}
