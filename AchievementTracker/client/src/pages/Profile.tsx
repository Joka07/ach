import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import AchievementCard from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["/api/users/1/achievements"],
  });

  const totalPoints = achievements?.reduce((acc, a) => acc + a.points, 0) || 0;
  const earnedPoints = userAchievements?.reduce(
    (acc, ua) => (ua.completed ? acc + ua.achievement.points : acc),
    0
  ) || 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Your Achievements</h1>
          <p className="text-muted-foreground">Track your progress and unlock rewards</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
          <Progress
            value={(earnedPoints / totalPoints) * 100}
            className="h-2 mb-2"
          />
          <p className="text-sm text-muted-foreground">
            {earnedPoints} / {totalPoints} Points Earned
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements?.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              userAchievement={userAchievements?.find(
                (ua) => ua.achievementId === achievement.id
              )}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
