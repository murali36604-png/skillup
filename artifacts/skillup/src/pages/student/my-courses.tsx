import { useGetMyEnrollments } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function StudentMyCoursesPage() {
  const { data: enrollments, isLoading } = useGetMyEnrollments();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Enrollments</h1>
        <p className="text-muted-foreground">Courses you are currently learning.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)
        ) : enrollments?.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-muted/20">
            <h3 className="text-lg font-medium text-foreground mb-2">No active enrollments</h3>
            <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet.</p>
            <Link href="/student/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          enrollments?.map((enrollment) => (
            <Card key={enrollment.id} className="border-none shadow-md flex flex-col">
              <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                    {enrollment.course.category}
                  </Badge>
                  <BookOpen className="w-5 h-5 text-primary opacity-50" />
                </div>
                <CardTitle className="text-xl line-clamp-1">{enrollment.course.title}</CardTitle>
                <CardDescription className="flex items-center text-xs mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{enrollment.course.description}</p>
                {enrollment.course.trainerName && (
                  <p className="text-sm font-medium mt-4">Instructor: {enrollment.course.trainerName}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
