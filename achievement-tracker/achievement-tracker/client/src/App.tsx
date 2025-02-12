import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import UserAchievements from "@/pages/UserAchievements";
import Achievements from "@/pages/Achievements";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/user/:id" component={UserAchievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Router />
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;