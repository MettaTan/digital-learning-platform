import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Gift, History, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Rewards() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState("catalog");

  const { data: rewards, isLoading: rewardsLoading } = trpc.rewards.list.useQuery();
  const { data: redemptions } = trpc.rewards.getRedemptions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: transactions } = trpc.rewards.getTransactions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: leaderboard } = trpc.leaderboard.get.useQuery({ limit: 10 });

  const utils = trpc.useUtils();
  const redeemMutation = trpc.rewards.redeem.useMutation({
    onSuccess: () => {
      toast.success("Reward redeemed successfully!");
      utils.rewards.getRedemptions.invalidate();
      utils.rewards.getTransactions.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRedeem = (rewardId: number, creditCost: number) => {
    if (!user) {
      toast.error("Please login to redeem rewards");
      return;
    }
    if ((user.totalCredits || 0) < creditCost) {
      toast.error("Insufficient credits");
      return;
    }
    redeemMutation.mutate({ rewardId });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "facilities":
        return "🏢";
      case "exam":
        return "📝";
      case "quiz":
        return "⏱️";
      case "grades":
        return "📊";
      case "voucher":
        return "🎟️";
      case "parking":
        return "🚗";
      default:
        return "🎁";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "facilities":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "exam":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "quiz":
        return "bg-green-100 text-green-800 border-green-300";
      case "grades":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "voucher":
        return "bg-pink-100 text-pink-800 border-pink-300";
      case "parking":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="p-8 max-w-md text-center">
          <Gift className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view and redeem rewards</p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Credits */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Rewards Center</h1>
              <p className="text-gray-600">Redeem your credits for amazing benefits</p>
            </div>
            <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-400 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white/90 text-sm font-medium">Your Credits</p>
                  <p className="text-white text-3xl font-bold">{user?.totalCredits || 0}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Catalog</span>
            </TabsTrigger>

            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">My Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Rewards Catalog */}
          <TabsContent value="catalog" className="space-y-4">
            {rewardsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards?.map((reward) => (
                  <Card key={reward.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{getCategoryIcon(reward.category)}</div>
                      <Badge className={`${getCategoryColor(reward.category)} border`}>
                        {reward.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{reward.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="text-2xl font-bold text-gray-800">{reward.creditCost}</span>
                        <span className="text-gray-600">credits</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.creditCost)}
                      disabled={
                        !user ||
                        (user.totalCredits || 0) < reward.creditCost ||
                        redeemMutation.isPending
                      }
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {redeemMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redeeming...
                        </>
                      ) : (
                        "Redeem Now"
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>



          {/* My Redemptions */}
          <TabsContent value="redemptions">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Redemptions</h2>
              {!redemptions || redemptions.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No redemptions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">Reward #{redemption.rewardId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(redemption.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">-{redemption.creditsSpent} credits</p>
                        <Badge
                          className={
                            redemption.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : redemption.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {redemption.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="transactions">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Credit History</h2>
              {!transactions || transactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === "earned" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "earned" ? "+" : "-"}
                          {Math.abs(transaction.amount)}
                        </p>
                        <Badge
                          className={
                            transaction.type === "earned"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
