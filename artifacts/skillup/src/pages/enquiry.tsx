import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitEnquiry, useListCourses } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen } from "lucide-react";

const enquirySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().min(10, "Valid WhatsApp number is required"),
  course: z.string().min(1, "Please select a course"),
});

export function EnquiryPage() {
  const { toast } = useToast();
  const submitMutation = useSubmitEnquiry();
  const { data: courses, isLoading: coursesLoading } = useListCourses();

  const form = useForm<z.infer<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      whatsapp: "",
      course: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof enquirySchema>) => {
    try {
      const result = await submitMutation.mutateAsync({ data: values });
      toast({
        title: "Enquiry submitted successfully!",
        description: "Redirecting to WhatsApp...",
      });
      form.reset();

      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error?.message || "There was an error submitting your enquiry.",
      });
    }
  };

  // Group active courses by category
  const activeCourses = (courses || []).filter(c => c.status === "active");
  const grouped = activeCourses.reduce<Record<string, typeof activeCourses>>((acc, course) => {
    const cat = course.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {});
  const categories = Object.keys(grouped).sort();

  return (
    <div className="flex-1 py-12 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Home
          </Link>
        </div>

        {/* Header banner */}
        <div className="rounded-xl bg-primary text-primary-foreground px-8 py-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-semibold text-orange-300 uppercase tracking-widest">World-Trending Courses</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Enquire Now</h1>
            <p className="text-primary-foreground/70 text-sm">
              Choose from {activeCourses.length}+ industry-leading courses and our team will contact you on WhatsApp.
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-white/10">
            <BookOpen className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-2 pb-6 border-b border-border/50">
            <CardTitle className="text-xl font-bold text-primary">Your Details</CardTitle>
            <CardDescription>
              Fill out the form below and our team will get in touch with you via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+91 9000000000" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+91 9000000000" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Interested Course
                        {!coursesLoading && activeCourses.length > 0 && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {activeCourses.length} courses available
                          </Badge>
                        )}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {coursesLoading ? (
                            <SelectItem value="_loading" disabled>Loading courses...</SelectItem>
                          ) : categories.length === 0 ? (
                            <SelectItem value="_none" disabled>No courses available</SelectItem>
                          ) : (
                            categories.map(category => (
                              <SelectGroup key={category}>
                                <SelectLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5 bg-muted/50">
                                  {category}
                                </SelectLabel>
                                {grouped[category].map(course => (
                                  <SelectItem key={course.id} value={course.title}>
                                    {course.title}
                                    {course.duration && (
                                      <span className="ml-1 text-xs text-muted-foreground">· {course.duration}</span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Enquiry & Get WhatsApp Contact"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Course Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Badge key={cat} variant="outline" className="text-xs px-3 py-1 rounded-full border-primary/20 text-primary">
                  {cat} ({grouped[cat].length})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
