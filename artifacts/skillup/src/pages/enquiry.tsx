import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitEnquiry } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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
      
      // Open WhatsApp in a new tab
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error?.message || "There was an error submitting your enquiry.",
      });
    }
  };

  return (
    <div className="flex-1 py-12 px-4 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Home
          </Link>
        </div>
        
        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-2 pb-8 border-b border-border/50">
            <CardTitle className="text-3xl font-bold tracking-tight text-primary">Enquire Now</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Fill out the form below and our team will get in touch with you via WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
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
                          <Input type="tel" placeholder="+1 (555) 000-0000" className="h-11" {...field} />
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
                          <Input type="tel" placeholder="+1 (555) 000-0000" className="h-11" {...field} />
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
                      <FormLabel>Interested Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Python Programming">Python Programming</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Data Entry">Data Entry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Submitting..." : "Submit Enquiry"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
