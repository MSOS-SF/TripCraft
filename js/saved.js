import { auth, getSavedTrips, deleteTrip, loginWithGoogle } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { Storage } from './storage.js';

/**
 * TripCraft Saved Trips Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#saved-trips-grid');
    const loginPrompt = document.querySelector('#login-prompt');
    const emptyState = document.querySelector('#empty-state');
    const loginBtnPrompt = document.querySelector('#login-btn-prompt');

    loginBtnPrompt?.addEventListener('click', () => {
        loginWithGoogle();
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginPrompt?.classList.add('hidden');
            grid?.classList.remove('hidden');
            
            // Listen for saved trips
            getSavedTrips((trips) => {
                if (trips.length === 0) {
                    grid?.classList.add('hidden');
                    emptyState?.classList.remove('hidden');
                } else {
                    emptyState?.classList.add('hidden');
                    grid?.classList.remove('hidden');
                    renderTrips(trips);
                }
            });
        } else {
            grid?.classList.add('hidden');
            emptyState?.classList.add('hidden');
            loginPrompt?.classList.remove('hidden');
        }
    });

    function renderTrips(trips) {
        if (!grid) return;
        
        grid.innerHTML = trips.map(trip => `
            <div class="dest-card glass reveal active">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold">${trip.destination}</h3>
                        <span class="badge">${trip.days} Days</span>
                    </div>
                    <p class="text-sm text-text-dim mb-6">${trip.itinerary.tagline}</p>
                    <div class="flex flex-wrap gap-2 mb-8">
                        <span class="badge">${trip.budget}</span>
                        <span class="badge">${trip.style}</span>
                        <span class="badge">${trip.group}</span>
                    </div>
                    <div class="flex gap-4">
                        <button class="btn btn-primary btn-sm flex-1 view-trip" data-id="${trip.id}">
                            <i data-lucide="eye"></i> View
                        </button>
                        <button class="btn btn-secondary btn-sm delete-trip" data-id="${trip.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
        
        // Add listeners
        grid.querySelectorAll('.view-trip').forEach(btn => {
            btn.addEventListener('click', () => {
                const trip = trips.find(t => t.id === btn.dataset.id);
                if (trip) {
                    Storage.setCurrentTrip({
                        destination: trip.destination,
                        startDate: trip.startDate,
                        days: trip.days,
                        budget: trip.budget,
                        group: trip.group,
                        travelers: trip.travelers,
                        style: trip.style,
                        interests: trip.interests
                    });
                    Storage.setItinerary(trip.itinerary);
                    window.location.href = 'results.html';
                }
            });
        });
        
        grid.querySelectorAll('.delete-trip').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm("Are you sure you want to delete this trip?")) {
                    await deleteTrip(btn.dataset.id);
                    window.showToast("Trip deleted.", "info");
                }
            });
        });
    }
});
