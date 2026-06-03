import { useGetMyBids } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, Clock, CheckCircle, XCircle, Send } from "lucide-react";

const statusIcon = { pending: <Clock className="w-3.5 h-3.5" />, accepted: <CheckCircle className="w-3.5 h-3.5" />, rejected: <XCircle className="w-3.5 h-3.5" /> };
const statusClass = { pending: "bg-yellow-50 text-yellow-700 border-yellow-200", accepted: "bg-green-50 text-green-700 border-green-200", rejected: "bg-red-50 text-red-700 border-red-200" };

export function FreelancerMyBidsPage() {
  const { data: bids, isLoading } = useGetMyBids();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bids</h1>
        <p className="text-muted-foreground">Track all the bids you've submitted on projects.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bids", value: bids?.length ?? 0, color: "text-primary" },
          { label: "Pending", value: bids?.filter(b => b.status === "pending").length ?? 0, color: "text-yellow-600" },
          { label: "Accepted", value: bids?.filter(b => b.status === "accepted").length ?? 0, color: "text-green-600" },
          { label: "Rejected", value: bids?.filter(b => b.status === "rejected").length ?? 0, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="pt-5 pb-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Your Bid</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1,2,3].map(i => (
                <TableRow key={i}>
                  {[200,100,80,100,80,100].map((w,j) => <TableCell key={j}><Skeleton className={`h-4 w-[${w}px]`} /></TableCell>)}
                </TableRow>
              ))
            ) : bids?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Send className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No bids submitted yet. Browse projects and start bidding!</p>
                </TableCell>
              </TableRow>
            ) : bids?.map(bid => (
              <TableRow key={bid.id} className="hover:bg-muted/30">
                <TableCell className="font-medium max-w-[200px]">
                  <p className="truncate">{bid.projectTitle}</p>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{bid.projectCategory}</Badge></TableCell>
                <TableCell className="font-semibold">
                  <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{bid.amount.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{bid.duration ?? "—"}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border capitalize ${statusClass[bid.status as keyof typeof statusClass]}`}>
                    {statusIcon[bid.status as keyof typeof statusIcon]} {bid.status}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
