import { Link, useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Trophy, Users } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen">
      <Sidebar className="w-64">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Achievement Hub
          </h1>
          <nav className="mt-6 space-y-2">
            <Button
              variant={location === "/" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              variant={location === "/achievements" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/achievements">
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </Link>
            </Button>
            <Button
              variant={location === "/user/1" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/user/1">
                <Users className="mr-2 h-4 w-4" />
                Joel's Progress
              </Link>
            </Button>
            <Button
              variant={location === "/user/2" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/user/2">
                <Users className="mr-2 h-4 w-4" />
                Benjamin's Progress
              </Link>
            </Button>
          </nav>
        </div>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}