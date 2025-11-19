import { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  LogOut,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { SimpleUser } from "../../../drizzle/schema";

export default function InteractiveVideo() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const videoId = parseInt(id || "0");

  const { data: video, isLoading } = trpc.video.getById.useQuery({ videoId });
  const { data: questions } = trpc.video.getQuizQuestions.useQuery({ videoId });
  const submitAnswerMutation = trpc.video.submitAnswer.useMutation();

  const DURATION = 60; // 60 seconds

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [setLocation]);

  // Animation loop for simulated video
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const newTime = prev + deltaTime;
        
        // Check if we should pause for a question
        if (questions && !showQuiz) {
          const questionAtCurrentTime = questions.find(
            (q: any) =>
              q.pauseTime <= newTime &&
              q.pauseTime > prev &&
              !completedQuestions.has(q.id)
          );

          if (questionAtCurrentTime) {
            setShowQuiz(true);
            setCurrentQuestion(questionAtCurrentTime);
            setIsPlaying(false);
            return questionAtCurrentTime.pauseTime;
          }
        }

        // End of video
        if (newTime >= DURATION) {
          setIsPlaying(false);
          handleVideoComplete();
          return DURATION;
        }

        return newTime;
      });

      animationFrameRef.current = requestAnimationFrame(animate) as unknown as number;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, questions, showQuiz, completedQuestions]);

  const handleVideoComplete = () => {
    if (!currentUser || !video) return;
    
    const allQuestionsCompleted = questions?.every((q: any) =>
      completedQuestions.has(q.id)
    );

    if (allQuestionsCompleted) {
      toast.success("Video completed!", {
        description: "You've answered all questions correctly!",
      });
      setTimeout(() => {
        setLocation("/video-library");
      }, 2000);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setCompletedQuestions(new Set());
    setShowQuiz(false);
    setCurrentQuestion(null);
    lastTimeRef.current = 0;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !currentUser) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttemptCount(attemptCount + 1);

    try {
      await submitAnswerMutation.mutateAsync({
        userId: currentUser.id,
        videoId,
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer as "A" | "B" | "C" | "D",
        isCorrect: correct ? 1 : 0,
        attemptCount: attemptCount + 1,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer. Please try again.");
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      const newCompleted = new Set(completedQuestions);
      newCompleted.add(currentQuestion.id);
      setCompletedQuestions(newCompleted);
      setShowQuiz(false);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setAttemptCount(0);
      setIsPlaying(true);
    } else {
      // Restart video to the beginning of the current section (20-second intervals)
      const sectionStart = Math.floor(currentQuestion.pauseTime / 20) * 20;
      setCurrentTime(sectionStart);
      setShowQuiz(false);
      setCurrentQuestion(null);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setAttemptCount(0);
      lastTimeRef.current = 0;
      
      toast.error("Incorrect answer!", {
        description: "Rewinding to the start of this section. Pay close attention and try again.",
      });
      
      // Auto-play after rewind
      setTimeout(() => {
        setIsPlaying(true);
      }, 500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    setLocation("/");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate gradient based on current time
  const getGradient = () => {
    const progress = currentTime / DURATION;
    const hue1 = (progress * 360) % 360;
    const hue2 = ((progress * 360) + 60) % 360;
    const hue3 = ((progress * 360) + 120) % 360;
    
    return `linear-gradient(135deg, 
      hsl(${hue1}, 70%, 60%) 0%, 
      hsl(${hue2}, 70%, 55%) 50%, 
      hsl(${hue3}, 70%, 60%) 100%)`;
  };

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Video not found</h3>
          <Button onClick={() => setLocation("/video-library")}>
            Back to Library
          </Button>
        </Card>
      </div>
    );
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/video-library")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
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
        <div className="max-w-5xl mx-auto">
          {/* Video Info */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">{video.title}</h2>
            <p className="text-lg text-muted-foreground">{video.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline">{video.category}</Badge>
              <Badge variant="outline">{video.difficulty}</Badge>
              <span className="text-sm text-muted-foreground">
                {completedQuestions.size} / {questions?.length || 0} questions completed
              </span>
            </div>
          </div>

          {/* Animated Gradient "Video" Player */}
          <Card className="overflow-hidden mb-6 relative">
            <div
              className="relative w-full aspect-video flex items-center justify-center transition-all duration-300"
              style={{ background: getGradient() }}
            >
              {/* Animated shapes */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute w-64 h-64 rounded-full opacity-30 blur-3xl"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                    left: `${20 + (currentTime / DURATION) * 60}%`,
                    top: `${30 + Math.sin(currentTime) * 20}%`,
                    transform: `scale(${1 + Math.sin(currentTime * 2) * 0.2})`,
                    transition: "all 0.3s ease",
                  }}
                />
                <div
                  className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                    right: `${10 + (currentTime / DURATION) * 40}%`,
                    bottom: `${20 + Math.cos(currentTime * 1.5) * 15}%`,
                    transform: `scale(${1 + Math.cos(currentTime * 1.5) * 0.3})`,
                  }}
                />
              </div>

              {/* Center text */}
              <div className="relative z-10 text-center text-white">
                <h3 className="text-4xl font-bold mb-2">{video.category}</h3>
                <p className="text-xl opacity-90">Interactive Learning Module</p>
              </div>

              {/* Play/Pause overlay */}
              {!isPlaying && !showQuiz && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-primary"
                  >
                    <Play className="w-10 h-10" />
                  </Button>
                </div>
              )}

              {/* Quiz Overlay - On top of video */}
              {showQuiz && currentQuestion && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
                  <Card className="max-w-lg w-full max-h-[85%] overflow-y-auto p-4 border-2 border-primary shadow-2xl">
                    <div className="text-center mb-4">
                      <Badge className="mb-4 bg-primary text-primary-foreground">
                        Question {(questions?.findIndex((q: any) => q.id === currentQuestion.id) ?? -1) + 1} of{" "}
                        {questions?.length ?? 0}
                      </Badge>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {currentQuestion.question}
                      </h3>
                      {currentQuestion.hintText && !showFeedback && (
                        <p className="text-sm text-muted-foreground italic">
                          💡 Hint: {currentQuestion.hintText}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {["A", "B", "C", "D"].map((option) => {
                        const optionText = currentQuestion[`option${option}`];
                        if (!optionText) return null;

                        const isSelected = selectedAnswer === option;
                        const isCorrectAnswer = option === currentQuestion.correctAnswer;
                        const showCorrect = showFeedback && isCorrectAnswer;
                        const showIncorrect = showFeedback && isSelected && !isCorrect;

                        return (
                          <Button
                            key={option}
                            onClick={() => !showFeedback && handleAnswerSelect(option)}
                            disabled={showFeedback}
                            className={`w-full justify-start text-left p-4 h-auto text-sm ${
                              showCorrect
                                ? "bg-green-500 hover:bg-green-500 text-white border-green-600"
                                : showIncorrect
                                ? "bg-red-500 hover:bg-red-500 text-white border-red-600"
                                : isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-accent"
                            }`}
                            variant={isSelected && !showFeedback ? "default" : "outline"}
                          >
                            <span className="font-bold mr-3">{option}.</span>
                            <span>{optionText}</span>
                            {showCorrect && <CheckCircle2 className="ml-auto w-5 h-5" />}
                            {showIncorrect && <XCircle className="ml-auto w-5 h-5" />}
                          </Button>
                        );
                      })}
                    </div>

                    {showFeedback && (
                      <Card
                        className={`p-3 mb-4 ${
                          isCorrect
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                            : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                          }`}
                        >
                          {isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback}
                        </p>
                      </Card>
                    )}

                    <div className="flex gap-3">
                      {!showFeedback ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!selectedAnswer}
                          className="flex-1 bg-primary hover:bg-primary/90"
                          size="lg"
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={handleContinue}
                          className="flex-1 bg-primary hover:bg-primary/90"
                          size="lg"
                        >
                          {isCorrect ? "Continue" : "Try Again"}
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-card p-4 border-t border-border">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayPause}
                  disabled={showQuiz}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <div 
                    className="relative h-2 bg-muted rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (showQuiz) return; // Don't allow scrubbing during quiz
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                      const newTime = percentage * DURATION;
                      setCurrentTime(newTime);
                      setIsPlaying(false);
                      lastTimeRef.current = 0;
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full bg-primary transition-all duration-100"
                      style={{ width: `${(currentTime / DURATION) * 100}%` }}
                    />
                    {/* Question markers */}
                    {questions?.map((q: any) => (
                      <div
                        key={q.id}
                        className={`absolute top-0 w-1 h-full ${
                          completedQuestions.has(q.id)
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ left: `${(q.pauseTime / DURATION) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {formatTime(currentTime)} / {formatTime(DURATION)}
                </span>
              </div>
            </div>
          </Card>

          {/* Removed separate quiz overlay - now inside video player */}
          {false && showQuiz && currentQuestion && (
            <Card className="p-8 border-2 border-primary shadow-2xl">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  Question {(questions?.findIndex((q: any) => q.id === currentQuestion.id) ?? -1) + 1} of{" "}
                  {questions?.length ?? 0}
                </Badge>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.hintText && !showFeedback && (
                  <p className="text-sm text-muted-foreground italic">
                    💡 Hint: {currentQuestion.hintText}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {["A", "B", "C", "D"].map((option) => {
                  const optionText = currentQuestion[`option${option}`];
                  if (!optionText) return null;

                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === currentQuestion.correctAnswer;
                  const showCorrect = showFeedback && isCorrectAnswer;
                  const showIncorrect = showFeedback && isSelected && !isCorrect;

                  return (
                    <Button
                      key={option}
                      onClick={() => !showFeedback && handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={`w-full justify-start text-left p-6 h-auto text-base ${
                        showCorrect
                          ? "bg-green-500 hover:bg-green-500 text-white border-green-600"
                          : showIncorrect
                          ? "bg-red-500 hover:bg-red-500 text-white border-red-600"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-accent"
                      }`}
                      variant={isSelected && !showFeedback ? "default" : "outline"}
                    >
                      <span className="font-bold mr-3">{option}.</span>
                      <span>{optionText}</span>
                      {showCorrect && <CheckCircle2 className="ml-auto w-5 h-5" />}
                      {showIncorrect && <XCircle className="ml-auto w-5 h-5" />}
                    </Button>
                  );
                })}
              </div>

              {showFeedback && (
                <Card
                  className={`p-4 mb-6 ${
                    isCorrect
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                    }`}
                  >
                    {isCorrect ? currentQuestion.correctFeedback : currentQuestion.incorrectFeedback}
                  </p>
                </Card>
              )}

              <div className="flex gap-3">
                {!showFeedback ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleContinue}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {isCorrect ? "Continue" : "Try Again"}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
