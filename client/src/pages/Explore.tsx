import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CITIES } from "@shared/cities";
import { Search, MapPin, Sparkles } from "lucide-react";

const VIBES = ["All", "Romantic", "Historic", "Vibrant", "Cultural", "Edgy", "Luxurious", "Exotic", "Scenic", "Festive", "Wild"];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("All");

  const filtered = useMemo(() => {
    return CITIES.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase());
      const matchesVibe = selectedVibe === "All" || city.vibe === selectedVibe;
      return matchesSearch && matchesVibe;
    });
  }, [search, selectedVibe]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Explore <span className="text-primary">Destinations</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Browse popular cities and find your next adventure. Click any city to start planning.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="glass p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {VIBES.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVibe(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedVibe === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* City Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(city => (
            <Link key={city.name} href={`/planner?destination=${encodeURIComponent(city.name)}`}>
              <div className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 text-white/80 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    {city.country}
                  </div>
                  <h3 className="text-xl font-bold text-white">{city.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs backdrop-blur-sm">
                      {city.vibe}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/30 text-white text-xs backdrop-blur-sm">
                      {city.bestFor}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No cities found</h3>
            <p className="text-muted-foreground">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
