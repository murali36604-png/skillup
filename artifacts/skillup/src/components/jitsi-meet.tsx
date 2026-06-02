import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export function JitsiMeetModal({ roomName, open, onOpenChange }: { roomName: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle>Live Class: {roomName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full bg-black">
          {open && (
            <iframe
              src={`https://meet.jit.si/${roomName}`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-0"
              title="Jitsi Meet"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function JoinClassButton({ roomName }: { roomName: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Video className="w-4 h-4 mr-2" />
        Join Class
      </Button>
      <JitsiMeetModal roomName={roomName} open={open} onOpenChange={setOpen} />
    </>
  );
}
