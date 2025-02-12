import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import FriendCard from "@/components/FriendCard";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Friends() {
  const { data: friends, refetch } = useQuery({
    queryKey: ["/api/users/1/friends"],
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Friends</h1>
          <p className="text-muted-foreground">Connect with other players</p>
        </div>

        <div className="grid gap-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
            <div className="space-y-4">
              {friends
                ?.filter((f) => f.status === "pending")
                .map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onAccept={refetch}
                  />
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
            <div className="space-y-4">
              {friends
                ?.filter((f) => f.status === "accepted")
                .map((friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
