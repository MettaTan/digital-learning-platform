import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, FileText, MessageSquare, Trophy, Gift, BookOpen, Calendar, Sparkles, ArrowRight, User, LogOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl, APP_TITLE } from "@/const";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: quizzes } = trpc.quiz.list.useQuery();
  const { data: quizHistory } = trpc.quiz.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();
  const resetQuizMutation = trpc.quiz.resetAttempt.useMutation({
    onSuccess: () => {
      toast.success("Quiz attempt reset successfully!");
      utils.quiz.getHistory.invalidate();
      utils.quiz.checkCompleted.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleResetQuiz = (quizId: number) => {
    if (confirm("Are you sure you want to reset this quiz attempt? This will allow you to retake it.")) {
      resetQuizMutation.mutate({ quizId });
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (loading) {
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
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-4">Welcome to {APP_TITLE}</h2>
          <p className="text-gray-600 mb-6">Please login to access your dashboard</p>
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Login</a>
          </Button>
        </Card>
      </div>
    );
  }

  const completedQuizzes = quizHistory?.length || 0;
  const totalCredits = user?.totalCredits || 0;
  const weeklyProgress = user?.weeklyGoalProgress || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium">
              Content
            </button>
            <button
              onClick={() => setLocation("/courses")}
              className="py-4 px-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Courses
            </button>
            <button className="py-4 px-2 text-gray-600 hover:text-gray-800 font-medium">
              Communications
            </button>
            <button
              onClick={() => setLocation("/leaderboard")}
              className="py-4 px-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Welcome back, you!</h2>
                  <p className="text-blue-100 mb-4">
                    You've learned <span className="font-bold">{weeklyProgress}%</span> of your goal this week!
                  </p>
                  <p className="text-sm text-blue-100">Keep it up and improve your progress.</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Performance</h3>
                </div>
                <div className="mt-4">
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Overall: Good</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Completion Progress</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Cloud Computing</span>
                      <span className="text-gray-800 font-medium">Chapter 2</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Social Innovation</span>
                      <span className="text-gray-800 font-medium">Chapter 1</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Available Quizzes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Available Quizzes</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {quizzes?.slice(0, 3).map((quiz) => {
                  const hasCompleted = quizHistory?.some(h => h.quizId === quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => setLocation(`/quiz/${quiz.id}`)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                          <p className="text-sm text-gray-600">{quiz.totalQuestions} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasCompleted && user?.role === "admin" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetQuiz(quiz.id);
                            }}
                            disabled={resetQuizMutation.isPending}
                            className="text-xs"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>
                        )}
                        <Badge className={hasCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {hasCompleted ? "Completed" : `${quiz.creditsReward} credits`}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Credits Card */}
            <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-400 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Your Credits</p>
                  <p className="text-3xl font-bold">{totalCredits}</p>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/rewards")}
                className="w-full bg-white text-orange-600 hover:bg-gray-100"
              >
                View Rewards
              </Button>
            </Card>

            {/* Upcoming Activities */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Upcoming Activities</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Cloud Computing Tutorials</p>
                      <p className="text-xs text-gray-600">08 August 2024 - 8:00 AM</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                      15
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Embedded Systems Lecture</p>
                      <p className="text-xs text-gray-600">Mid August 2024 - 9:30 AM</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
                      16
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Adv. Maths Assignment Due</p>
                      <p className="text-xs text-gray-600">Mid August 2024 - 11:59 PM</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                      23
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Dr. Bjoe's Tutorial Class</p>
                      <p className="text-xs text-gray-600">End August 2024 - 12:30 AM - 1:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="link" className="w-full mt-4 text-blue-600">
                See all
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <Button
                onClick={() => setLocation("/leaderboard")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                View Leaderboard
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
