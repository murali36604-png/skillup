import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "trainer", "student"]),
  phone: z.string().optional(),
});

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useListUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", role: "student", phone: "" },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      if (editingUser) {
        const payload: any = { name: values.name, email: values.email, role: values.role, phone: values.phone || null };
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload });
        toast({ title: "User updated successfully" });
      } else {
        if (!values.password) {
          toast({ variant: "destructive", title: "Password is required for new users" });
          return;
        }
        await createMutation.mutateAsync({ data: values as any });
        toast({ title: "User created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setIsCreateOpen(false);
      setEditingUser(null);
      form.reset({ name: "", email: "", password: "", role: "student", phone: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({ name: user.name, email: user.email, role: user.role, phone: user.phone || "", password: "" });
    setIsCreateOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingUser.id });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "User deleted", description: `${deletingUser.name} has been removed.` });
      setDeletingUser(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
  };

  const roleBadge = (role: string) => {
    if (role === "admin") return <Badge className="bg-red-100 text-red-700 border-red-200 capitalize">Admin</Badge>;
    if (role === "trainer") return <Badge className="bg-blue-100 text-blue-700 border-blue-200 capitalize">Trainer</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">Student</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage administrators, trainers, and students.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) { setEditingUser(null); form.reset({ name: "", email: "", password: "", role: "student", phone: "" }); }
        }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {!editingUser && (
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                )}
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold text-center w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  {[150, 200, 80, 100].map((w, j) => (
                    <TableCell key={j}><Skeleton className={`h-4 w-[${w}px]`} /></TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : users?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No users found.</TableCell></TableRow>
            ) : (
              users?.map((user) => {
                const isSelf = currentUser?.id === user.id;
                return (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {user.name}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{roleBadge(user.role)}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-40"
                          onClick={() => setDeletingUser(user)}
                          disabled={isSelf}
                          title={isSelf ? "You cannot delete your own account" : `Delete ${user.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deletingUser?.name}</span>?
              <br />
              <span className="text-sm text-muted-foreground mt-1 block">
                This action cannot be undone. Their account, enrollments, and data will be permanently removed.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleteMutation.isPending ? "Deleting..." : "Yes, Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
