import { useGetDashboardStats, useGetRecentEnquiries } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, MessageSquare, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentEnquiries, isLoading: enquiriesLoading } = useGetRecentEnquiries();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at SkillUp today.</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={Users}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            title="Total Trainers"
            value={stats?.totalTrainers || 0}
            icon={Users}
            color="text-secondary"
            bgColor="bg-secondary/10"
          />
          <StatCard
            title="Active Courses"
            value={stats?.totalCourses || 0}
            icon={BookOpen}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            title="Total Enrollments"
            value={stats?.totalEnrollments || 0}
            icon={GraduationCap}
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <StatCard
            title="Total Enquiries"
            value={stats?.totalEnquiries || 0}
            icon={MessageSquare}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            title="New Enquiries"
            value={stats?.newEnquiries || 0}
            icon={AlertCircle}
            color="text-destructive"
            bgColor="bg-destructive/10"
          />
        </div>
      )}

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="text-lg">Recent Enquiries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {enquiriesLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnquiries?.length ? (
                  recentEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{enquiry.fullName}</TableCell>
                      <TableCell>{enquiry.course}</TableCell>
                      <TableCell>
                        <div className="text-sm">{enquiry.phone}</div>
                        <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={enquiry.status === "new" ? "destructive" : "secondary"}>
                          {enquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No recent enquiries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-sm hover-elevate transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
