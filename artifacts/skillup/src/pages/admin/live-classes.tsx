import { useState } from "react";
import { useListLiveClasses, useCreateLiveClass, useDeleteLiveClass, getListLiveClassesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinClassButton } from "@/components/jitsi-meet";

const liveClassSchema = z.object({
  title: z.string().min(2, "Title is required"),
  roomName: z.string().min(3, "Room name is required").regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores allowed"),
  scheduledAt: z.string().min(1, "Schedule time is required"),
  description: z.string().optional(),
});

export function AdminLiveClassesPage() {
  const { data: classes, isLoading } = useListLiveClasses();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateLiveClass();
  const deleteMutation = useDeleteLiveClass();

  const form = useForm<z.infer<typeof liveClassSchema>>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: { title: "", roomName: "", scheduledAt: "", description: "" },
  });

  const onSubmit = async (values: z.infer<typeof liveClassSchema>) => {
    try {
      await createMutation.mutateAsync({ data: values });
      toast({ title: "Live class scheduled successfully" });
      queryClient.invalidateQueries({ queryKey: getListLiveClassesQueryKey() });
      setIsCreateOpen(false);
      form.reset();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to cancel this live class?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getListLiveClassesQueryKey() });
        toast({ title: "Live class cancelled" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Classes</h1>
          <p className="text-muted-foreground">Schedule and manage virtual classrooms via Jitsi Meet.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Schedule Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Live Class</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Class Title</FormLabel><FormControl><Input placeholder="e.g. Intro to React" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="roomName" render={({ field }) => (
                  <FormItem><FormLabel>Jitsi Room Name (Unique ID)</FormLabel><FormControl><Input placeholder="e.g. skillup-react-101" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="scheduledAt" render={({ field }) => (
                  <FormItem><FormLabel>Scheduled Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  Schedule Class
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
              <TableHead>Class Info</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Room Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : classes?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24">No live classes scheduled.</TableCell></TableRow>
            ) : (
              classes?.map((liveClass) => {
                const date = new Date(liveClass.scheduledAt);
                return (
                  <TableRow key={liveClass.id}>
                    <TableCell>
                      <div className="font-medium text-base">{liveClass.title}</div>
                      {liveClass.description && <div className="text-sm text-muted-foreground line-clamp-1">{liveClass.description}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm mb-1">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{liveClass.roomName}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <JoinClassButton roomName={liveClass.roomName} />
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(liveClass.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
