import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Briefcase, Building2 } from "lucide-react";
import logo from "@assets/skill_up_logo_1780416699830.png";

const signupSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export function SignupPage() {
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      const user = await registerMutation.mutateAsync({ data: { ...values, role } });
      queryClient.setQueryData(getGetMeQueryKey(), user);
      toast({ title: "Account created!", description: `Welcome to SkillUp, ${user.name}!` });
      setLocation(`/${role}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration failed", description: error?.message || "Please try again." });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center">
              <img src={logo} alt="SkillUp" className="w-10 h-10 object-contain" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-primary">Join SkillUp</CardTitle>
              <CardDescription className="text-sm">Create your free account today</CardDescription>
            </div>

            <Tabs value={role} onValueChange={(v) => setRole(v as "freelancer" | "client")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="freelancer" className="gap-2">
                  <Briefcase className="w-4 h-4" /> Freelancer
                </TabsTrigger>
                <TabsTrigger value="client" className="gap-2">
                  <Building2 className="w-4 h-4" /> Client
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <p className="text-xs text-muted-foreground">
              {role === "freelancer"
                ? "Find projects, showcase your skills, and earn from anywhere."
                : "Post projects, hire top talent, and get work done fast."}
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Min. 6 characters" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl><Input type="tel" placeholder="+91 9000000000" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Creating account..." : `Sign Up as ${role === "freelancer" ? "Freelancer" : "Client"}`}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
