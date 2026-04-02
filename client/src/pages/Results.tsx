import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Sunrise, Sun, Moon, Utensils, Lightbulb,
  Luggage, MapPin, DollarSign, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import type { GeneratedItinerary, ItineraryOption } from "@shared/tripTypes";

interface StoredResult {
  itinerary: GeneratedItinerary;
  input: {
    destination: string;
    days: number;
    budget: string;
    group: string;
    travelers: number;
    interests: string[];
    adultOnly: boolean;
  };
}

function ActivityList({ items, icon: Icon, label }: { items: string[]; icon: React.ElementType; label: string }) {
  return (
    <div className="space-y-3">
      <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {label}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed pl-4 border-l-2 border-primary/20 py-1"
            dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
          />
        ))}
      </ul>
    </div>
  );
}

function DayCard({ day, dayNum }: { day: { morning: string[]; afternoon: string[]; evening: string[]; foodHighlight: string; smartTip: string }; dayNum: number }) {
  const [expanded, setExpanded] = useState(dayNum === 1);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <h3 className="text-lg font-bold">Day {dayNum}</h3>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <ActivityList items={day.morning} icon={Sunrise} label="Morning" />
            <ActivityList items={day.afternoon} icon={Sun} label="Afternoon" />
            <ActivityList items={day.evening} icon={Moon} label="Evening" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5">
              <Utensils className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Food Highlight</p>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: day.foodHighlight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5">
              <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Smart Tip</p>
                <p className="text-sm">{day.smartTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionCard({ option, selected, onClick, label }: { option: ItineraryOption; selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_20px_oklch(0.78_0.15_210/0.2)]"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-primary">{label}</span>
          <h3 className="text-lg font-bold mt-1">{option.name}</h3>
          <p className="text-sm text-muted-foreground">{option.tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary">{option.totalBudget}</p>
          <p className="text-xs text-muted-foreground">{option.dailyBudget}/day</p>
        </div>
      </div>
    </button>
  );
}

export default function Results() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<0 | 1>(0);

  const saveMutation = trpc.trip.save.useMutation({
    onSuccess: () => {
      toast.success("Trip saved! You can find it in your Saved Trips.");
    },
    onError: (err) => {
      toast.error("Failed to save: " + err.message);
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("tripcraft_result");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        navigate("/planner");
      }
    } else {
      navigate("/planner");
    }
  }, [navigate]);

  if (!result) return null;

  const { itinerary, input } = result;
  const option = itinerary.options[selectedOption];

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save trips");
      window.location.href = getLoginUrl();
      return;
    }
    saveMutation.mutate({
      destination: input.destination,
      days: input.days,
      budget: input.budget,
      group: input.group,
      travelers: input.travelers,
      interests: input.interests,
      adultOnly: input.adultOnly,
      itinerary: itinerary as unknown as Record<string, unknown>,
      selectedOption: selectedOption === 0 ? "A" : "B",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/planner">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Planner
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="btn-glow gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Saving..." : "Save Trip"}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Generated Itinerary
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <MapPin className="inline w-8 h-8 text-primary mr-2" />
            {itinerary.destination}
          </h1>
          <p className="text-muted-foreground mt-2">
            {itinerary.daysCount} days &middot; {input.budget} &middot; {input.group} &middot; {input.interests.join(", ")}
            {input.adultOnly && " &middot; 18+"}
          </p>
        </div>

        {/* Option Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <OptionCard option={itinerary.options[0]} selected={selectedOption === 0} onClick={() => setSelectedOption(0)} label="Option A" />
          <OptionCard option={itinerary.options[1]} selected={selectedOption === 1} onClick={() => setSelectedOption(1)} label="Option B" />
        </div>

        {/* Budget Breakdown */}
        <div className="glass p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            Budget Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(option.budgetBreakdown).map(([key, val]) => (
              <div key={key} className="p-4 rounded-xl bg-secondary/30 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{key}</p>
                <p className="text-lg font-bold text-primary">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Itinerary */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl font-black">Daily Itinerary</h2>
          {option.days.map((day, i) => (
            <DayCard key={i} day={day} dayNum={i + 1} />
          ))}
        </div>

        {/* Packing & Tips */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Luggage className="w-5 h-5 text-primary" />
              Packing Essentials
            </h2>
            <ul className="space-y-2">
              {option.packingEssentials.map((item, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Travel Tips
            </h2>
            <ul className="space-y-2">
              {option.travelTips.map((tip, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link href="/planner">
            <Button variant="outline" size="lg" className="bg-transparent">Plan Another Trip</Button>
          </Link>
          <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg" className="btn-glow">
            <Save className="w-4 h-4 mr-2" />
            Save This Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
