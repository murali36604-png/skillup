import { useGetMyEnrollments, useListLiveClasses, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Video, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function StudentDashboardPage() {
  const { data: user } = useGetMe();
  const { data: enrollments, isLoading: enrollmentsLoading } = useGetMyEnrollments();
  const { data: liveClasses, isLoading: liveClassesLoading } = useListLiveClasses();

  // Upcoming live classes
  const now = new Date();
  const upcomingClasses = liveClasses
    ?.filter(c => new Date(c.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 2) || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Ready to continue your learning journey?</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm hover-elevate transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">My Enrolled Courses</p>
                {enrollmentsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{enrollments?.length || 0}</p>}
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Link href="/student/my-courses">
              <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">View Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover-elevate transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Available Live Classes</p>
                {liveClassesLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{liveClasses?.length || 0}</p>}
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-secondary/10">
                <Video className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <Link href="/student/live-classes">
              <Button variant="outline" className="w-full text-secondary border-secondary/20 hover:bg-secondary/5">View Schedule</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liveClassesLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : upcomingClasses.length === 0 ? (
            <Card className="border-dashed bg-transparent shadow-none">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <p>No upcoming live classes scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingClasses.map((cls) => (
              <Card key={cls.id} className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{cls.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1 text-sm text-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {new Date(cls.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/student/live-classes">
                    <Button variant="secondary" size="sm" className="w-full">Join Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
