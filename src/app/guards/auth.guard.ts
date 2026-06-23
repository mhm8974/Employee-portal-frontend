import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);


    const token = localStorage.getItem('auth_token');
    if (token) {
        // Check if the login token has expired
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
            // If the token is broken, clean up and send back to login
            console.warn('[AuthGuard] Malformed token. Clearing session.');
            localStorage.removeItem('auth_token');
            router.navigate(['/login']);
            return false;
        }
        return true;
    }

    // If there is no token, send to login page
    router.navigate(['/login']);
    return false;
};

export const otpGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);


    const token = localStorage.getItem('auth_token');
    const employeeId = localStorage.getItem('employeeId');

    // If already logged in, go straight to secure dashboard
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
            
        }
    }

    // Need employee ID from step 1 to do OTP check
    if (employeeId) {
        return true;
    }

    // No employee ID found, go back to login
    router.navigate(['/login']);
    return false;
};

