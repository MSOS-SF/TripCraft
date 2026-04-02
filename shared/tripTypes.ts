export interface TripInput {
  destination: string;
  days: number;
  budget: "budget" | "mid-range" | "premium";
  group: "solo" | "couple" | "friends" | "family";
  travelers: number;
  interests: string[];
  adultOnly: boolean;
}

export interface DayActivity {
  morning: string[];
  afternoon: string[];
  evening: string[];
  foodHighlight: string;
  smartTip: string;
}

export interface ItineraryOption {
  name: string;
  tagline: string;
  dailyBudget: string;
  totalBudget: string;
  budgetBreakdown: {
    accommodation: string;
    food: string;
    activities: string;
    transport: string;
  };
  days: DayActivity[];
  packingEssentials: string[];
  travelTips: string[];
}

export interface GeneratedItinerary {
  destination: string;
  daysCount: number;
  options: [ItineraryOption, ItineraryOption];
}

export interface CityData {
  name: string;
  country: string;
  vibe: string;
  bestFor: string;
  image: string;
}
