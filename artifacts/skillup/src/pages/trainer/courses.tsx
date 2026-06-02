import { useState } from "react";
import { useListCourses, useCreateCourse, useUpdateCourse, getListCoursesQueryKey, useGetMe } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const courseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description is required"),
  category: z.string().min(2, "Category is required"),
  duration: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export function TrainerCoursesPage() {
  const { data: user } = useGetMe();
  const { data: courses, isLoading } = useListCourses();
  
  // Trainer only sees and edits their own courses
  const myCourses = courses?.filter(c => c.trainerId === user?.id) || [];
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: "", description: "", category: "", duration: "", status: "active" },
  });

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    try {
      const payload: any = {
        title: values.title,
        description: values.description,
        category: values.category,
        duration: values.duration || undefined,
        status: values.status,
        trainerId: user?.id,
      };

      if (editingCourse) {
        await updateMutation.mutateAsync({ id: editingCourse.id, data: payload });
        toast({ title: "Course updated successfully" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "Course created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      setIsCreateOpen(false);
      setEditingCourse(null);
      form.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    form.reset({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration || "",
      status: course.status,
    });
    setIsCreateOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Manage the courses you teach.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingCourse(null);
            form.reset({ title: "", description: "", category: "", duration: "", status: "active" });
          }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Course</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Course Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g. 12 Weeks" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="col-span-2"><FormLabel>Description</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCourse ? "Update Course" : "Create Course"}
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : myCourses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">You don't have any courses yet.</TableCell></TableRow>
            ) : (
              myCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.duration || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                      <Edit2 className="h-4 w-4" />
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
