import { useListLiveClasses } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinClassButton } from "@/components/jitsi-meet";
import { Badge } from "@/components/ui/badge";

export function StudentLiveClassesPage() {
  const { data: classes, isLoading } = useListLiveClasses();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Classes</h1>
        <p className="text-muted-foreground">Join interactive virtual sessions with your instructors.</p>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Information</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[150px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : classes?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No live classes scheduled right now.</TableCell></TableRow>
            ) : (
              classes?.map((liveClass) => {
                const date = new Date(liveClass.scheduledAt);
                const isUpcoming = date > new Date();
                
                return (
                  <TableRow key={liveClass.id}>
                    <TableCell>
                      <div className="font-medium text-base mb-1">{liveClass.title}</div>
                      {liveClass.description && (
                        <div className="text-sm text-muted-foreground">{liveClass.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2 text-primary" />
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isUpcoming ? (
                            <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 border-secondary/50 text-secondary">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 bg-muted text-muted-foreground border-border">Past</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <JoinClassButton roomName={liveClass.roomName} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
