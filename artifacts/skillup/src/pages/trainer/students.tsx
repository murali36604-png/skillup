import { useListCourses, useListEnrollments, useListUsers, useGetMe } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TrainerStudentsPage() {
  const { data: user } = useGetMe();
  const { data: courses, isLoading: coursesLoading } = useListCourses();
  const { data: enrollments, isLoading: enrollmentsLoading } = useListEnrollments();
  const { data: users, isLoading: usersLoading } = useListUsers();

  const isLoading = coursesLoading || enrollmentsLoading || usersLoading;

  // Get courses taught by this trainer
  const myCourses = courses?.filter(c => c.trainerId === user?.id) || [];
  const myCourseIds = new Set(myCourses.map(c => c.id));
  
  // Get enrollments for those courses
  const myEnrollments = enrollments?.filter(e => myCourseIds.has(e.courseId)) || [];
  
  // Build a list of students mapped to their courses
  const studentMap = new Map(users?.map(u => [u.id, u]) || []);
  
  const studentRows = myEnrollments.map(e => ({
    enrollmentId: e.id,
    course: myCourses.find(c => c.id === e.courseId),
    student: studentMap.get(e.userId),
    enrolledAt: e.enrolledAt,
  })).filter(r => r.student);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Students</h1>
        <p className="text-muted-foreground">View students enrolled in your courses.</p>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Enrolled Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : studentRows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No students enrolled in your courses.</TableCell></TableRow>
            ) : (
              studentRows.map((row) => (
                <TableRow key={row.enrollmentId}>
                  <TableCell className="font-medium">{row.student?.name}</TableCell>
                  <TableCell>{row.student?.email}</TableCell>
                  <TableCell>{row.course?.title}</TableCell>
                  <TableCell>{new Date(row.enrolledAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
