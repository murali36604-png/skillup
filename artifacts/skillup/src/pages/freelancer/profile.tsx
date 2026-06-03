import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetFreelancerProfile, useUpsertFreelancerProfile } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Link as LinkIcon, IndianRupee } from "lucide-react";

const profileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  location: z.string().optional(),
  portfolioUrl: z.string().optional(),
  availability: z.enum(["available", "busy", "unavailable"]).optional(),
});

export function FreelancerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetFreelancerProfile();
  const updateMutation = useUpsertFreelancerProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { title: "", bio: "", skills: "", hourlyRate: undefined, location: "", portfolioUrl: "", availability: "available" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        title: profile.title ?? "",
        bio: profile.bio ?? "",
        skills: profile.skills ?? "",
        hourlyRate: profile.hourlyRate ?? undefined,
        location: profile.location ?? "",
        portfolioUrl: profile.portfolioUrl ?? "",
        availability: (profile.availability as any) ?? "available",
      });
    }
  }, [profile]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateMutation.mutateAsync({ data: values as any });
      toast({ title: "Profile updated successfully!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update failed", description: e.message });
    }
  };

  const skillsList = (profile?.skills ?? "").split(",").map(s => s.trim()).filter(Boolean);
  const availColor = { available: "bg-green-100 text-green-700", busy: "bg-yellow-100 text-yellow-700", unavailable: "bg-red-100 text-red-700" };

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">A strong profile helps clients find and trust you.</p>
      </div>

      {/* Profile preview */}
      {profile && (
        <Card className="border-none bg-gradient-to-r from-primary/5 to-orange-50 shadow-sm">
          <CardContent className="pt-6 flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              {profile.title && <p className="text-muted-foreground text-sm">{profile.title}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.hourlyRate && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{profile.hourlyRate}/hr</span>}
                {profile.availability && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${availColor[profile.availability as keyof typeof availColor]}`}>{profile.availability}</span>}
              </div>
              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {skillsList.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Edit Profile</CardTitle>
          <CardDescription>This is visible to clients browsing freelancers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Professional Title</FormLabel>
                  <FormControl><Input placeholder="e.g. Full Stack Developer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem><FormLabel>Bio</FormLabel>
                  <FormControl><Textarea placeholder="Describe your experience, expertise and what you can offer..." className="min-h-[100px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem><FormLabel>Skills (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="React, Node.js, Python, UI/UX..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                  <FormItem><FormLabel>Hourly Rate (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 500" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="e.g. Chennai, India" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="portfolioUrl" render={({ field }) => (
                <FormItem><FormLabel>Portfolio URL</FormLabel>
                  <FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="availability" render={({ field }) => (
                <FormItem><FormLabel>Availability</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available for work</SelectItem>
                      <SelectItem value="busy">Busy – Limited availability</SelectItem>
                      <SelectItem value="unavailable">Not available</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
