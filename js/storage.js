/**
 * TripCraft Storage Helpers
 */

export const Storage = {
    saveTrip: (trip) => {
        const trips = Storage.getSavedTrips();
        trips.push({ ...trip, id: Date.now(), savedAt: new Date().toISOString() });
        localStorage.setItem('tripcraft_saved_trips', JSON.stringify(trips));
    },

    getSavedTrips: () => {
        const data = localStorage.getItem('tripcraft_saved_trips');
        return data ? JSON.parse(data) : [];
    },

    deleteTrip: (id) => {
        const trips = Storage.getSavedTrips();
        const filtered = trips.filter(t => t.id !== id);
        localStorage.setItem('tripcraft_saved_trips', JSON.stringify(filtered));
    },

    setCurrentTrip: (trip) => {
        localStorage.setItem('tripcraft_current_trip', JSON.stringify(trip));
    },

    getCurrentTrip: () => {
        const data = localStorage.getItem('tripcraft_current_trip');
        return data ? JSON.parse(data) : null;
    },

    setItinerary: (itinerary) => {
        localStorage.setItem('tripcraft_current_itinerary', JSON.stringify(itinerary));
    },

    getItinerary: () => {
        const data = localStorage.getItem('tripcraft_current_itinerary');
        return data ? JSON.parse(data) : null;
    },

    clearCurrentTrip: () => {
        localStorage.removeItem('tripcraft_current_trip');
        localStorage.removeItem('tripcraft_current_itinerary');
    },

    setTheme: (theme) => {
        localStorage.setItem('tripcraft_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    getTheme: () => {
        return localStorage.getItem('tripcraft_theme') || 'dark';
    }
};
