import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  MapPin, Calendar, Wallet, Trash2, Eye, Loader2, LogIn, PlaneTakeoff, Sparkles
} from "lucide-react";

export default function Saved() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: trips, isLoading } = trpc.trip.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.trip.delete.useMutation({
    onSuccess: () => {
      toast.success("Trip deleted");
      utils.trip.list.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to delete: " + err.message);
    },
  });

  const handleView = (trip: NonNullable<typeof trips>[number]) => {
    const itinerary = trip.itinerary as Record<string, unknown>;
    sessionStorage.setItem("tripcraft_result", JSON.stringify({
      itinerary,
      input: {
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget,
        group: trip.group,
        travelers: trip.travelers,
        interests: trip.interests,
        adultOnly: trip.adultOnly === 1,
      },
    }));
    navigate("/results");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container max-w-lg text-center">
          <div className="glass p-12 rounded-2xl space-y-6">
            <LogIn className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-3xl font-black">Sign In Required</h1>
            <p className="text-muted-foreground">
              Sign in to save and access your trip itineraries.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="btn-glow">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Saved <span className="text-primary">Trips</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Your collection of AI-generated itineraries.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center space-y-6">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">No saved trips yet</h2>
            <p className="text-muted-foreground">
              Plan your first trip and save it to see it here.
            </p>
            <Link href="/planner">
              <Button size="lg" className="btn-glow">
                <PlaneTakeoff className="w-4 h-4 mr-2" />
                Plan a Trip
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => (
              <div key={trip.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {trip.destination}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.days} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      {trip.budget}
                    </span>
                    <span>
                      {(trip.interests as string[]).join(", ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved on {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent" onClick={() => handleView(trip)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate({ id: trip.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
