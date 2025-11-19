import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { SimpleUser } from "../../../drizzle/schema";

type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  difficulty?: string;
  category?: string | null;
};

type Answer = "A" | "B" | "C" | "D";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ questionId: number; userAnswer: Answer }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: questionsData, isLoading: loadingQuestions } = trpc.quiz.getQuestions.useQuery(
    { limit: 10 },
    { enabled: !!currentUser }
  );
  
  const submitMutation = trpc.quiz.submitAttempt.useMutation();

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [setLocation]);

  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData as QuizQuestion[]);
    }
  }, [questionsData]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: Answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    // Save answer
    setUserAnswers([
      ...userAnswers,
      { questionId: currentQuestion.id, userAnswer: selectedAnswer },
    ]);

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Submit quiz
      handleSubmitQuiz([
        ...userAnswers,
        { questionId: currentQuestion.id, userAnswer: selectedAnswer },
      ]);
    }
  };

  const handleSubmitQuiz = async (answers: { questionId: number; userAnswer: Answer }[]) => {
    if (!currentUser) return;

    try {
      const result = await submitMutation.mutateAsync({
        userId: currentUser.id,
        answers,
      });
      
      setQuizResult(result);
      setQuizCompleted(true);
      
      // Update user credits in localStorage
      const updatedUser = { ...currentUser, credits: currentUser.credits + result.creditsEarned };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  const handlePlayAgain = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setQuizCompleted(false);
    setQuizResult(null);
    setLocation("/dashboard");
  };

  if (!currentUser) return null;

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted && quizResult) {
    return <QuizResults result={quizResult} onPlayAgain={handlePlayAgain} />;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No questions available</p>
          <Button onClick={() => setLocation("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const optionColors = {
    A: "from-[oklch(0.82_0.15_85)] to-[oklch(0.75_0.12_85)]", // Yellow
    B: "from-[oklch(0.63_0.21_260)] to-[oklch(0.55_0.18_260)]", // Blue
    C: "from-[oklch(0.62_0.23_25)] to-[oklch(0.55_0.20_25)]", // Red/Coral
    D: "from-[oklch(0.58_0.24_290)] to-[oklch(0.50_0.20_290)]", // Purple
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.58_0.24_290)] via-[oklch(0.50_0.20_290)] to-[oklch(0.45_0.18_280)] relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-secondary/20 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-destructive/20 blur-2xl"></div>
      
      {/* Abstract decorative elements */}
      <svg className="absolute top-20 right-20 w-24 h-24 text-white/20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10,5" />
      </svg>
      <svg className="absolute bottom-32 left-32 w-32 h-32 text-white/20" viewBox="0 0 100 100">
        <path d="M 10 50 L 90 50 M 50 10 L 50 90" stroke="currentColor" strokeWidth="3" />
        <path d="M 20 20 L 80 80 M 80 20 L 20 80" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Progress bar */}
        <div className="w-full max-w-3xl mb-8">
          <div className="flex justify-between items-center mb-2 text-white">
            <span className="text-sm font-medium">Question {currentQuestionIndex + 1}/{questions.length}</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-secondary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        <Card className="w-full max-w-3xl p-8 md:p-12 bg-white/95 backdrop-blur-sm shadow-2xl animate-slide-in">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              {currentQuestion.question}
            </h2>
            {currentQuestion.category && (
              <p className="text-center text-sm text-muted-foreground">
                Category: {currentQuestion.category}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-4 mb-8">
            {(["A", "B", "C", "D"] as Answer[]).map((option) => {
              const optionText = currentQuestion[`option${option}` as keyof QuizQuestion] as string;
              const isSelected = selectedAnswer === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`quiz-option p-6 rounded-xl text-left transition-all ${
                    isSelected
                      ? "ring-4 ring-primary ring-offset-2 scale-105"
                      : "hover:scale-102"
                  } bg-gradient-to-r ${optionColors[option]} text-white shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {option}
                    </div>
                    <p className="text-lg font-medium">{optionText}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer || submitMutation.isPending}
            className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : currentQuestionIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              "Finish Quiz"
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function QuizResults({ result, onPlayAgain }: { result: any; onPlayAgain: () => void }) {
  const percentage = (result.score / result.totalQuestions) * 100;
  const passed = percentage >= 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.82_0.15_85)] via-[oklch(0.75_0.12_85)] to-[oklch(0.70_0.10_80)] relative overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-success/20 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      
      {/* Abstract shapes */}
      <svg className="absolute top-20 right-20 w-32 h-32 text-white/30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-32 left-32 w-40 h-40 text-white/30" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="3" />
        <polygon points="50,30 70,70 30,70" fill="currentColor" />
      </svg>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-12 bg-white/95 backdrop-blur-sm shadow-2xl text-center animate-slide-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {passed ? "Bravo! You have Scored" : "Quiz Completed!"}
          </h2>

          {/* Score display */}
          <div className="my-12">
            <div className="text-8xl md:text-9xl font-black text-primary mb-4">
              {result.score}
              <span className="text-5xl md:text-6xl text-muted-foreground">/{result.totalQuestions}</span>
            </div>
            <div className="text-2xl text-muted-foreground mb-6">
              {percentage.toFixed(0)}% Correct
            </div>
            <div className="inline-flex items-center gap-2 bg-secondary/20 px-6 py-3 rounded-full">
              <span className="text-xl font-semibold text-foreground">
                +{result.creditsEarned} Credits Earned! 🎉
              </span>
            </div>
          </div>

          {/* Feedback section */}
          {result.feedback && result.feedback.length > 0 && (
            <div className="mb-8 text-left">
              <h3 className="text-2xl font-bold text-foreground mb-4">Review Your Answers</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {result.feedback.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      item.isCorrect
                        ? "bg-success/10 border-success/30"
                        : "bg-destructive/10 border-destructive/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">{item.question}</p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={item.isCorrect ? "text-success font-semibold" : "text-destructive font-semibold"}>
                            {item.userAnswer}
                          </span>
                          {!item.isCorrect && (
                            <>
                              <span className="text-muted-foreground"> | Correct: </span>
                              <span className="text-success font-semibold">{item.correctAnswer}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="text-lg font-semibold px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
