import { Storage } from './storage.js';
import { aiService } from './ai.js';
import { auth, saveTrip } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * TripCraft Results Logic
 * Handles AI generation, option selection, and rendering.
 */

let currentTripData = null;
let currentOptions = null;
let selectedItinerary = null;
let requestId = 0;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("ResultsPage: Loaded");
    
    currentTripData = Storage.getCurrentTrip();
    if (!currentTripData) {
        console.warn("ResultsPage: No trip data found in storage, redirecting to planner");
        window.location.href = 'planner.html';
        return;
    }
    console.log("ResultsPage: Planner data loaded", currentTripData);

    // Handle Save Button
    const saveBtn = document.querySelector('#save-trip-btn');
    onAuthStateChanged(auth, (user) => {
        updateSaveButtonVisibility();
    });

    saveBtn?.addEventListener('click', handleSaveTrip);

    // Handle Retry Button
    const retryBtn = document.querySelector('#retry-btn');
    retryBtn?.addEventListener('click', () => {
        console.log("ResultsPage: Retry clicked");
        startGeneration();
    });

    // Handle Manual Test Button
    const manualBtn = document.querySelector('#manual-test-btn');
    manualBtn?.addEventListener('click', () => {
        console.log("ResultsPage: Manual test clicked");
        startGeneration();
    });

    // Start initial generation
    startGeneration();
});

function updateSaveButtonVisibility() {
    const saveBtn = document.querySelector('#save-trip-btn');
    if (auth.currentUser && selectedItinerary) {
        saveBtn?.classList.remove('hidden');
    } else {
        saveBtn?.classList.add('hidden');
    }
}

async function handleSaveTrip() {
    const saveBtn = document.querySelector('#save-trip-btn');
    if (!selectedItinerary || !currentTripData) return;
    
    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="animate-spin" data-lucide="loader-2"></i> Saving...';
        lucide.createIcons();
        
        await saveTrip(currentTripData, selectedItinerary);
        
        saveBtn.innerHTML = '<i data-lucide="check"></i> Saved';
        saveBtn.classList.replace('btn-accent', 'btn-secondary');
        lucide.createIcons();
        window.showToast("Trip saved to your profile!", "success");
    } catch (error) {
        console.error("ResultsPage: Save failed:", error);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="bookmark"></i> Save Trip';
        lucide.createIcons();
        window.showToast("Failed to save trip.", "danger");
    }
}

async function startGeneration() {
    const thisRequestId = ++requestId;
    console.log(`ResultsPage: Starting generation (Request ID: ${thisRequestId})`);
    
    showLoading(true);
    hideError();
    hideOptions();
    hideResults();

    try {
        const result = await aiService.generateTrip(currentTripData);
        
        // Request state protection: ignore if a newer request has been started
        if (thisRequestId !== requestId) {
            console.warn(`ResultsPage: Ignoring stale response (Request ID: ${thisRequestId})`);
            return;
        }

        console.log("ResultsPage: AI response received and validated", result);
        currentOptions = result.options;
        
        showLoading(false);
        console.log("ResultsPage: Final loading cleared");
        
        if (currentOptions && currentOptions.length > 0) {
            console.log("ResultsPage: Render started");
            renderOptions(currentOptions);
            console.log("ResultsPage: Render finished");
        } else {
            throw new Error("No itinerary options returned from AI.");
        }
    } catch (error) {
        if (thisRequestId !== requestId) return;
        
        console.error("ResultsPage: Generation failed. Error message:", error.message);
        showLoading(false);
        console.log("ResultsPage: Final loading cleared (after error)");
        showError(error.message);
    }
}

function showLoading(show) {
    const loader = document.querySelector('#results-loader');
    if (!loader) return;
    loader.style.display = show ? 'flex' : 'none';
    
    if (show) {
        console.log("ResultsPage: Spinner started");
        const msgEl = loader.querySelector('p');
        const messages = [
            "Analyzing local hotspots...",
            "Optimizing your route...",
            "Finding the best hidden gems...",
            "Calculating your budget...",
            "Curating your perfect escape..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (loader.style.display === 'none') {
                clearInterval(interval);
                return;
            }
            i = (i + 1) % messages.length;
            msgEl.textContent = messages[i];
        }, 2500);
    } else {
        console.log("ResultsPage: Spinner stopped");
    }
}

function showError(message) {
    const errorContainer = document.querySelector('#error-container');
    const errorMsg = document.querySelector('#error-message');
    if (errorContainer && errorMsg) {
        errorMsg.textContent = message || "AI generation took too long or returned invalid data.";
        errorContainer.classList.remove('hidden');
        lucide.createIcons();
    }
}

function hideError() {
    document.querySelector('#error-container')?.classList.add('hidden');
}

