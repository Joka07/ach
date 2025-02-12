import { useQuery } from "@tanstack/react-query";
import type { Achievement } from "@shared/schema";
import Layout from "@/components/Layout";
import AchievementCard from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Home() {
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">Track your gaming achievements</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Achievements</h2>
              <p className="text-muted-foreground">
                {achievements?.length || 0} Total Achievements
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Latest Achievements</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements?.slice(0, 4).map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}