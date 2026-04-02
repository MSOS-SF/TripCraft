import { CITIES } from './cities.js';

/**
 * TripCraft Explore Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#explore-grid');
    const searchInput = document.querySelector('#explore-search');
    const searchBtn = document.querySelector('#search-btn');

    const render = (filter = "") => {
        const filtered = CITIES.filter(d => 
            d.name.toLowerCase().includes(filter.toLowerCase()) || 
            d.vibe.toLowerCase().includes(filter.toLowerCase()) ||
            d.country.toLowerCase().includes(filter.toLowerCase())
        );

        if (grid) {
            grid.innerHTML = filtered.map(d => `
                <div class="dest-card glass reveal active">
                    <img src="${d.image}" alt="${d.name}" referrerPolicy="no-referrer">
                    <div class="content">
                        <h3>${d.name}</h3>
                        <p>${d.vibe} • Best for ${d.bestFor}</p>
                        <a href="planner.html?dest=${d.name}" class="btn btn-sm btn-primary">Plan Trip</a>
                    </div>
                </div>
            `).join('');
            
            if (filtered.length === 0) {
                grid.innerHTML = `<div class="empty-state">No destinations found for "${filter}"</div>`;
            }
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => render(e.target.value));
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => render(searchInput.value));
    }

    render();
});
