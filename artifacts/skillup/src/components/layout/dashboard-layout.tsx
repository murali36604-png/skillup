import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import logo from "@assets/skill_up_logo_1780416699830.png";
import { BookOpen, Users, GraduationCap, MessageSquare, Video, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout: authLogout } = useAuth();
  const [location] = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    authLogout();
  };

  const role = user?.role || "student";

  const navItems = {
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
  }[role];

  return (
    <div className="min-h-screen bg-muted/40 flex">
      <aside className="w-64 border-r border-border bg-background flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href={`/${role}`} className="flex items-center gap-2">
            <img src={logo} alt="SkillUp" className="h-8 w-auto" />
            <span className="font-bold text-lg text-primary tracking-tight">SkillUp</span>
          </Link>
        </div>
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
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
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
