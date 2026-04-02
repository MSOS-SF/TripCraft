import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlaneTakeoff, MapPin, Sparkles, Clock, Shield, Utensils, Moon } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI-Powered", desc: "Smart itineraries with real venue names you can search on Google Maps" },
  { icon: MapPin, title: "Real Places", desc: "Actual restaurants, clubs, and landmarks — not generic suggestions" },
  { icon: Utensils, title: "Interest-Based", desc: "Food, nightlife, nature, history, shopping, and adult-only categories" },
  { icon: Clock, title: "Day-by-Day", desc: "Morning, afternoon, and evening activities planned for every day" },
  { icon: Shield, title: "Budget-Smart", desc: "Three budget tiers with realistic daily spending estimates" },
  { icon: Moon, title: "Dual Options", desc: "Choose between Popular & Iconic or Hidden Gems & Local Favorites" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.15_210/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.55_0.15_290/0.1),transparent_60%)]" />

        <div className="container relative z-10 pt-24">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Trip Planning
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
              Plan Your Perfect
              <br />
              <span className="text-primary">Trip in Seconds</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Tell us where you want to go, what you love, and your budget.
              Our AI finds the best real-world spots and builds a day-by-day itinerary just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/planner">
                <Button size="lg" className="btn-glow text-lg px-8 py-6 font-semibold">
                  <PlaneTakeoff className="w-5 h-5 mr-2" />
                  Build My Trip
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 font-semibold bg-transparent">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Cities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Why <span className="text-primary">TripCraft</span>?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              No more generic travel advice. Get specific, real-world recommendations tailored to your interests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              How It <span className="text-primary">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Tell Us Your Vibe", desc: "Pick your destination, budget, group type, and interests." },
              { step: "02", title: "AI Finds Real Spots", desc: "Our AI searches for the best actual venues and builds your itinerary." },
              { step: "03", title: "Go Explore", desc: "Get a day-by-day plan with real place names you can search on Maps." },
            ].map((s) => (
              <div key={s.step} className="text-center space-y-4">
                <div className="text-5xl font-black text-primary/20">{s.step}</div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="glass p-12 md:p-16 text-center rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.78_0.15_210/0.1),transparent_70%)]" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Ready to Plan Your Next Adventure?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join thousands of travelers who use TripCraft to discover real places and build unforgettable trips.
              </p>
              <Link href="/planner">
                <Button size="lg" className="btn-glow text-lg px-8 py-6 font-semibold mt-4">
                  <PlaneTakeoff className="w-5 h-5 mr-2" />
                  Start Planning Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>TripCraft — AI-Powered Trip Planning</p>
        </div>
      </footer>
    </div>
  );
}
