import { useGetMyProjects } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FolderOpen, Users, CheckCircle, PlusCircle, ArrowRight, Zap } from "lucide-react";

export function ClientDashboardPage() {
  const { user } = useAuth();
  const { data: projects } = useGetMyProjects();

  const openProjects = projects?.filter(p => p.status === "open") ?? [];
  const inProgress = projects?.filter(p => p.status === "in_progress") ?? [];
  const completed = projects?.filter(p => p.status === "completed") ?? [];
  const totalBids = projects?.reduce((sum, p) => sum + (p.bidCount ?? 0), 0) ?? 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your projects and hire top freelancers.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/client/post-project"><PlusCircle className="w-4 h-4" /> Post a Project</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Projects", value: openProjects.length, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "In Progress", value: inProgress.length, icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Bids Received", value: totalBids, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-none shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent projects */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/my-projects">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(projects ?? []).length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No projects yet. Post your first project to get started.</p>
              <Button asChild><Link href="/client/post-project">Post a Project</Link></Button>
            </div>
          ) : (projects ?? []).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.category} · {p.bidCount} bids received</p>
              </div>
              <Badge
                className={`text-xs capitalize ${p.status === "open" ? "bg-green-100 text-green-700" : p.status === "in_progress" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                variant="outline"
              >
                {p.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/client/post-project">Post New Project</Link></Button>
        <Button variant="outline" asChild><Link href="/client/my-projects">Manage Projects</Link></Button>
      </div>
    </div>
  );
}
