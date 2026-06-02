import { ReactNode } from "react";
import { Link } from "wouter";
import logo from "@assets/skill_up_logo_1780416699830.png";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={logo} alt="SkillUp Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl tracking-tight text-primary">SkillUp</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/enquiry" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Enquire Now
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
