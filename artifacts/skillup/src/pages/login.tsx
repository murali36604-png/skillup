import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";
import logo from "@assets/skill_up_logo_1780416699830.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const accessDenied = params.get("error") === "access_denied";

  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const user = await loginMutation.mutateAsync({ data: values });
      queryClient.setQueryData(getGetMeQueryKey(), user);

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });

      setLocation(`/${user.role}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error?.message || "Please check your credentials and try again.",
      });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {accessDenied && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <ShieldX className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Access Denied: Only Admin can register users. Please log in with an Admin account to continue.
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-none">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center">
              <img src={logo} alt="SkillUp" className="w-10 h-10 object-contain" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-primary">Welcome Back</CardTitle>
              <CardDescription className="text-base">Sign in to your SkillUp account</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
