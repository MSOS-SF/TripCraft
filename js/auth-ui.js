import { auth, loginWithGoogle, logout } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * TripCraft Auth UI Handler
 */

export function initAuthUI() {
    const authContainer = document.querySelector('#auth-container');
    if (!authContainer) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            authContainer.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="hidden md:block text-right">
                        <p class="text-xs text-text-dim">Welcome back,</p>
                        <p class="text-sm font-bold">${user.displayName}</p>
                    </div>
                    <img src="${user.photoURL}" alt="${user.displayName}" class="w-10 h-10 rounded-full border border-accent">
                    <button id="logout-btn" class="btn btn-secondary btn-sm">
                        <i data-lucide="log-out"></i>
                    </button>
                </div>
            `;
            
            document.querySelector('#logout-btn')?.addEventListener('click', () => {
                logout();
            });
        } else {
            // User is signed out
            authContainer.innerHTML = `
                <button id="login-btn" class="btn btn-primary btn-sm">
                    <i data-lucide="log-in"></i> Sign In
                </button>
            `;
            
            document.querySelector('#login-btn')?.addEventListener('click', () => {
                loginWithGoogle();
            });
        }
        
        // Re-initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
}
