import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Trophy, BookOpen, MessageSquare, Award, Gift, LogOut, Video, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SimpleUser } from "../../../drizzle/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [activeTab, setActiveTab] = useState("assessments");

  useEffect(() => {
    // Get user from localStorage
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

  const handleStartQuiz = () => {
    setLocation("/quiz");
  };

  if (!currentUser) {
    return null;
  }

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
        {/* Welcome Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 animate-slide-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {currentUser.name}! 👋
              </h2>
              <p className="text-lg text-muted-foreground">
                Ready to test your knowledge and earn rewards?
              </p>
            </div>
            <div className="hidden md:block">
              <Award className="w-24 h-24 text-primary opacity-50" />
            </div>
          </div>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 h-auto p-1">
            <TabsTrigger 
              value="content" 
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger 
              value="assessments"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Award className="w-5 h-5 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="rewards"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Gift className="w-5 h-5 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboard"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Video className="w-5 h-5 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="ai-practice"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI Practice
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="animate-fade-in">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Learning Content</h3>
              <p className="text-muted-foreground mb-6">
                Browse through our curated learning materials and resources.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {["Introduction to Programming", "Data Structures", "Web Development", "Database Design", "Cloud Computing", "Machine Learning"].map((topic, i) => (
                  <Card key={i} className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                    <BookOpen className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">{topic}</h4>
                    <p className="text-sm text-muted-foreground">Click to explore</p>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="animate-fade-in">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Take a Quiz</h3>
              <p className="text-muted-foreground mb-6">
                Test your knowledge and earn credits! Each correct answer earns you 10 credits.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
                  <Award className="w-12 h-12 text-primary mb-4" />
                  <h4 className="text-xl font-bold mb-2 text-foreground">Quick Quiz</h4>
                  <p className="text-muted-foreground mb-4">
                    10 random questions across various topics
                  </p>
                  <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                    <li>• Earn 10 credits per correct answer</li>
                    <li>• Get instant adaptive feedback</li>
                    <li>• Climb the leaderboard</li>
                  </ul>
                  <Button 
                    onClick={handleStartQuiz}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    size="lg"
                  >
                    Start Quiz
                  </Button>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent">
                  <Trophy className="w-12 h-12 text-accent mb-4" />
                  <h4 className="text-xl font-bold mb-2 text-foreground">Your Stats</h4>
                  <div className="space-y-3 text-foreground">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Credits:</span>
                      <span className="font-bold text-xl text-secondary">{currentUser.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quizzes Taken:</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Score:</span>
                      <span className="font-semibold">-</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="animate-fade-in">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-3">
                <Gift className="w-8 h-8 text-secondary" />
                Rewards & Incentives
              </h3>
              <p className="text-muted-foreground mb-6">
                Redeem your credits for exciting rewards including parking passes, exam seating preferences, facility bookings, and more!
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/rewards")}>
                  <Gift className="w-12 h-12 text-secondary mb-4" />
                  <h4 className="text-xl font-bold mb-2 text-foreground">Browse Rewards Catalog</h4>
                  <p className="text-muted-foreground mb-4">
                    View all available rewards and redeem your credits
                  </p>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    View Catalog
                  </Button>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/rewards-history")}>
                  <MessageSquare className="w-12 h-12 text-accent mb-4" />
                  <h4 className="text-xl font-bold mb-2 text-foreground">Redemption History</h4>
                  <p className="text-muted-foreground mb-4">
                    Track your redeemed rewards and their status
                  </p>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    View History
                  </Button>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                <h5 className="font-bold text-foreground mb-3">Available Reward Categories:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Parking Passes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Exam Seating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Facilities Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Extra Quiz Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Participation Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span>SkillsFuture Credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span>CulturePass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>CDC Vouchers</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="animate-fade-in">
            <Card className="p-8 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Interactive Video Learning</h3>
              <p className="text-muted-foreground mb-6">
                Watch educational videos with interactive quiz questions that pause at key moments to test your understanding.
              </p>
              <Button
                onClick={() => setLocation("/video-library")}
                className="bg-primary hover:bg-primary/90"
              >
                Browse Video Library
              </Button>
            </Card>
          </TabsContent>

          {/* AI Practice Tab */}
          <TabsContent value="ai-practice" className="animate-fade-in">
            <Card className="p-8 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">AI-Powered Practice</h3>
              <p className="text-muted-foreground mb-6">
                Practice with AI-generated case scenarios tailored to your weak areas. Get personalized feedback and improve your skills.
              </p>
              <Button
                onClick={() => setLocation("/ai-practice")}
                className="bg-primary hover:bg-primary/90"
              >
                Start AI Practice
              </Button>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="animate-fade-in">
            <LeaderboardView currentUserId={currentUser.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LeaderboardView({ currentUserId }: { currentUserId: number }) {
  const { data: leaderboard, isLoading } = trpc.leaderboard.getTop.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">Loading leaderboard...</div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
        <Trophy className="w-8 h-8 text-secondary" />
        Top Performers
      </h3>
      
      {leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const medals = ["🥇", "🥈", "🥉"];
            const medal = medals[index];
            
            return (
              <Card
                key={entry.userId}
                className={`p-6 transition-all ${
                  isCurrentUser
                    ? "bg-primary/10 border-2 border-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold w-12 text-center">
                      {medal || `#${index + 1}`}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-foreground flex items-center gap-2">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.totalAttempts} quiz{entry.totalAttempts !== 1 ? "zes" : ""} taken
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {entry.totalScore}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.credits} credits
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No quiz attempts yet. Be the first!</p>
        </div>
      )}
    </Card>
  );
}
