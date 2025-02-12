import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Achievement, UserAchievement } from "@shared/schema";
import Layout from "@/components/Layout";
import AchievementCard from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";

export default function UserAchievements() {
  const params = useParams<{ id: string }>();
  const userId = params.id ? parseInt(params.id) : 1;
  const username = userId === 1 ? "Joel" : "Benjamin";

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements } = useQuery<(UserAchievement & { achievement: Achievement })[]>({
    queryKey: [`/api/users/${userId}/achievements`],
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{username}'s Achievements</h1>
          <p className="text-muted-foreground">Track your progress and unlock achievements</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements?.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              userAchievement={userAchievements?.find(
                (ua) => ua.achievementId === achievement.id
              )}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}