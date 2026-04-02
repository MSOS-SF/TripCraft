import { invokeLLM } from "./_core/llm";
import type { TripInput, GeneratedItinerary } from "../shared/tripTypes";

function buildPrompt(input: TripInput): string {
  const interestDescriptions: Record<string, string> = {
    "food": "restaurants, cafes, street food stalls, bakeries, and local food markets — give SPECIFIC real names of popular and highly-rated food spots",
    "history": "historical landmarks, museums, monuments, and heritage sites — give SPECIFIC real names of famous historical places",
    "art": "art galleries, design studios, street art districts, and creative spaces — give SPECIFIC real names of art venues",
    "nature": "parks, gardens, hiking trails, scenic viewpoints, and natural attractions — give SPECIFIC real names of nature spots",
    "nightlife": "popular bars, nightclubs, rooftop lounges, live music venues, and pubs — give SPECIFIC real names of nightlife venues (NOT adult/strip clubs)",
    "shopping": "shopping streets, malls, boutiques, local markets, and souvenir shops — give SPECIFIC real names of shopping destinations",
    "adult": "strip clubs, gentlemen's clubs, cannabis/weed clubs, adult entertainment venues, and red-light district attractions — give SPECIFIC real names of adult-only venues"
  };

  const selectedInterests = input.interests.map(i => {
    const key = i.toLowerCase().replace(/[^a-z]/g, "");
    if (key.includes("food") || key.includes("dining")) return interestDescriptions["food"];
    if (key.includes("history")) return interestDescriptions["history"];
    if (key.includes("art") || key.includes("design")) return interestDescriptions["art"];
    if (key.includes("nature")) return interestDescriptions["nature"];
    if (key.includes("nightlife")) return interestDescriptions["nightlife"];
    if (key.includes("shopping")) return interestDescriptions["shopping"];
    return `${i} — give SPECIFIC real names of popular ${i} spots`;
  });

  if (input.adultOnly) {
    selectedInterests.push(interestDescriptions["adult"]);
  }

  const budgetGuide: Record<string, string> = {
    "budget": "Budget-friendly options. Think hostels, street food, free walking tours, public transport. Daily budget: $30-80 per person.",
    "mid-range": "Mid-range comfort. Think 3-star hotels, sit-down restaurants, guided tours, mix of taxi and public transport. Daily budget: $80-200 per person.",
    "premium": "Premium luxury. Think 4-5 star hotels, fine dining, private tours, taxis and private transfers. Daily budget: $200-500+ per person."
  };

  return `You are TripCraft, an expert travel planner. Generate a detailed ${input.days}-day itinerary for ${input.destination}.

TRAVELER PROFILE:
- Group: ${input.group} (${input.travelers} travelers)
- Budget: ${input.budget} — ${budgetGuide[input.budget] || budgetGuide["mid-range"]}
- Interests: ${selectedInterests.join("; ")}

CRITICAL REQUIREMENTS:
1. You MUST provide REAL, SPECIFIC names of actual places that exist in ${input.destination}. NOT generic descriptions like "visit a museum" or "go to a restaurant". Give the ACTUAL NAME of the place so the user can search it on Google Maps.
2. For each activity, format as: "**[Place Name]** — Brief description of what to do there and why it's worth visiting"
3. Generate TWO different itinerary options:
   - Option A: "Popular & Iconic" — well-known, highly-rated, tourist-favorite spots
   - Option B: "Hidden Gems & Local Favorites" — lesser-known but excellent local spots, different price points
4. Each option MUST have completely different venues (no overlap between A and B)
5. Each day must have 2-3 morning activities, 2-3 afternoon activities, and 2-3 evening activities
6. Include a food highlight for each day (a specific restaurant or food spot name)
7. Include a smart travel tip for each day (practical, specific to the location)
8. Budget breakdown must be realistic for ${input.destination} at the ${input.budget} tier
9. Packing essentials should be specific to ${input.destination} and the season
10. Travel tips should be practical and specific to ${input.destination}

IMPORTANT: Every single activity MUST mention a REAL place by name. The user needs to be able to copy the name and find it on Google Maps. Think of places like "Berghain" for Berlin nightlife, "Mustafas Gemüse Kebap" for Berlin street food, "Zeljo" for Sarajevo food, etc.

Respond with valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):
{
  "destination": "${input.destination}",
  "daysCount": ${input.days},
  "options": [
    {
      "name": "Popular & Iconic",
      "tagline": "A short catchy tagline for this option",
      "dailyBudget": "$XX",
      "totalBudget": "$XXX",
      "budgetBreakdown": {
        "accommodation": "$XX/night",
        "food": "$XX/day",
        "activities": "$XX/day",
        "transport": "$XX/day"
      },
      "days": [
        {
          "morning": ["**Place Name** — Description", "**Place Name** — Description"],
          "afternoon": ["**Place Name** — Description", "**Place Name** — Description"],
          "evening": ["**Place Name** — Description", "**Place Name** — Description"],
          "foodHighlight": "Specific Restaurant Name — what to order",
          "smartTip": "Practical tip for this day"
        }
      ],
      "packingEssentials": ["item1", "item2", "item3", "item4", "item5"],
      "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
    },
    {
      "name": "Hidden Gems & Local Favorites",
      "tagline": "A short catchy tagline for this option",
      "dailyBudget": "$XX",
      "totalBudget": "$XXX",
      "budgetBreakdown": {
        "accommodation": "$XX/night",
        "food": "$XX/day",
        "activities": "$XX/day",
        "transport": "$XX/day"
      },
      "days": [
        {
          "morning": ["**Place Name** — Description", "**Place Name** — Description"],
          "afternoon": ["**Place Name** — Description", "**Place Name** — Description"],
          "evening": ["**Place Name** — Description", "**Place Name** — Description"],
          "foodHighlight": "Specific Restaurant Name — what to order",
          "smartTip": "Practical tip for this day"
        }
      ],
      "packingEssentials": ["item1", "item2", "item3", "item4", "item5"],
      "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
    }
  ]
}`;
}

