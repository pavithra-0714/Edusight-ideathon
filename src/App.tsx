import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VoiceProvider } from "@/contexts/VoiceContext";
import { AppProvider } from "@/contexts/AppContext";

// Pages
import { SplashScreen } from "./pages/SplashScreen";
import { LanguageScreen } from "./pages/LanguageScreen";
import { TermsScreen } from "./pages/TermsScreen";
import { WelcomeScreen } from "./pages/WelcomeScreen";
import { AccessibilityTestScreen } from "./pages/AccessibilityTestScreen";
import { HomeScreen } from "./pages/HomeScreen";
import { ChaptersScreen } from "./pages/ChaptersScreen";
import { SmartLearnScreen } from "./pages/SmartLearnScreen";
import { AdminPanel } from "./pages/AdminPanel";
import { SettingsScreen } from "./pages/SettingsScreen";
import { ExploreScreen } from "./pages/ExploreScreen";
import { RevisionScreen } from "./pages/RevisionScreen";
import { AudioExperimentScreen } from "./pages/AudioExperimentScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <VoiceProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Onboarding Flow */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/language" element={<LanguageScreen />} />
              <Route path="/terms" element={<TermsScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/accessibility-test" element={<AccessibilityTestScreen />} />
              
              {/* Main App */}
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/chapters" element={<ChaptersScreen />} />
              <Route path="/smartlearn/:chapterId" element={<SmartLearnScreen />} />
              <Route path="/explore/:chapterId" element={<ExploreScreen />} />
              <Route path="/revision/:chapterId" element={<RevisionScreen />} />
              <Route path="/audio-experiment/:chapterId" element={<AudioExperimentScreen />} />
              
              {/* Admin & Settings */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/settings" element={<SettingsScreen />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </VoiceProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
