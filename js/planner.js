import { Storage } from './storage.js';
import { CITIES } from './cities.js';

/**
 * TripCraft Planner Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#planner-form');
    if (!form) return;

    populateCityList();
    initFormListeners(form);
    initLivePreview(form);

    // Handle query params
    const urlParams = new URLSearchParams(window.location.search);
    const destParam = urlParams.get('dest');
    if (destParam) {
        const destInput = form.querySelector('#destination');
        if (destInput) {
            destInput.value = destParam;
            // Trigger preview update
            destInput.dispatchEvent(new Event('input'));
        }
    }
});

function populateCityList() {
    const datalist = document.querySelector('#city-list');
    if (!datalist) return;

    datalist.innerHTML = CITIES.map(city => `
        <option value="${city.name}">${city.country}</option>
    `).join('');
}

function initFormListeners(form) {
    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const destination = formData.get('destination');

        if (!destination || destination.trim().length < 2) {
            const destInput = form.querySelector('#destination');
            destInput.classList.add('error-shake');
            setTimeout(() => destInput.classList.remove('error-shake'), 500);
            return;
        }

        // Visual feedback
        if (window.airplaneSystem) {
            window.airplaneSystem.accelerate();
        }

        const tripData = {
            destination: destination,
            days: formData.get('days-count'),
            budget: formData.get('budget'),
            group: formData.get('group'),
            travelers: formData.get('travelers-count'),
            style: formData.get('style'),
            interests: Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(i => i.value),
            adultOnly: form.querySelector('#adult-only-toggle')?.checked || false
        };

        Storage.clearCurrentTrip();
        Storage.setCurrentTrip(tripData);
        window.location.href = 'results.html';
    });
}

function initLivePreview(form) {
    const preview = document.querySelector('#live-preview-card');
    if (!preview) return;

    const updatePreview = () => {
        const dest = form.querySelector('#destination').value || 'Your Destination';
        const days = form.querySelector('#days-count').value || '3';
        const budget = form.querySelector('#budget').value;
        const style = form.querySelector('input[name="style"]:checked')?.value || 'balanced';
        const group = form.querySelector('#group').value;
        const travelers = form.querySelector('#travelers-count').value || '1';
        
        preview.querySelector('.preview-dest').textContent = dest;
        preview.querySelector('.preview-days').textContent = `${days} Days`;
        preview.querySelector('.preview-budget').textContent = budget.charAt(0).toUpperCase() + budget.slice(1);
        preview.querySelector('.preview-style').textContent = style.charAt(0).toUpperCase() + style.slice(1);
        preview.querySelector('.preview-group').textContent = `${group.charAt(0).toUpperCase() + group.slice(1)} (${travelers})`;
        
        const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map(i => i.value);
        const interestContainer = preview.querySelector('.preview-interests');
        interestContainer.innerHTML = interests.map(i => `<span class="badge">${i}</span>`).join('') || '<span class="text-muted">No interests selected</span>';
    };

    form.addEventListener('input', updatePreview);
    updatePreview();
}
