import { Storage } from './storage.js';
import { initAuthUI } from './auth-ui.js';

/**
 * TripCraft Global Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initToasts();
    initAuthUI();
});

function initTheme() {
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    
    const toggle = document.querySelector('#theme-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            Storage.setTheme(next);
        });
    }
}

function initNavbar() {
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

function initToasts() {
    window.showToast = (message, type = 'info') => {
        const container = document.querySelector('#toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} reveal`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('active');
            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 10);
    };
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}
