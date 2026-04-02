import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PlaneTakeoff, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/planner", label: "Planner" },
    { href: "/explore", label: "Explore" },
    { href: "/saved", label: "Saved" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex justify-between items-center h-16">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <PlaneTakeoff className="text-primary w-6 h-6" />
          TRIPCRAFT
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-medium transition-colors hover:text-primary ${location === l.href ? "text-primary" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {user?.name || "User"}
              </span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </a>
          )}

          <Link href="/planner">
            <Button className="btn-glow">Start Planning</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border pb-4 px-4 space-y-3">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 font-medium ${location === l.href ? "text-primary" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false); }}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
