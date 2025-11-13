import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, BookOpen, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Courses() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const { data: courses, isLoading: coursesLoading } = trpc.courses.list.useQuery();
  const { data: modules } = trpc.courses.getModules.useQuery(
    { courseId: selectedCourse! },
    { enabled: !!selectedCourse }
  );
  const { data: enrollments } = trpc.courses.getEnrollments.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const enrollMutation = trpc.courses.enroll.useMutation({
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      trpc.useUtils().courses.getEnrollments.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getCourseImage = (code: string) => {
    // Map course codes to placeholder colors/gradients
    const colorMap: Record<string, string> = {
      "C&D-Year2": "from-purple-400 to-pink-400",
      "USI2001": "from-yellow-600 to-orange-600",
      "INF2004": "from-gray-700 to-gray-900",
      "INF2002": "from-yellow-400 to-yellow-500",
      "CSC3104": "from-blue-500 to-purple-600",
      "CSC3102A": "from-gray-400 to-gray-600",
      "CSC2101": "from-blue-600 to-cyan-500",
      "UDE2222": "from-orange-500 to-red-500",
      "CSC3102A-T3": "from-green-600 to-teal-600",
    };
    return colorMap[code] || "from-gray-400 to-gray-600";
  };

  const isEnrolled = (courseId: number) => {
    return enrollments?.some((e) => e.courseId === courseId);
  };

  const handleEnroll = (courseId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    enrollMutation.mutate({ courseId });
  };

  if (authLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Explore and enroll in courses to enhance your learning journey
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedCourse(course.id)}
            >
              {/* Course Image/Header */}
              <div
                className={`h-40 bg-gradient-to-br ${getCourseImage(
                  course.code
                )} flex items-center justify-center relative`}
              >
                <div className="absolute top-4 right-4">
                  {isEnrolled(course.id) && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>
                <BookOpen className="w-16 h-16 text-white/80" />
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    {course.code}
                  </Badge>
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                    {course.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {course.trimester} {course.year}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEnrolled(course.id)) {
                      setSelectedCourse(course.id);
                    } else {
                      handleEnroll(course.id);
                    }
                  }}
                  className="w-full"
                  variant={isEnrolled(course.id) ? "default" : "outline"}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : isEnrolled(course.id) ? (
                    <>
                      View Modules
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Course Detail Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {courses?.find((c) => c.id === selectedCourse)?.title}
              </DialogTitle>
              <DialogDescription>
                {courses?.find((c) => c.id === selectedCourse)?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Course Modules
              </h3>

              {!modules || modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No modules available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-700 font-semibold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{module.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{module.duration}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
              {!isEnrolled(selectedCourse!) && (
                <Button
                  onClick={() => {
                    handleEnroll(selectedCourse!);
                    setSelectedCourse(null);
                  }}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll in Course"
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
