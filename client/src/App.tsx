import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Rewards from "./pages/Rewards";
import RewardsHistory from "./pages/RewardsHistory";
import VideoLibrary from "./pages/VideoLibrary";
import InteractiveVideo from "./pages/InteractiveVideo";
import AIPractice from "./pages/AIPractice";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/quiz"} component={Quiz} />
      <Route path={"/rewards"} component={Rewards} />
      <Route path={"/rewards-history"} component={RewardsHistory} />
      <Route path={"/video-library"} component={VideoLibrary} />
      <Route path={"/interactive-video/:id"} component={InteractiveVideo} />
      <Route path={"/ai-practice"} component={AIPractice} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
