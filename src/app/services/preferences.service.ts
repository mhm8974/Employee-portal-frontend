import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserPreferences {
  isCompactView: boolean;
  notifPayslip: boolean;
  notifLeave: boolean;
  notifSystem: boolean;
  privacyShowPhone: boolean;
  privacyShowEmail: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private defaultPreferences: UserPreferences = {
    isCompactView: false,
    notifPayslip: true,
    notifLeave: true,
    notifSystem: true,
    privacyShowPhone: true,
    privacyShowEmail: true
  };

  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.loadPreferences());
  preferences$ = this.preferencesSubject.asObservable();

  constructor() {
    this.applyCompactView(this.preferencesSubject.value.isCompactView);
  }

  private loadPreferences(): UserPreferences {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      try {
        return { ...this.defaultPreferences, ...JSON.parse(saved) };
      } catch (e) {
        return this.defaultPreferences;
      }
    }
    return this.defaultPreferences;
  }

  updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    const current = this.preferencesSubject.value;
    const updated = { ...current, [key]: value };
    this.preferencesSubject.next(updated);
    localStorage.setItem('user_preferences', JSON.stringify(updated));

    if (key === 'isCompactView') {
      this.applyCompactView(value as boolean);
    }

    // Backend Sync Hook
    this.syncWithBackend(updated);
  }

  private applyCompactView(isCompact: boolean): void {
    if (isCompact) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }

  private syncWithBackend(prefs: UserPreferences): void {
    console.log('[PreferencesService] Syncing with backend:', prefs);
    // TODO: Implement HTTP PUT /api/user/preferences
  }

  get currentPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }
}
