import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Results from "./pages/Results";
import Explore from "./pages/Explore";
import Saved from "./pages/Saved";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/planner"} component={Planner} />
      <Route path={"/results"} component={Results} />
      <Route path={"/explore"} component={Explore} />
      <Route path={"/saved"} component={Saved} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Navbar />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
