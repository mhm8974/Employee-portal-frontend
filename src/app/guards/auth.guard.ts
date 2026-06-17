import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.useMockData) {
        if (!localStorage.getItem('employeeId')) {
            localStorage.setItem('employeeId', 'MOCK12345');
        }
        if (!localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', 'mock_token_12345');
        }
        return true;
    }

    const token = localStorage.getItem('auth_token');

    if (token) {
        if (token.startsWith('mock')) {
            return true;
        }
        // Check JWT expiry
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp) {
                const expiryMs = payload.exp * 1000;
                if (Date.now() >= expiryMs) {
                    console.warn('[AuthGuard] JWT token expired. Clearing session.');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('employeeId');
                    localStorage.removeItem('user_data');
                    router.navigate(['/login']);
                    return false;
                }
            }
        } catch {
            // Token is malformed — clear and redirect
            console.warn('[AuthGuard] Malformed token. Clearing session.');
            localStorage.removeItem('auth_token');
            router.navigate(['/login']);
            return false;
        }
        return true;
    }

    // No token — redirect to login
    router.navigate(['/login']);
    return false;
};

export const otpGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.useMockData) {
        if (!localStorage.getItem('employeeId')) {
            localStorage.setItem('employeeId', 'MOCK12345');
        }
        if (!localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', 'mock_token_12345');
        }
        return true;
    }

    const token = localStorage.getItem('auth_token');
    const employeeId = localStorage.getItem('employeeId');

    // If already fully logged in with a valid token, redirect to secure area
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp) {
                const expiryMs = payload.exp * 1000;
                if (Date.now() < expiryMs) {
                    router.navigate(['/secure']);
                    return false;
                }
            }
        } catch {
            // Malformed or expired - proceed to check employeeId
        }
    }

    // Must have employeeId from step 1 login to access OTP screen
    if (employeeId) {
        return true;
    }

    // No employeeId — redirect to login
    router.navigate(['/login']);
    return false;
};

