import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Trophy, Star, X, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QuizResults() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/quiz/:id/results");
  const [showFeedback, setShowFeedback] = useState(true);
  
  // Get query params
  const searchParams = new URLSearchParams(window.location.search);
  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "10");
  const credits = parseInt(searchParams.get("credits") || "0");
  const quizId = params?.id ? parseInt(params.id) : null;

  const percentage = Math.round((score / total) * 100);

  // Fetch quiz attempt details for feedback
  const { data: quizHistory } = trpc.quiz.getHistory.useQuery();
  const latestAttempt = quizHistory?.[0]; // Most recent attempt

  // Fetch questions to show which ones were wrong
  const { data: questions } = trpc.quiz.getQuestions.useQuery(
    { quizId: quizId! },
    { enabled: !!quizId }
  );

  // Get incorrect questions (mock for now - would need to store user answers)
  const incorrectQuestions = questions?.filter((_, index) => {
    // This is a simplified version - in production, you'd compare with actual user answers
    return index >= score; // Assume first 'score' questions were correct
  });

  const hasIncorrectAnswers = score < total;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left blue blob */}
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse-slow" />
        
        {/* Top right green blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Bottom left orange blob */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Bottom right red blob */}
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Geometric shapes - scattered dots pattern */}
        <div className="absolute top-20 right-1/4">
          <div className="grid grid-cols-5 gap-3">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white opacity-40 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-32 left-1/4">
          <div className="grid grid-cols-5 gap-3">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white opacity-30 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Large decorative circles */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border-8 border-white opacity-20 rounded-full animate-float" />
        <div className="absolute bottom-1/3 right-16 w-24 h-24 bg-white opacity-15 rounded-full animate-float" style={{ animationDelay: '1s' }} />

        {/* Abstract shapes */}
        <svg className="absolute top-40 left-1/3 w-20 h-20 text-white opacity-20 animate-float" viewBox="0 0 100 100">
          <circle cx="30" cy="30" r="20" fill="currentColor" />
          <circle cx="70" cy="70" r="25" fill="currentColor" />
        </svg>

        <svg className="absolute bottom-1/4 right-1/3 w-24 h-24 text-white opacity-15 animate-float" style={{ animationDelay: '2s' }} viewBox="0 0 100 100">
          <path d="M 50 10 L 90 90 L 10 90 Z" fill="currentColor" />
        </svg>

        {/* Wavy lines */}
        <div className="absolute top-1/3 right-20 space-y-2 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 bg-white rounded-full" style={{ width: `${60 - i * 8}px` }} />
          ))}
        </div>

        {/* Star burst */}
        <div className="absolute top-1/2 left-1/4 opacity-25">
          <Star className="w-16 h-16 text-white animate-pulse" fill="white" />
        </div>

        <div className="absolute bottom-1/4 left-1/3 opacity-20">
          <Star className="w-12 h-12 text-white animate-pulse" fill="white" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Abstract curved shapes */}
        <svg className="absolute top-20 left-1/2 w-32 h-32 text-white opacity-15 animate-float" viewBox="0 0 100 100">
          <path d="M 10 50 Q 50 10, 90 50 T 10 50" fill="currentColor" />
        </svg>

        {/* Diagonal stripes pattern */}
        <div className="absolute bottom-40 right-1/4 w-32 h-32 opacity-10">
          <div className="space-y-2 rotate-45">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-1 bg-white" />
            ))}
          </div>
        </div>

        {/* Small scattered elements */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-white opacity-30 rounded-full" />
        <div className="absolute top-2/3 left-1/4 w-5 h-5 bg-white opacity-25 rounded-full" />
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-white opacity-35 rounded-full" />
        
        {/* Pink oval shape */}
        <div className="absolute bottom-20 left-20 w-40 h-24 bg-pink-400 opacity-40 rounded-full blur-xl transform -rotate-45" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl p-8 md:p-12 text-center">
          {/* Trophy Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Trophy className="w-20 h-20 text-yellow-500" fill="currentColor" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Bravo! You have Scored
          </h1>

          {/* Score */}
          <div className="my-10">
            <div className="text-8xl md:text-9xl font-bold text-gray-800">
              {score}
              <span className="text-gray-600">/</span>
              {total}
            </div>
            <div className="mt-4 text-2xl font-semibold text-gray-700">
              {percentage}% Correct
            </div>
          </div>

          {/* Credits Earned */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-green-600" />
              <p className="text-xl font-semibold text-green-800">
                You earned {credits} credits!
              </p>
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Action Text */}
          <p className="text-2xl font-semibold text-gray-700 mb-8">
            Wanna Play Again?
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="px-8 py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setLocation("/rewards")}
              className="px-8 py-6 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              View Rewards
            </Button>
          </div>
        </Card>
      </div>

      {/* Adaptive Feedback Dialog */}
      <Dialog open={showFeedback && hasIncorrectAnswers} onOpenChange={setShowFeedback}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Adaptive Feedback
            </DialogTitle>
            <DialogDescription>
              Here are the questions you got wrong. Review them to improve your understanding!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {incorrectQuestions?.map((question, index) => (
              <Card key={question.id} className="p-4 border-l-4 border-red-400">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-3">{question.questionText}</p>
                    
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((option) => {
                        const optionText = question[`option${option}` as keyof typeof question];
                        const isCorrect = question.correctAnswer === option;
                        
                        if (!optionText) return null;
                        
                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrect
                                ? "bg-green-50 border-green-400"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              <span className="font-semibold text-gray-700">{option}.</span>
                              <span className={isCorrect ? "text-green-800 font-medium" : "text-gray-700"}>
                                {String(optionText)}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto text-sm font-semibold text-green-600">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => setShowFeedback(false)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
