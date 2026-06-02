import { useListCourses, useCreateEnrollment, useGetMyEnrollments, getGetMyEnrollmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentCoursesPage() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useListCourses();
  const { data: myEnrollments, isLoading: enrollmentsLoading } = useGetMyEnrollments();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const enrollMutation = useCreateEnrollment();

  const activeCourses = courses?.filter(c => c.status === "active") || [];
  const enrolledCourseIds = new Set(myEnrollments?.map(e => e.courseId) || []);

  const handleEnroll = async (courseId: number) => {
    if (!user) return;
    try {
      await enrollMutation.mutateAsync({ data: { courseId, userId: user.id } });
      toast({ title: "Enrolled successfully!", description: "You can now view this in My Enrollments." });
      queryClient.invalidateQueries({ queryKey: getGetMyEnrollmentsQueryKey() });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment failed", description: error.message });
    }
  };

  const isLoading = coursesLoading || enrollmentsLoading;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Available Courses</h1>
        <p className="text-muted-foreground">Browse and enroll in active courses to level up your skills.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-[280px] w-full rounded-xl" />)
        ) : activeCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
            No active courses available right now. Check back later!
          </div>
        ) : (
          activeCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <Card key={course.id} className="border-none shadow-md hover-elevate transition-all duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {course.trainerName && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Instructor: {course.trainerName}
                    </div>
                  )}
                  {course.duration && (
                    <div className="text-sm font-medium bg-muted/50 inline-block px-2 py-1 rounded-md">
                      Duration: {course.duration}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isEnrolled ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Enrolled
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                    >
                      Enroll Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
