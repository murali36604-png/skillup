import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProject } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { PlusCircle } from "lucide-react";

const PROJECT_CATEGORIES = [
  "Web Development", "Mobile Development", "Data Science & AI", "Design & UI/UX",
  "Digital Marketing", "Content Writing", "Video & Animation", "Cybersecurity",
  "Cloud & DevOps", "Business & Finance", "Translation", "Data Entry", "Other"
];

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  category: z.string().min(1, "Please select a category"),
  skillsRequired: z.string().optional(),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  deadline: z.string().optional(),
});

export function ClientPostProjectPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateProject();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", description: "", category: "", skillsRequired: "", budgetMin: undefined, budgetMax: undefined, deadline: "" },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      await createMutation.mutateAsync({ data: values as any });
      toast({ title: "Project posted!", description: "Freelancers can now discover and bid on your project." });
      setLocation("/client/my-projects");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to post project", description: e.message });
    }
  };

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a Project</h1>
        <p className="text-muted-foreground">Describe your project clearly to attract the best freelancers.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Project Details</CardTitle>
          <CardDescription>The more detail you provide, the better quality bids you'll receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Project Title *</FormLabel>
                  <FormControl><Input placeholder="e.g. Build a responsive e-commerce website" className="h-11" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description *</FormLabel>
                  <FormControl><Textarea placeholder="Describe your project in detail — what you need, expected deliverables, and any technical requirements..." className="min-h-[140px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {PROJECT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="skillsRequired" render={({ field }) => (
                  <FormItem><FormLabel>Skills Required</FormLabel>
                    <FormControl><Input placeholder="React, Node.js, Figma..." className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="budgetMin" render={({ field }) => (
                  <FormItem><FormLabel>Min Budget (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 5000" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="budgetMax" render={({ field }) => (
                  <FormItem><FormLabel>Max Budget (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 15000" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deadline" render={({ field }) => (
                  <FormItem><FormLabel>Deadline</FormLabel>
                    <FormControl><Input placeholder="e.g. 2 weeks, 30 days" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  {createMutation.isPending ? "Posting..." : "Post Project"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setLocation("/client")}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
