import { useListCourses, useListEnrollments, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TrainerDashboardPage() {
  const { data: user } = useGetMe();
  const { data: courses, isLoading: coursesLoading } = useListCourses();
  const { data: enrollments, isLoading: enrollmentsLoading } = useListEnrollments();

  const myCourses = courses?.filter(c => c.trainerId === user?.id) || [];
  const myCourseIds = new Set(myCourses.map(c => c.id));
  const myStudentsCount = enrollments?.filter(e => myCourseIds.has(e.courseId)).length || 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Trainer Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}. Here's your class summary.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm hover-elevate transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">My Courses</p>
              {coursesLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{myCourses.length}</p>}
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover-elevate transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Students Enrolled</p>
              {enrollmentsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{myStudentsCount}</p>}
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