export async function generateItinerary(input: TripInput): Promise<GeneratedItinerary> {
  const prompt = buildPrompt(input);

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are TripCraft, an expert AI travel planner. You always respond with valid JSON only. You know real places around the world and always recommend specific, real venues by name."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "itinerary",
        strict: false,
        schema: {
          type: "object",
          properties: {
            destination: { type: "string" },
            daysCount: { type: "number" },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  tagline: { type: "string" },
                  dailyBudget: { type: "string" },
                  totalBudget: { type: "string" },
                  budgetBreakdown: {
                    type: "object",
                    properties: {
                      accommodation: { type: "string" },
                      food: { type: "string" },
                      activities: { type: "string" },
                      transport: { type: "string" }
                    },
                    required: ["accommodation", "food", "activities", "transport"]
                  },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        morning: { type: "array", items: { type: "string" } },
                        afternoon: { type: "array", items: { type: "string" } },
                        evening: { type: "array", items: { type: "string" } },
                        foodHighlight: { type: "string" },
                        smartTip: { type: "string" }
                      },
                      required: ["morning", "afternoon", "evening", "foodHighlight", "smartTip"]
                    }
                  },
                  packingEssentials: { type: "array", items: { type: "string" } },
                  travelTips: { type: "array", items: { type: "string" } }
                },
                required: ["name", "tagline", "dailyBudget", "totalBudget", "budgetBreakdown", "days", "packingEssentials", "travelTips"]
              }
            }
          },
          required: ["destination", "daysCount", "options"]
        }
      }
    }
  });

  const content = result.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM returned empty or invalid response");
  }

  // Clean any markdown code block wrappers
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(cleaned) as GeneratedItinerary;

  // Validate basic structure
  if (!parsed.options || parsed.options.length < 2) {
    throw new Error("LLM response missing required itinerary options");
  }

  return parsed;
}
