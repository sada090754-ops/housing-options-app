// =============================================================================
// App — 住宅オプション選択アプリ ルート
// Design: Japanese Craft Modernism — Light theme fixed
// Routes: / (お客様用) | /admin (原価管理)
// =============================================================================

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { isAdminAuthenticated } from "@/lib/adminStorage";

const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedAdminRoute() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }
  return <Admin />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin"} component={ProtectedAdminRoute} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <WouterRouter base={basePath}>
            <AppRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
