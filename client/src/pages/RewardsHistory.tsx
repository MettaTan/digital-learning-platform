import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  History,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { SimpleUser } from "../../../drizzle/schema";
import { CountdownTimer } from "@/components/CountdownTimer";

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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusIcons: Record<string, any> = {
  pending: Clock3,
  approved: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
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

export default function RewardsHistory() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);

  const { data: redemptions, isLoading } = trpc.rewards.getUserRedemptions.useQuery(
    { userId: currentUser?.id || 0 },
    { enabled: !!currentUser }
  );

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

  if (!currentUser) return null;

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
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Rewards History
          </h2>
          <p className="text-lg text-muted-foreground">
            View all your redeemed rewards and their status
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : redemptions && redemptions.length > 0 ? (
          <div className="space-y-4">
            {redemptions.map((redemption) => {
              const Icon = redemption.icon ? (iconMap[redemption.icon] || Gift) : Gift;
              const StatusIcon = statusIcons[redemption.status];
              
              return (
                <Card key={redemption.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{redemption.rewardName}</h3>
                          <p className="text-sm text-muted-foreground">{redemption.rewardDescription}</p>
                        </div>
                        <Badge className={`${statusColors[redemption.status]} text-white flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-secondary" />
                          <span className="font-semibold text-secondary">{redemption.creditsCost} credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {redemption.category ? categoryLabels[redemption.category] : "Other"}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          Redeemed: {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </div>
                        {redemption.expiresAt && (
                          <CountdownTimer expiresAt={redemption.expiresAt} status={redemption.status} />
                        )}
                      </div>
                      
                      {redemption.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>Note:</strong> {redemption.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Redemptions Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't redeemed any rewards yet. Start earning credits and redeem exciting rewards!
            </p>
            <Button onClick={() => setLocation("/rewards")} className="bg-primary hover:bg-primary/90">
              Browse Rewards Catalog
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
