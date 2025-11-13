import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Rocket, Book, Scissors, Apple, Globe } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}

        {/* Floating educational items */}
        <div className="absolute top-20 left-10 animate-float">
          <Rocket className="w-16 h-16 text-cyan-400 opacity-60" />
        </div>

        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '1s' }}>
          <Book className="w-14 h-14 text-purple-400 opacity-50" />
        </div>

        <div className="absolute bottom-32 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
          <Scissors className="w-12 h-12 text-yellow-400 opacity-60 rotate-45" />
        </div>

        <div className="absolute bottom-40 right-1/3 animate-float" style={{ animationDelay: '1.5s' }}>
          <Apple className="w-14 h-14 text-red-400 opacity-50" />
        </div>

        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '0.5s' }}>
          <Globe className="w-20 h-20 text-blue-400 opacity-40" />
        </div>

        {/* Planets/Circles */}
        <div className="absolute top-1/4 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 opacity-25 animate-pulse-slow" style={{ animationDelay: '1s' }} />

        {/* Decorative lines */}
        <svg className="absolute top-1/2 left-1/4 w-32 h-32 text-white opacity-10" viewBox="0 0 100 100">
          <path d="M 10 50 L 90 50 M 50 10 L 50 90" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* Leaves/Plants at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-900/40 to-transparent">
          <div className="absolute bottom-0 left-10 w-16 h-24 bg-green-600 opacity-60 rounded-t-full" />
          <div className="absolute bottom-0 left-28 w-12 h-20 bg-green-500 opacity-50 rounded-t-full" />
          <div className="absolute bottom-0 right-20 w-20 h-28 bg-green-600 opacity-60 rounded-t-full" />
          <div className="absolute bottom-0 right-44 w-14 h-22 bg-green-500 opacity-50 rounded-t-full" />
        </div>

        {/* Pencil */}
        <div className="absolute top-1/2 right-32 w-4 h-32 bg-yellow-400 opacity-60 rotate-45 rounded-full" />
        <div className="absolute top-1/2 right-32 w-4 h-8 bg-orange-400 opacity-70 rotate-45 rounded-b-full" style={{ marginTop: '-2rem' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left side - Branding */}
          <div className="text-white space-y-6 text-center lg:text-left">
            <div className="inline-block">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Book className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-2">The Learning</h1>
              <h1 className="text-5xl font-bold mb-4">Platform</h1>
            </div>
            <p className="text-xl text-blue-200">
              Engage, learn, and earn rewards for your educational journey
            </p>
          </div>

          {/* Right side - Login Form */}
          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">The Learning Platform</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>No Account?</span>
                <a href={getLoginUrl()} className="text-blue-600 hover:underline font-medium">
                  Sign up
                </a>
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Enter your username or email address
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Username or email address"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Enter your Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="h-12"
                />
                <div className="text-right">
                  <a href="#" className="text-sm text-orange-600 hover:underline">
                    Forget Password?
                  </a>
                </div>
              </div>

              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg"
              >
                <a href={getLoginUrl()}>Sign in</a>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
