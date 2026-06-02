import { useListEnquiries } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminEnquiriesPage() {
  const { data: enquiries, isLoading } = useListEnquiries();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Enquiries</h1>
        <p className="text-muted-foreground">View all student enquiries submitted via the website.</p>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-lg">All Enquiries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Full Name</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Interested Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>WhatsApp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                  </TableRow>
                ))
              ) : enquiries?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No enquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                enquiries?.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell className="font-medium">{enquiry.fullName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{enquiry.phone}</span>
                        <span className="text-xs text-muted-foreground">{enquiry.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{enquiry.course}</TableCell>
                    <TableCell>
                      <Badge variant={enquiry.status === "new" ? "destructive" : enquiry.status === "enrolled" ? "default" : "secondary"}>
                        {enquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`https://wa.me/${enquiry.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                      >
                        Message
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
