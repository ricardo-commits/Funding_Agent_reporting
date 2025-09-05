import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./components/auth/AuthProvider";
// import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Overview from "./pages/Overview";
import Campaigns from "./pages/Campaigns";
import Leads from "./pages/Leads";
import Responses from "./pages/Responses";
import Settings from "./pages/Settings";
// import { AdminSetup } from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* AuthProvider removed - no authentication required */}
        <BrowserRouter>
          <Routes>
            {/* Admin setup route removed */}
            <Route path="*" element={
              // ProtectedRoute removed - direct access to dashboard
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  {/* <Route path="/leads" element={<Leads />} /> */}
                  <Route path="/responses" element={<Responses />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DashboardLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
