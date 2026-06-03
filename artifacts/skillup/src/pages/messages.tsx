import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  useGetConversations,
  useGetMessages,
  useSendMessage,
  useMarkMessagesRead,
  getGetConversationsQueryKey,
  getGetMessagesQueryKey,
  getGetUnreadCountQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, MessageSquare, Search, ArrowLeft, Circle } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDateGroup(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];
  let currentDate = "";
  for (const m of messages) {
    const d = formatDateGroup(m.createdAt);
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ date: d, messages: [] });
    }
    groups[groups.length - 1].messages.push(m);
  }
  return groups;
}

export function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations = [], refetch: refetchConvs } = useGetConversations();
  const { data: messages = [], refetch: refetchMessages } = useGetMessages(selectedUserId ?? 0, {
    query: { enabled: selectedUserId !== null },
  } as any);
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();

  const selectedConv = conversations.find(c => c.userId === selectedUserId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedUserId && selectedConv && selectedConv.unreadCount > 0) {
      markReadMutation.mutateAsync({ userId: selectedUserId }).then(() => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUnreadCountQueryKey() });
      });
    }
  }, [selectedUserId]);

  // Poll for new messages every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedUserId) refetchMessages();
      refetchConvs();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedUserId) return;
    const content = draft.trim();
    setDraft("");
    try {
      await sendMutation.mutateAsync({ userId: selectedUserId, data: { content } });
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedUserId) });
      queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
      inputRef.current?.focus();
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvs = conversations.filter(c =>
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  const messageGroups = groupByDate(messages);
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  const roleColor: Record<string, string> = {
    client: "bg-blue-100 text-blue-700",
    freelancer: "bg-orange-100 text-orange-700",
    admin: "bg-purple-100 text-purple-700",
    trainer: "bg-green-100 text-green-700",
    student: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar: conversation list ── */}
      <div className={cn(
        "w-full md:w-80 border-r bg-background flex flex-col shrink-0",
        selectedUserId ? "hidden md:flex" : "flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Messages
              {totalUnread > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs bg-orange-500">{totalUnread}</Badge>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.role === "freelancer"
                  ? "Browse projects and start a conversation with clients"
                  : "Post a project to connect with freelancers"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConvs.map(conv => (
                <button
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-muted/60 transition-colors",
                    selectedUserId === conv.userId && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm border border-primary/10">
                      {conv.userName[0]?.toUpperCase()}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("font-semibold text-sm truncate", conv.unreadCount > 0 && "text-foreground")}>
                        {conv.userName}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded capitalize", roleColor[conv.userRole] ?? "bg-gray-100 text-gray-700")}>
                        {conv.userRole}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate mt-0.5", conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Chat window ── */}
      {selectedUserId ? (
        <div className={cn("flex-1 flex flex-col", !selectedUserId && "hidden md:flex")}>
          {/* Chat header */}
          <div className="h-16 border-b flex items-center gap-3 px-4 bg-background shrink-0">
            <button
              onClick={() => setSelectedUserId(null)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-sm border border-primary/10">
              {selectedConv?.userName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedConv?.userName}</p>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded capitalize", roleColor[selectedConv?.userRole ?? ""] ?? "bg-gray-100 text-gray-700")}>
                {selectedConv?.userRole}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
              <Circle className="w-2 h-2 fill-current" /> Online
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 bg-muted/20">
            <div className="p-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mb-4 shadow-sm">
                    <MessageSquare className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Start the conversation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Say hello to {selectedConv?.userName}!
                  </p>
                </div>
              ) : messageGroups.map(group => (
                <div key={group.date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{group.date}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {group.messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.id;
                    const prevMsg = group.messages[idx - 1];
                    const sameAsPrev = prevMsg && prevMsg.senderId === msg.senderId;

                    return (
                      <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start", sameAsPrev ? "mt-0.5" : "mt-3")}>
                        {/* Avatar for received messages */}
                        {!isMine && !sameAsPrev && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-xs border border-primary/10 mr-2 mt-1 shrink-0">
                            {selectedConv?.userName[0]?.toUpperCase()}
                          </div>
                        )}
                        {!isMine && sameAsPrev && <div className="w-7 mr-2 shrink-0" />}

                        <div className={cn("max-w-[65%] group")}>
                          <div className={cn(
                            "px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
                            isMine
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-background border rounded-tl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <p className={cn(
                            "text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                            isMine ? "text-right" : "text-left"
                          )}>
                            {formatTime(msg.createdAt)}
                            {isMine && (
                              <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input bar */}
          <div className="border-t bg-background p-3">
            <div className="flex items-end gap-2 bg-muted/50 rounded-2xl px-4 py-2 border focus-within:border-primary/50 transition-colors">
              <Input
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedConv?.userName ?? ""}...`}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm flex-1 resize-none"
                autoComplete="off"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!draft.trim() || sendMutation.isPending}
                className={cn(
                  "rounded-xl h-8 w-8 p-0 shrink-0 transition-all",
                  draft.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      ) : (
        /* Empty state when no conversation selected (desktop) */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/10 text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 border border-primary/10">
            <MessageSquare className="w-9 h-9 text-primary" />
          </div>
          <h3 className="text-xl font-bold">Your Messages</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs">
            Select a conversation from the left to read and reply to messages.
          </p>
        </div>
      )}
    </div>
  );
}