function renderOptions(options) {
    console.log("ResultsPage: Rendering options selection");
    const selection = document.querySelector('#options-selection');
    const container = document.querySelector('#options-container');
    if (!selection || !container) return;

    container.innerHTML = options.map((opt, index) => `
        <div class="option-card glass p-8 rounded-3xl border border-white/5 hover:border-accent/50 transition-all cursor-pointer group flex flex-col h-full" data-index="${index}">
            <div class="flex justify-between items-start mb-6">
                <span class="px-4 py-1 bg-accent/10 text-accent rounded-full text-sm font-bold uppercase tracking-widest">${opt.variant || 'Custom'}</span>
                <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-all">
                    <i data-lucide="chevron-right"></i>
                </div>
            </div>
            <h3 class="text-2xl font-bold mb-2">${opt.tripTitle}</h3>
            <p class="text-text-dim mb-6 flex-grow">${opt.tagline}</p>
            <div class="pt-6 border-t border-white/5">
                <div class="flex items-center gap-2 text-accent font-bold">
                    <i data-lucide="wallet" class="w-4 h-4"></i>
                    <span>${opt.totalBudgetSummary}</span>
                </div>
            </div>
        </div>
    `).join('');

    selection.classList.remove('hidden');
    lucide.createIcons();

    // Add click listeners
    container.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-index');
            selectOption(options[index]);
        });
    });
}

function hideOptions() {
    document.querySelector('#options-selection')?.classList.add('hidden');
}

function selectOption(option) {
    console.log("ResultsPage: Option selected", option.tripTitle);
    selectedItinerary = option;
    hideOptions();
    renderFullResults(option);
    updateSaveButtonVisibility();
}

function renderFullResults(data) {
    console.log("ResultsPage: Rendering full itinerary started");
    const content = document.querySelector('#results-content');
    if (!content) return;

    // Hero
    document.querySelector('#res-title').textContent = data.tripTitle;
    document.querySelector('#res-tagline').textContent = data.tagline;
    document.querySelector('#res-dest-name').textContent = `${currentTripData.destination} • ${currentTripData.group} (${currentTripData.travelers})`;

    // Budget
    renderBudget(data.budgetBreakdown, data.totalBudgetSummary);

    // Itinerary
    renderItinerary(data.dailyPlans);

    // Tips & Packing
    if (data.foodHighlights) renderList('#packing-list', data.foodHighlights);
    if (data.tips) renderList('#travel-tips', data.tips);

    content.classList.remove('hidden');
    console.log("ResultsPage: Rendering full itinerary finished");
}

function hideResults() {
    document.querySelector('#results-content')?.classList.add('hidden');
}

function renderBudget(breakdown, summary) {
    const container = document.querySelector('#budget-container');
    if (!container) return;

    container.innerHTML = `
        <div class="budget-summary-card glass reveal active p-10 rounded-3xl border border-white/5">
            <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div class="text-center md:text-left">
                    <span class="text-text-dim uppercase tracking-widest text-sm font-bold">Budget Summary</span>
                    <h3 class="text-4xl font-black text-accent mt-2">${summary}</h3>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                ${Object.entries(breakdown).map(([key, val]) => `
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <span class="text-text-dim font-medium block mb-2">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span class="text-accent font-bold">${val}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderItinerary(days) {
    const container = document.querySelector('#itinerary-container');
    if (!container) return;

    container.innerHTML = days.map(day => `
        <div class="day-card glass reveal active p-10 rounded-3xl border border-white/5 mb-16">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-accent text-black rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-accent/20">
                        ${day.dayNumber}
                    </div>
                    <div>
                        <h3 class="text-3xl font-bold">${day.title}</h3>
                        <p class="text-accent font-bold mt-1">${day.estimatedSpendNote || ''}</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="space-y-8">
                    <div class="flex items-center gap-3 text-accent border-b border-accent/20 pb-4">
                        <i data-lucide="sun" class="w-5 h-5"></i>
                        <h4 class="font-black uppercase tracking-widest text-sm">Morning</h4>
                    </div>
                    ${day.morning.map(m => `
                        <div class="group">
                            <p class="text-text-dim leading-relaxed">${m}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="space-y-8">
                    <div class="flex items-center gap-3 text-accent border-b border-accent/20 pb-4">
                        <i data-lucide="cloud-sun" class="w-5 h-5"></i>
                        <h4 class="font-black uppercase tracking-widest text-sm">Afternoon</h4>
                    </div>
                    ${day.afternoon.map(a => `
                        <div class="group">
                            <p class="text-text-dim leading-relaxed">${a}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="space-y-8">
                    <div class="flex items-center gap-3 text-accent border-b border-accent/20 pb-4">
                        <i data-lucide="moon" class="w-5 h-5"></i>
                        <h4 class="font-black uppercase tracking-widest text-sm">Evening</h4>
                    </div>
                    ${day.evening.map(e => `
                        <div class="group">
                            <p class="text-text-dim leading-relaxed">${e}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
                <div class="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <i data-lucide="utensils"></i>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-text-dim uppercase tracking-widest">Food Highlight</span>
                        <p class="font-bold">${day.foodHighlight}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <i data-lucide="lightbulb"></i>
                    </div>
                    <div>
                        <span class="text-xs font-bold text-text-dim uppercase tracking-widest">Smart Tip</span>
                        <p class="font-bold">${day.smartTip}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderList(selector, items) {
    const container = document.querySelector(selector);
    if (!container || !items || !Array.isArray(items)) return;
    container.innerHTML = items.map(item => `
        <li class="flex items-start gap-3">
            <i data-lucide="check-circle-2" class="w-5 h-5 text-accent shrink-0 mt-0.5"></i>
            <span>${item}</span>
        </li>
    `).join('');
    lucide.createIcons();
}