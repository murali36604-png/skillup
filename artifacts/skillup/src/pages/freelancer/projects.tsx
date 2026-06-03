import { useState } from "react";
import { useListProjects, useSubmitBid } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListProjectsQueryKey } from "@workspace/api-client-react";
import { Search, MapPin, Clock, IndianRupee, Users } from "lucide-react";

export function FreelancerProjectsPage() {
  const { data: projects, isLoading } = useListProjects();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [biddingProject, setBiddingProject] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidDuration, setBidDuration] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const bidMutation = useSubmitBid();

  const filtered = (projects ?? []).filter(p =>
    p.status === "open" &&
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.skillsRequired ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
    const cat = p.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const handleBidSubmit = async () => {
    if (!bidAmount || !biddingProject) return;
    try {
      await bidMutation.mutateAsync({ id: biddingProject.id, data: { amount: Number(bidAmount), duration: bidDuration || undefined, coverLetter: coverLetter || undefined } });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Bid submitted!", description: `Your bid of ₹${Number(bidAmount).toLocaleString()} has been sent.` });
      setBiddingProject(null);
      setBidAmount(""); setBidDuration(""); setCoverLetter("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Bid failed", description: e.message });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Projects</h1>
        <p className="text-muted-foreground">Find projects matching your skills and submit your best bid.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title, category, or skills..." className="pl-9 h-11" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} open projects found</p>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No projects found matching your search.</div>
      ) : (
        Object.entries(grouped).sort().map(([cat, items]) => (
          <div key={cat} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-5 h-px bg-muted-foreground/30 block" />{cat}<span className="flex-1 h-px bg-muted-foreground/30 block" />
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {items.map(project => (
                <Card key={project.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
                      <Badge variant="outline" className="text-xs shrink-0 border-green-300 text-green-700 bg-green-50">Open</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Posted by {project.clientName}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                    {project.skillsRequired && (
                      <div className="flex flex-wrap gap-1">
                        {project.skillsRequired.split(",").map(s => (
                          <span key={s} className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full border border-primary/10">{s.trim()}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {(project.budgetMin || project.budgetMax) && (
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {project.budgetMin && project.budgetMax
                            ? `${project.budgetMin.toLocaleString()} – ${project.budgetMax.toLocaleString()}`
                            : (project.budgetMax || project.budgetMin)?.toLocaleString()}
                        </span>
                      )}
                      {project.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.deadline}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.bidCount} bids</span>
                    </div>

                    <Button size="sm" className="w-full" onClick={() => setBiddingProject(project)}>
                      Place Bid
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Bid Dialog */}
      <Dialog open={!!biddingProject} onOpenChange={open => { if (!open) setBiddingProject(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a Bid</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{biddingProject?.title}</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bid Amount (₹) *</label>
              <Input type="number" placeholder="e.g. 5000" className="mt-1" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Delivery Time</label>
              <Input placeholder="e.g. 7 days, 2 weeks" className="mt-1" value={bidDuration} onChange={e => setBidDuration(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Cover Letter</label>
              <Textarea placeholder="Introduce yourself and explain why you're the best fit..." className="mt-1 min-h-[100px]" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBiddingProject(null)}>Cancel</Button>
            <Button onClick={handleBidSubmit} disabled={!bidAmount || bidMutation.isPending}>
              {bidMutation.isPending ? "Submitting..." : "Submit Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
