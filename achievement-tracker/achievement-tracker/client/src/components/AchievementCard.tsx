import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Achievement, UserAchievement } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  achievement: Achievement & { completedCount?: number };
  userAchievement?: UserAchievement;
  showCompletion?: boolean;
  userId?: number;
}

export default function AchievementCard({ achievement, userAchievement, showCompletion = false, userId }: Props) {
  const { toast } = useToast();
  const completed = userAchievement?.completed || false;
  const completedByBoth = achievement.completedCount === 2;

  const handleCheck = async (checked: boolean) => {
    try {
      await apiRequest(
        "POST",
        `/api/users/${userId}/achievements/${achievement.id}`,
        { progress: checked ? 100 : 0 }
      );
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/achievements`] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: checked ? "Achievement Completed!" : "Achievement Uncompleted",
        description: checked ? "Congratulations!" : "Achievement progress reset",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update achievement status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`p-4 ${completedByBoth ? 'border-yellow-500 border-2' : completed ? 'border-purple-500' : ''}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{achievement.title}</h3>
            {completed && (
              <div className="rounded-full bg-purple-500 p-1">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          {showCompletion && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              {achievement.completedCount || 0}/2
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        <div className="flex justify-between items-center">
          {userId && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={completed}
                onCheckedChange={handleCheck}
                id={`achievement-${achievement.id}`}
              />
              <label
                htmlFor={`achievement-${achievement.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Completed
              </label>
            </div>
          )}
          {userAchievement?.completedAt && (
            <span className="text-xs text-muted-foreground">
              Completed: {format(new Date(userAchievement.completedAt), 'PPp')}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}