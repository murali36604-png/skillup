import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { PublicLayout } from "@/components/layout/public-layout";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { EnquiryPage } from "@/pages/enquiry";

import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminCoursesPage } from "@/pages/admin/courses";
import { AdminEnrollmentsPage } from "@/pages/admin/enrollments";
import { AdminEnquiriesPage } from "@/pages/admin/enquiries";
import { AdminLiveClassesPage } from "@/pages/admin/live-classes";

import { TrainerDashboardPage } from "@/pages/trainer/dashboard";
import { TrainerCoursesPage } from "@/pages/trainer/courses";
import { TrainerStudentsPage } from "@/pages/trainer/students";
// Trainer shares AdminLiveClassesPage
import { StudentDashboardPage } from "@/pages/student/dashboard";
import { StudentCoursesPage } from "@/pages/student/courses";
import { StudentMyCoursesPage } from "@/pages/student/my-courses";
import { StudentLiveClassesPage } from "@/pages/student/live-classes";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-medium text-muted-foreground animate-pulse">Loading Application...</div>;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== allowedRole) return <Redirect to={`/${user.role}`} />;
  
  return <DashboardLayout><Component /></DashboardLayout>;
}

function PublicRoute({ component: Component }: { component: any }) {
  return <PublicLayout><Component /></PublicLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicRoute component={HomePage} />} />
      <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
      <Route path="/enquiry" component={() => <PublicRoute component={EnquiryPage} />} />

      {/* Admin Routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboardPage} allowedRole="admin" />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsersPage} allowedRole="admin" />} />
      <Route path="/admin/courses" component={() => <ProtectedRoute component={AdminCoursesPage} allowedRole="admin" />} />
      <Route path="/admin/enrollments" component={() => <ProtectedRoute component={AdminEnrollmentsPage} allowedRole="admin" />} />
      <Route path="/admin/enquiries" component={() => <ProtectedRoute component={AdminEnquiriesPage} allowedRole="admin" />} />
      <Route path="/admin/live-classes" component={() => <ProtectedRoute component={AdminLiveClassesPage} allowedRole="admin" />} />

      {/* Trainer Routes */}
      <Route path="/trainer" component={() => <ProtectedRoute component={TrainerDashboardPage} allowedRole="trainer" />} />
      <Route path="/trainer/courses" component={() => <ProtectedRoute component={TrainerCoursesPage} allowedRole="trainer" />} />
      <Route path="/trainer/students" component={() => <ProtectedRoute component={TrainerStudentsPage} allowedRole="trainer" />} />
      <Route path="/trainer/live-classes" component={() => <ProtectedRoute component={AdminLiveClassesPage} allowedRole="trainer" />} />

      {/* Student Routes */}
      <Route path="/student" component={() => <ProtectedRoute component={StudentDashboardPage} allowedRole="student" />} />
      <Route path="/student/courses" component={() => <ProtectedRoute component={StudentCoursesPage} allowedRole="student" />} />
      <Route path="/student/my-courses" component={() => <ProtectedRoute component={StudentMyCoursesPage} allowedRole="student" />} />
      <Route path="/student/live-classes" component={() => <ProtectedRoute component={StudentLiveClassesPage} allowedRole="student" />} />

      <Route component={() => <div className="p-8 text-center text-xl text-muted-foreground font-medium flex flex-col items-center justify-center min-h-[50vh]"><h2 className="text-4xl font-bold text-foreground mb-4">404</h2><p>Page Not Found</p></div>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
