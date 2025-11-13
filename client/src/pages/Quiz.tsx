import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:id");
  const [, setLocation] = useLocation();
  const quizId = params?.id ? parseInt(params.id) : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});

  const { data: isCompleted } = trpc.quiz.checkCompleted.useQuery(
    { quizId: quizId! },
    { enabled: !!quizId }
  );

  const { data: quiz, isLoading: quizLoading } = trpc.quiz.getById.useQuery(
    { quizId: quizId! },
    { enabled: !!quizId }
  );

  const { data: questions, isLoading: questionsLoading } = trpc.quiz.getQuestions.useQuery(
    { quizId: quizId! },
    { enabled: !!quizId }
  );

  const submitQuizMutation = trpc.quiz.submitQuiz.useMutation({
    onSuccess: (data) => {
      setLocation(`/quiz/${quizId}/results?score=${data.score}&total=${data.totalQuestions}&credits=${data.creditsEarned}`);
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (questions?.length ?? 0) - 1;

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit quiz
      if (!questions) return;
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id] || "A",
      }));
      submitQuizMutation.mutate({ quizId: quizId!, answers });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  if (!quizId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid quiz ID</p>
      </div>
    );
  }

  if (quizLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz not found</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Already Completed</h2>
          <p className="text-gray-600 mb-6">You have already completed this quiz. Each quiz can only be taken once.</p>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setLocation("/rewards")}
              variant="outline"
              className="flex-1"
            >
              View Rewards
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left blue blob */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" />
        
        {/* Top right pink blob */}
        <div className="absolute -top-10 right-0 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Bottom left yellow blob */}
        <div className="absolute bottom-0 -left-10 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Geometric shapes */}
        <svg className="absolute top-20 left-10 w-16 h-16 text-white opacity-20 animate-float" viewBox="0 0 100 100">
          <path d="M 10 50 L 50 10 L 90 50 L 50 90 Z" fill="currentColor" />
        </svg>

        <svg className="absolute top-40 right-20 w-12 h-12 text-white opacity-20 animate-float" style={{ animationDelay: '1s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>

        <svg className="absolute bottom-40 left-1/4 w-20 h-20 text-white opacity-15 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor" />
        </svg>

        <svg className="absolute top-1/3 right-1/4 w-24 h-24 text-white opacity-10 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 100 100">
          <path d="M 20 20 L 80 20 L 80 80 L 20 80 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>

        {/* Wavy lines */}
        <svg className="absolute top-1/4 left-20 w-32 h-8 text-white opacity-20" viewBox="0 0 100 20">
          <path d="M 0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Diagonal lines */}
        <div className="absolute top-32 right-40 w-16 h-1 bg-white opacity-20 rotate-45" />
        <div className="absolute top-36 right-44 w-12 h-1 bg-white opacity-20 rotate-45" />
        <div className="absolute bottom-1/3 left-1/3 w-20 h-1 bg-white opacity-15 -rotate-45" />

        {/* Circles */}
        <div className="absolute bottom-20 right-32 w-20 h-20 border-4 border-white opacity-20 rounded-full" />
        <div className="absolute top-1/2 left-16 w-8 h-8 bg-white opacity-25 rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-white opacity-30 rounded-full animate-pulse" />

        {/* Striped pattern */}
        <div className="absolute bottom-32 left-40 w-24 h-24 opacity-15">
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-0.5 bg-white" style={{ width: `${100 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold">{quiz.title}</h1>
        </div>

        {/* Quiz Card */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-sm shadow-2xl p-8 md:p-12">
            {/* Progress */}
            <div className="text-center mb-8">
              <p className="text-lg font-semibold text-purple-700">
                Question {currentQuestionIndex + 1}/{questions.length}
              </p>
            </div>

            {/* Question */}
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center leading-relaxed">
                {currentQuestion?.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-10">
              {["A", "B", "C", "D"].map((option) => {
                const optionKey = `option${option}` as keyof typeof currentQuestion;
                const optionText = String(currentQuestion?.[optionKey] || "");
                const isSelected = selectedAnswer === option;
                
                let bgColor = "bg-gray-100 hover:bg-gray-200";
                let textColor = "text-gray-800";
                let borderColor = "border-gray-300";
                
                if (isSelected) {
                  if (option === "A") {
                    bgColor = "bg-purple-100 border-purple-400";
                    textColor = "text-purple-900";
                    borderColor = "border-purple-400";
                  } else if (option === "B") {
                    bgColor = "bg-blue-100 border-blue-400";
                    textColor = "text-blue-900";
                    borderColor = "border-blue-400";
                  } else if (option === "C") {
                    bgColor = "bg-pink-100 border-pink-400";
                    textColor = "text-pink-900";
                    borderColor = "border-pink-400";
                  } else if (option === "D") {
                    bgColor = "bg-purple-100 border-purple-400";
                    textColor = "text-purple-900";
                    borderColor = "border-purple-400";
                  }
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswerSelect(option as "A" | "B" | "C" | "D")}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${bgColor} ${borderColor} ${textColor} text-left flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center font-bold text-lg">
                      {option}
                    </span>
                    <span className="font-medium">{optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || submitQuizMutation.isPending}
                className="px-12 py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitQuizMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : isLastQuestion ? (
                  "Submit"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
