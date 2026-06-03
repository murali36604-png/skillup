import { useState } from "react";
import { useGetMyProjects, useGetProjectBids, useUpdateBid, useDeleteProject, getGetMyProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { FolderOpen, Users, CheckCircle, XCircle, IndianRupee, PlusCircle, Trash2, Clock } from "lucide-react";

function BidsPanel({ project, onClose }: { project: any; onClose: () => void }) {
  const { data: bids, isLoading } = useGetProjectBids(project.id);
  const updateBidMutation = useUpdateBid();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleBidAction = async (bidId: number, status: "accepted" | "rejected") => {
    try {
      await updateBidMutation.mutateAsync({ id: bidId, data: { status } });
      queryClient.invalidateQueries({ queryKey: getGetMyProjectsQueryKey() });
      toast({ title: status === "accepted" ? "Bid accepted!" : "Bid rejected", description: status === "accepted" ? "The project is now in progress." : "The bid has been declined." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bids for: {project.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{bids?.length ?? 0} bids received</p>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : bids?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No bids yet. Check back soon!</div>
        ) : (
          <div className="space-y-3">
            {bids?.map(bid => (
              <div key={bid.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {bid.freelancerName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{bid.freelancerName}</p>
                        {bid.freelancerTitle && <p className="text-xs text-muted-foreground">{bid.freelancerTitle}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg flex items-center gap-0.5 justify-end">
                      <IndianRupee className="w-4 h-4" />{bid.amount.toLocaleString()}
                    </p>
                    {bid.duration && <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{bid.duration}</p>}
                  </div>
                </div>

                {bid.coverLetter && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 italic">"{bid.coverLetter}"</p>
                )}

                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-xs capitalize ${bid.status === "accepted" ? "bg-green-100 text-green-700" : bid.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                    variant="outline"
                  >
                    {bid.status}
                  </Badge>
                  {bid.status === "pending" && project.status === "open" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1 h-8" onClick={() => handleBidAction(bid.id, "rejected")} disabled={updateBidMutation.isPending}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button size="sm" className="gap-1 h-8 bg-green-600 hover:bg-green-700" onClick={() => handleBidAction(bid.id, "accepted")} disabled={updateBidMutation.isPending}>
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ClientMyProjectsPage() {
  const { data: projects, isLoading } = useGetMyProjects();
  const [viewBidsFor, setViewBidsFor] = useState<any>(null);
  const deleteMutation = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetMyProjectsQueryKey() });
      toast({ title: "Project deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { open: "bg-green-100 text-green-700", in_progress: "bg-orange-100 text-orange-700", completed: "bg-blue-100 text-blue-700", cancelled: "bg-gray-100 text-gray-600" };
    return <Badge variant="outline" className={`text-xs capitalize ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">Manage all your posted projects and review bids.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/client/post-project"><PlusCircle className="w-4 h-4" /> Post New Project</Link>
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-center w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3].map(i => <TableRow key={i}>{[200,100,100,60,80,80,120].map((w,j) => <TableCell key={j}><Skeleton className={`h-4 w-[${w}px]`} /></TableCell>)}</TableRow>)
            ) : projects?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">No projects posted yet.</p>
                  <Button asChild><Link href="/client/post-project">Post your first project</Link></Button>
                </TableCell>
              </TableRow>
            ) : projects?.map(p => (
              <TableRow key={p.id} className="hover:bg-muted/30">
                <TableCell className="font-medium max-w-[220px]">
                  <p className="truncate">{p.title}</p>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                <TableCell className="text-sm">
                  {p.budgetMin || p.budgetMax ? (
                    <span className="flex items-center gap-0.5 text-green-700 font-medium">
                      <IndianRupee className="w-3 h-3" />
                      {p.budgetMax?.toLocaleString() ?? p.budgetMin?.toLocaleString()}
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm"><Users className="w-3.5 h-3.5 text-muted-foreground" />{p.bidCount}</span>
                </TableCell>
                <TableCell>{statusBadge(p.status)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => setViewBidsFor(p)}>
                      <Users className="w-3.5 h-3.5 mr-1" /> Bids ({p.bidCount})
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {viewBidsFor && <BidsPanel project={viewBidsFor} onClose={() => setViewBidsFor(null)} />}
    </div>
  );
}
