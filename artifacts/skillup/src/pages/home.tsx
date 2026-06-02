import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import heroImg from "@assets/skill_up_logo_1780416699830.png";

export function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Empowering Students. <span className="text-secondary">Building Futures.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              SkillUp is your launchpad to a successful career. Join our industry-led programs in Python, Web Development, and more.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/enquiry">
                <Button size="lg" variant="secondary" className="font-semibold text-base h-12 px-8 shadow-lg shadow-secondary/20">
                  Enquire Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-semibold text-base h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  Student Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Popular Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Master in-demand skills with our comprehensive, hands-on training programs designed for the modern workplace.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-none shadow-md hover-elevate transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Python Programming</CardTitle>
                <CardDescription>Master the fundamentals of Python and data structures.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/enquiry">
                  <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover-elevate transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Web Development</CardTitle>
                <CardDescription>Build modern, responsive websites from scratch.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/enquiry">
                  <Button variant="outline" className="w-full text-secondary border-secondary/20 hover:bg-secondary/5">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover-elevate transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Data Entry</CardTitle>
                <CardDescription>Develop essential administrative and data handling skills.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/enquiry">
                  <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Students Enrolled</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-secondary">50+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Expert Trainers</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">20+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Courses</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-secondary">95%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
