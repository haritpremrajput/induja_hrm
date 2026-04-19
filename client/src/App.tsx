import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Tools from "./pages/Tools";
import Hierarchy from "./pages/Hierarchy";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path="/404" component={NotFound} />
      <Route path="/">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/companies">
        {() => (
          <DashboardLayout>
            <Companies />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/employees">
        {() => (
          <DashboardLayout>
            <Employees />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/attendance">
        {() => (
          <DashboardLayout>
            <Attendance />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/leaves">
        {() => (
          <DashboardLayout>
            <Leaves />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/tools-materials">
        {() => (
          <DashboardLayout>
            <Tools />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/hierarchy">
        {() => (
          <DashboardLayout>
            <Hierarchy />
          </DashboardLayout>
        )}
      </Route>
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
