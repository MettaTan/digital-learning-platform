import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Car,
  Armchair,
  DoorOpen,
  Clock,
  TrendingUp,
  GraduationCap,
  Palette,
  Ticket,
  Gift,
  BookOpen,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { SimpleUser } from "../../../drizzle/schema";

const iconMap: Record<string, any> = {
  Car,
  Armchair,
  DoorOpen,
  Clock,
  TrendingUp,
  GraduationCap,
  Palette,
  Ticket,
};

const categoryColors: Record<string, string> = {
  parking: "bg-blue-500",
  exam_seating: "bg-purple-500",
  facilities_booking: "bg-green-500",
  quiz_time: "bg-yellow-500",
  participation_points: "bg-orange-500",
  skillsfuture: "bg-indigo-500",
  culturepass: "bg-pink-500",
  cdc_voucher: "bg-red-500",
};

const categoryLabels: Record<string, string> = {
  parking: "Parking",
  exam_seating: "Exam Seating",
  facilities_booking: "Facilities",
  quiz_time: "Quiz Time",
  participation_points: "Participation",
  skillsfuture: "SkillsFuture",
  culturepass: "CulturePass",
  cdc_voucher: "CDC Voucher",
};

export default function Rewards() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data: rewards, isLoading: loadingRewards } = trpc.rewards.getAll.useQuery(
    undefined,
    { enabled: !!currentUser }
  );
  
  const redeemMutation = trpc.rewards.redeem.useMutation();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const handleRedeemClick = (reward: any) => {
    if (!currentUser) return;
    
    if (currentUser.credits < reward.creditCost) {
      toast.error("Insufficient credits", {
        description: `You need ${reward.creditCost - currentUser.credits} more credits to redeem this reward.`,
      });
      return;
    }
    
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!currentUser || !selectedReward) return;

    try {
      const result = await redeemMutation.mutateAsync({
        userId: currentUser.id,
        rewardId: selectedReward.id,
        creditsCost: selectedReward.creditCost,
      });

      // Update user credits in localStorage
      const updatedUser = { ...currentUser, credits: result.remainingCredits };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast.success("Reward redeemed successfully!", {
        description: `You now have ${result.remainingCredits} credits remaining.`,
      });

      setShowConfirmDialog(false);
      setSelectedReward(null);
    } catch (error: any) {
      toast.error("Failed to redeem reward", {
        description: error.message || "Please try again later.",
      });
    }
  };

  if (!currentUser) return null;

  // Group rewards by category
  const groupedRewards = rewards?.reduce((acc: Record<string, any[]>, reward) => {
    if (!acc[reward.category]) {
      acc[reward.category] = [];
    }
    acc[reward.category].push(reward);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Digital Learning Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg">
              <Gift className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-foreground">{currentUser.credits} Credits</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/dashboard")}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Rewards Catalog</h2>
          <p className="text-lg text-muted-foreground">
            Redeem your hard-earned credits for exciting rewards!
          </p>
        </div>

        {loadingRewards ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : groupedRewards && Object.keys(groupedRewards).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedRewards).map(([category, categoryRewards]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${categoryColors[category]} text-white px-3 py-1 text-sm`}>
                    {categoryLabels[category]}
                  </Badge>
                  <h3 className="text-xl font-semibold text-foreground">
                    {categoryLabels[category]} Rewards
                  </h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(categoryRewards as any[]).map((reward) => {
                    const Icon = iconMap[reward.icon || "Gift"] || Gift;
                    const canAfford = currentUser.credits >= reward.creditCost;
                    
                    return (
                      <Card
                        key={reward.id}
                        className={`p-6 transition-all hover:shadow-lg ${
                          canAfford ? "border-2 hover:border-primary" : "opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${categoryColors[reward.category]} bg-opacity-20`}>
                            <Icon className={`w-8 h-8 ${categoryColors[reward.category].replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground mb-1">{reward.name}</h4>
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-secondary" />
                            <span className="text-lg font-bold text-secondary">
                              {reward.creditCost} credits
                            </span>
                          </div>
                          <Button
                            onClick={() => handleRedeemClick(reward)}
                            disabled={!canAfford || redeemMutation.isPending}
                            size="sm"
                            className={canAfford ? "bg-primary hover:bg-primary/90" : ""}
                          >
                            {canAfford ? "Redeem" : "Not enough"}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">No rewards available at the moment.</p>
          </Card>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <Card className="p-4 bg-muted">
                <h4 className="font-bold text-foreground mb-2">{selectedReward.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{selectedReward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className="font-bold text-secondary">{selectedReward.creditCost} credits</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Your credits:</span>
                  <span className="font-bold">{currentUser.credits} credits</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-sm font-semibold">Remaining:</span>
                  <span className="font-bold text-primary">
                    {currentUser.credits - selectedReward.creditCost} credits
                  </span>
                </div>
              </Card>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your redemption will be processed and you'll be notified once it's ready to use.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={redeemMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRedeem}
              disabled={redeemMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {redeemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Redemption
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
