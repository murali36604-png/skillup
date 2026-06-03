import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout, useGetUnreadCount } from "@workspace/api-client-react";
import logo from "@assets/skill_up_logo_1780416699830.png";
import {
  BookOpen, Users, GraduationCap, MessageSquare, Video,
  LayoutDashboard, LogOut, Briefcase, Send, User,
  Landmark, FolderOpen, PlusCircle, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout: authLogout } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();

  const isMarketplace = user?.role === "freelancer" || user?.role === "client";
  const { data: unreadData } = useGetUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    authLogout();
  };

  const role = user?.role || "student";

  const allNavItems: Record<string, { href: string; label: string; icon: any; badge?: number }[]> = {
    admin: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
      { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
      { href: "/admin/live-classes", label: "Live Classes", icon: Video },
    ],
    trainer: [
      { href: "/trainer", label: "Dashboard", icon: LayoutDashboard },
      { href: "/trainer/courses", label: "My Courses", icon: BookOpen },
      { href: "/trainer/students", label: "Students", icon: Users },
      { href: "/trainer/live-classes", label: "Live Classes", icon: Video },
    ],
    student: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/courses", label: "Available Courses", icon: BookOpen },
      { href: "/student/my-courses", label: "My Enrollments", icon: GraduationCap },
      { href: "/student/live-classes", label: "Live Classes", icon: Video },
    ],
    freelancer: [
      { href: "/freelancer", label: "Dashboard", icon: LayoutDashboard },
      { href: "/freelancer/projects", label: "Browse Projects", icon: Briefcase },
      { href: "/freelancer/my-bids", label: "My Bids", icon: Send },
      { href: "/freelancer/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
      { href: "/freelancer/profile", label: "My Profile", icon: User },
      { href: "/freelancer/bank-details", label: "Bank Details", icon: Landmark },
    ],
    client: [
      { href: "/client", label: "Dashboard", icon: LayoutDashboard },
      { href: "/client/post-project", label: "Post a Project", icon: PlusCircle },
      { href: "/client/my-projects", label: "My Projects", icon: FolderOpen },
      { href: "/client/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
    ],
  };

  const navItems = allNavItems[role] ?? allNavItems.student;

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    trainer: "Trainer",
    student: "Student",
    freelancer: "Freelancer",
    client: "Client",
  };

  const roleIcon: Record<string, any> = { freelancer: Briefcase, client: Building2 };
  const RoleIcon = roleIcon[role];

  return (
    <div className="min-h-screen bg-muted/40 flex">
      <aside className="w-64 border-r border-border bg-background flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href={`/${role}`} className="flex items-center gap-2">
            <img src={logo} alt="SkillUp" className="h-8 w-auto" />
            <span className="font-bold text-lg text-primary tracking-tight">SkillUp</span>
          </Link>
        </div>

        {/* Role badge for freelancer/client */}
        {(role === "freelancer" || role === "client") && (
          <div className={`mx-3 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 ${role === "freelancer" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
            {RoleIcon && <RoleIcon className="w-4 h-4" />}
            <span className="text-xs font-semibold">{roleLabel[role]} Portal</span>
          </div>
        )}

        <div className="flex-1 overflow-auto py-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{roleLabel[role] ?? role}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
