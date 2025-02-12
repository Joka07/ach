import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Friend, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Props {
  friend: Friend & { friend: User };
  onAccept?: () => void;
}

export default function FriendCard({ friend, onAccept }: Props) {
  const { toast } = useToast();

  const handleAccept = async () => {
    try {
      await apiRequest(
        "POST",
        `/api/users/${friend.friendId}/friends/${friend.userId}/accept`
      );
      toast({
        title: "Friend request accepted",
        description: `You are now friends with ${friend.friend.username}`,
      });
      onAccept?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not accept friend request",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {friend.friend.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{friend.friend.username}</h3>
          <p className="text-sm text-muted-foreground">Level {friend.friend.level}</p>
        </div>
        {friend.status === "pending" && friend.friendId === friend.friend.id && (
          <Button onClick={handleAccept} size="sm">
            Accept
          </Button>
        )}
      </div>
    </Card>
  );
}
