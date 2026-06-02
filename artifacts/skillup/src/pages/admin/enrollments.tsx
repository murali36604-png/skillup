import { useState } from "react";
import { useListEnrollments, useCreateEnrollment, useDeleteEnrollment, getListEnrollmentsQueryKey, useListUsers, useListCourses } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const enrollmentSchema = z.object({
  userId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
});

export function AdminEnrollmentsPage() {
  const { data: enrollments, isLoading } = useListEnrollments();
  const { data: users } = useListUsers();
  const { data: courses } = useListCourses();
  
  const students = users?.filter(u => u.role === "student") || [];
  const activeCourses = courses?.filter(c => c.status === "active") || [];
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateEnrollment();
  const deleteMutation = useDeleteEnrollment();

  const form = useForm<z.infer<typeof enrollmentSchema>>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { userId: "", courseId: "" },
  });

  const onSubmit = async (values: z.infer<typeof enrollmentSchema>) => {
    try {
      await createMutation.mutateAsync({ 
        data: { 
          userId: parseInt(values.userId, 10), 
          courseId: parseInt(values.courseId, 10) 
        } 
      });
      toast({ title: "Enrollment created successfully" });
      queryClient.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
      setIsCreateOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this enrollment?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListEnrollmentsQueryKey() });
        toast({ title: "Enrollment removed" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  // Create a map to quickly look up student names
  const studentMap = new Map(students.map(s => [s.id, s.name]));

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Enrollments</h1>
          <p className="text-muted-foreground">Manage student course enrollments.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Enrollment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Enrollment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="userId" render={({ field }) => (
                  <FormItem><FormLabel>Student</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="courseId" render={({ field }) => (
                  <FormItem><FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {activeCourses.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  Enroll Student
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : enrollments?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No enrollments found.</TableCell></TableRow>
            ) : (
              enrollments?.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{studentMap.get(enrollment.userId) || `Student #${enrollment.userId}`}</TableCell>
                  <TableCell>{enrollment.course.title}</TableCell>
                  <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(enrollment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
