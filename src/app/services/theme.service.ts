import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private _isDarkMode = false;

    get isDarkMode(): boolean {
        return this._isDarkMode;
    }

    constructor() {
        this.loadTheme();
    }

    loadTheme(): void {
        const saved = localStorage.getItem('darkMode');
        if (saved === 'true') {
            this._isDarkMode = true;
            document.body.classList.add('dark-theme');
        }
    }

    toggleDarkMode(): void {
        this._isDarkMode = !this._isDarkMode;
        if (this._isDarkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('darkMode', String(this._isDarkMode));
    }

    setDarkMode(value: boolean): void {
        this._isDarkMode = value;
        if (value) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('darkMode', String(value));
    }
}
