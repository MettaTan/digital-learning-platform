import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  LogOut,
  Send,
  Loader2,
  Bot,
  User,
  Gift,
  Sparkles,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import type { SimpleUser } from "../../../drizzle/schema";
import { Streamdown } from "streamdown";

export default function AIPractice() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: scenarios, refetch: refetchScenarios } = trpc.aiPractice.getUserScenarios.useQuery(
    { userId: currentUser?.id || 0 },
    { enabled: !!currentUser }
  );

  const { data: conversations, refetch: refetchConversations } = trpc.aiPractice.getConversations.useQuery(
    { scenarioId: currentScenario?.id || 0 },
    { enabled: !!currentScenario }
  );

  const { data: weakAreas } = trpc.aiPractice.getWeakAreas.useQuery(
    { userId: currentUser?.id || 0 },
    { enabled: !!currentUser }
  );

  const createScenarioMutation = trpc.aiPractice.createScenario.useMutation();
  const sendMessageMutation = trpc.aiPractice.sendMessage.useMutation();
  const completeScenarioMutation = trpc.aiPractice.completeScenario.useMutation();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [setLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const handleCreateScenario = async (difficulty?: "easy" | "medium" | "hard") => {
    if (!currentUser) return;

    setIsGenerating(true);
    try {
      const result = await createScenarioMutation.mutateAsync({
        userId: currentUser.id,
        difficulty,
      });

      await refetchScenarios();
      
      // Load the new scenario
      const newScenario = scenarios?.find((s) => s.id === result.scenarioId);
      if (newScenario) {
        setCurrentScenario(newScenario);
      }

      toast.success("New practice scenario generated!", {
        description: "Start practicing by sending a message.",
      });
    } catch (error: any) {
      toast.error("Failed to generate scenario", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentScenario) return;

    const userMessage = message;
    setMessage("");

    try {
      await sendMessageMutation.mutateAsync({
        scenarioId: currentScenario.id,
        message: userMessage,
      });

      await refetchConversations();
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleCompleteScenario = async (score: number) => {
    if (!currentScenario) return;

    try {
      const result = await completeScenarioMutation.mutateAsync({
        scenarioId: currentScenario.id,
        score,
      });

      toast.success("Scenario completed!", {
        description: `You earned ${result.creditsEarned} credits!`,
      });

      await refetchScenarios();
      setCurrentScenario(null);
    } catch (error: any) {
      toast.error("Failed to complete scenario", {
        description: error.message || "Please try again.",
      });
    }
  };

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
            <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Practice Mode
          </h2>
          <p className="text-lg text-muted-foreground">
            Practice with AI-generated case scenarios tailored to your learning needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Weak Areas */}
            {weakAreas && weakAreas.length > 0 && (
              <Card className="p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  Areas to Improve
                </h3>
                <div className="space-y-2">
                  {weakAreas.slice(0, 3).map((area) => (
                    <div key={area.id} className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold text-sm">{area.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {area.incorrectCount} / {area.totalAttempts} incorrect
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Create New Scenario */}
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-3">Start New Practice</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleCreateScenario("easy")}
                  disabled={isGenerating}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Easy Scenario
                </Button>
                <Button
                  onClick={() => handleCreateScenario("medium")}
                  disabled={isGenerating}
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  Medium Scenario
                </Button>
                <Button
                  onClick={() => handleCreateScenario("hard")}
                  disabled={isGenerating}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  Hard Scenario
                </Button>
              </div>
              {isGenerating && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating scenario...
                </div>
              )}
            </Card>

            {/* Previous Scenarios */}
            {scenarios && scenarios.length > 0 && (
              <Card className="p-4">
                <h3 className="font-bold text-lg mb-3">Recent Scenarios</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scenarios.slice(0, 10).map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setCurrentScenario(scenario)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        currentScenario?.id === scenario.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={scenario.completed ? "default" : "outline"} className="text-xs">
                          {scenario.difficulty}
                        </Badge>
                        {scenario.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-xs line-clamp-2">{scenario.scenario}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scenario.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {currentScenario ? (
              <Card className="h-[calc(100vh-300px)] flex flex-col">
                {/* Scenario Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">Practice Scenario</h3>
                    <div className="flex items-center gap-2">
                      <Badge>{currentScenario.difficulty}</Badge>
                      {currentScenario.targetWeakArea && (
                        <Badge variant="outline">Focus: {currentScenario.targetWeakArea}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{currentScenario.scenario}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversations && conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`flex gap-3 ${conv.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {conv.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            conv.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            <Streamdown>{conv.message}</Streamdown>
                          </div>
                        </div>
                        {conv.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-secondary-foreground" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Start the conversation by sending a message below</p>
                    </div>
                  )}
                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  {!currentScenario.completed ? (
                    <>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                          placeholder="Type your response..."
                          disabled={sendMessageMutation.isPending}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Practice as much as you need. The AI will provide feedback and guidance.
                      </p>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        Scenario Completed!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Score: {currentScenario.score} points
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-300px)] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No Active Scenario</h3>
                  <p className="mb-4">Create a new practice scenario to get started</p>
                  <Button onClick={() => handleCreateScenario("medium")} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Scenario"
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
