import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trophy, Crown, Medal, Sparkles, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Leaderboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: leaderboard, isLoading } = trpc.leaderboard.get.useQuery({ limit: 50 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const userRank = leaderboard?.findIndex((entry) => entry.id === user?.id);
  const userPosition = userRank !== undefined && userRank >= 0 ? userRank + 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
            </div>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Position Card */}
        {isAuthenticated && userPosition && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Your Position</p>
                <p className="text-4xl font-bold">#{userPosition}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Your Credits</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  <p className="text-3xl font-bold">{user?.totalCredits || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-12">
              <Card className="w-full p-6 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center -mt-16 border-4 border-white shadow-lg">
                  <Medal className="w-10 h-10 text-gray-600" fill="currentColor" />
                </div>
                <p className="text-3xl font-bold text-gray-700 mb-2">2nd</p>
                <p className="font-semibold text-gray-800 text-lg mb-2">{leaderboard[1].name || "Anonymous"}</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-800">{leaderboard[1].totalCredits}</span>
                </div>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Card className="w-full p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center -mt-20 border-4 border-white shadow-xl">
                  <Crown className="w-12 h-12 text-yellow-600" fill="currentColor" />
                </div>
                <p className="text-4xl font-bold text-yellow-700 mb-2">1st</p>
                <p className="font-semibold text-gray-800 text-xl mb-2">{leaderboard[0].name || "Anonymous"}</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <span className="text-3xl font-bold text-gray-800">{leaderboard[0].totalCredits}</span>
                </div>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-16">
              <Card className="w-full p-6 bg-gradient-to-br from-orange-100 to-amber-100 border-4 border-orange-400 text-center">
                <div className="w-18 h-18 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center -mt-14 border-4 border-white shadow-lg">
                  <Trophy className="w-9 h-9 text-orange-600" fill="currentColor" />
                </div>
                <p className="text-2xl font-bold text-orange-700 mb-2">3rd</p>
                <p className="font-semibold text-gray-800 mb-2">{leaderboard[2].name || "Anonymous"}</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-gray-800">{leaderboard[2].totalCredits}</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Rankings</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard?.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    entry.id === user?.id
                      ? "bg-purple-100 border-2 border-purple-400"
                      : index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {index === 0 ? (
                      <Crown className="w-8 h-8 text-yellow-500" fill="currentColor" />
                    ) : index === 1 ? (
                      <Medal className="w-7 h-7 text-gray-500" fill="currentColor" />
                    ) : index === 2 ? (
                      <Trophy className="w-6 h-6 text-orange-600" fill="currentColor" />
                    ) : (
                      <span className="text-xl font-bold text-gray-600">#{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {entry.name || "Anonymous"}
                      {entry.id === user?.id && (
                        <span className="ml-2 text-sm text-purple-600">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="text-xl font-bold text-gray-800">{entry.totalCredits}</span>
                    <span className="text-sm text-gray-600">credits</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
