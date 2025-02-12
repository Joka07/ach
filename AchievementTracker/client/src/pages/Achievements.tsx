import { useQuery } from "@tanstack/react-query";
import type { Achievement } from "@shared/schema";
import Layout from "@/components/Layout";
import AchievementCard from "@/components/AchievementCard";
import CreateAchievementForm from "@/components/CreateAchievementForm";

export default function Achievements() {
  const { data: achievements } = useQuery<(Achievement & { completedCount: number })[]>({
    queryKey: ["/api/achievements"],
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track all available achievements</p>
          </div>
          <CreateAchievementForm />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements?.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              showCompletion
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}