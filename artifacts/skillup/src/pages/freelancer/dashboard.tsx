import { useListProjects, useGetMyBids } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Briefcase, Send, CheckCircle, Clock, TrendingUp, ArrowRight } from "lucide-react";

export function FreelancerDashboardPage() {
  const { user } = useAuth();
  const { data: projects } = useListProjects();
  const { data: myBids } = useGetMyBids();

  const openProjects = projects?.filter(p => p.status === "open") ?? [];
  const pendingBids = myBids?.filter(b => b.status === "pending") ?? [];
  const acceptedBids = myBids?.filter(b => b.status === "accepted") ?? [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Find projects, submit bids, and grow your freelance career.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Projects", value: openProjects.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "My Bids", value: myBids?.length ?? 0, icon: Send, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Accepted Bids", value: acceptedBids.length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Review", value: pendingBids.length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest open projects */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> New Projects
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/freelancer/projects">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {openProjects.slice(0, 4).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open projects right now.</p>
            ) : openProjects.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.bidCount} bids</p>
                </div>
                {p.budgetMax && (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
                    ₹{p.budgetMax.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* My recent bids */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" /> My Recent Bids
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/freelancer/my-bids">View all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(myBids ?? []).slice(0, 4).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">You haven't placed any bids yet.</p>
            ) : (myBids ?? []).slice(0, 4).map(b => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.projectTitle}</p>
                  <p className="text-xs text-muted-foreground">₹{b.amount.toLocaleString()}</p>
                </div>
                <Badge variant={b.status === "accepted" ? "default" : b.status === "rejected" ? "destructive" : "secondary"} className="capitalize text-xs">
                  {b.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/freelancer/projects">Browse Projects</Link></Button>
        <Button variant="outline" asChild><Link href="/freelancer/profile">Complete Profile</Link></Button>
        <Button variant="outline" asChild><Link href="/freelancer/bank-details">Bank Details</Link></Button>
      </div>
    </div>
  );
}
