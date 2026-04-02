import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CITIES } from "@shared/cities";
import { Loader2, MapPin, Calendar, Wallet, Users, Heart, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const INTERESTS = [
  { id: "food", label: "Food & Dining", icon: "🍽️" },
  { id: "history", label: "History", icon: "🏛️" },
  { id: "art", label: "Art & Design", icon: "🎨" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "nightlife", label: "Nightlife", icon: "🎵" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
];

export default function Planner() {
  const [, navigate] = useLocation();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<"budget" | "mid-range" | "premium">("mid-range");
  const [group, setGroup] = useState<"solo" | "couple" | "friends" | "family">("solo");
  const [travelers, setTravelers] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [adultOnly, setAdultOnly] = useState(false);

  const cityNames = useMemo(() => CITIES.map(c => c.name), []);

  const generateMutation = trpc.trip.generate.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("tripcraft_result", JSON.stringify({
        itinerary: data,
        input: { destination, days, budget, group, travelers, interests, adultOnly },
      }));
      navigate("/results");
    },
    onError: (err) => {
      toast.error("Generation failed: " + err.message);
    },
  });

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) { toast.error("Please enter a destination"); return; }
    if (interests.length === 0) { toast.error("Please select at least one interest"); return; }

    generateMutation.mutate({
      destination: destination.trim(),
      days,
      budget,
      group,
      travelers,
      interests,
      adultOnly,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Plan Your <span className="text-primary">Trip</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Fill in your preferences and our AI will find the best real-world spots for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination & Duration */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Destination & Duration
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="destination">Where do you want to go?</Label>
                <Input
                  id="destination"
                  list="city-list"
                  placeholder="e.g. Berlin, Paris, Tokyo..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
                <datalist id="city-list">
                  {cityNames.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  How many days?
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    id="days"
                    type="range"
                    min={1}
                    max={14}
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-2xl font-black text-primary w-10 text-center">{days}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Group */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Budget & Group
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Budget Tier</Label>
                <Select value={budget} onValueChange={(v) => setBudget(v as typeof budget)}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget (Essential)</SelectItem>
                    <SelectItem value="mid-range">Mid-Range (Comfort)</SelectItem>
                    <SelectItem value="premium">Premium (Luxury)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Travel Group</Label>
                <Select value={group} onValueChange={(v) => setGroup(v as typeof group)}>
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelers" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Travelers
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={e => setTravelers(Number(e.target.value))}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="glass p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Interests
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map(i => (
                <label
                  key={i.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    interests.includes(i.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={interests.includes(i.id)}
                    onCheckedChange={() => toggleInterest(i.id)}
                  />
                  <span className="text-lg">{i.icon}</span>
                  <span className="font-medium text-sm">{i.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <label className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/30 cursor-pointer">
                <Switch checked={adultOnly} onCheckedChange={setAdultOnly} />
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Adult-only recommendations
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommendations for ages 18+. Includes mature entertainment options.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="btn-glow text-lg px-12 py-6 font-semibold"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Itinerary
                </>
              )}
            </Button>
            {generateMutation.isPending && (
              <p className="text-sm text-muted-foreground mt-4">
                Our AI is finding the best real-world spots for you. This may take 15-30 seconds...
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
