import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetBankDetails, useUpsertBankDetails } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Landmark, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const bankSchema = z.object({
  accountHolder: z.string().min(2, "Account holder name is required"),
  accountNumber: z.string().min(9, "Valid account number is required"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11, "IFSC code must be 11 characters"),
  bankName: z.string().min(2, "Bank name is required"),
  branch: z.string().optional(),
  upiId: z.string().optional(),
});

export function FreelancerBankDetailsPage() {
  const { toast } = useToast();
  const { data: bankDetails } = useGetBankDetails();
  const updateMutation = useUpsertBankDetails();

  const form = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
    defaultValues: { accountHolder: "", accountNumber: "", ifscCode: "", bankName: "", branch: "", upiId: "" },
  });

  useEffect(() => {
    if (bankDetails) {
      form.reset({
        accountHolder: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        branch: bankDetails.branch ?? "",
        upiId: bankDetails.upiId ?? "",
      });
    }
  }, [bankDetails]);

  const onSubmit = async (values: z.infer<typeof bankSchema>) => {
    try {
      await updateMutation.mutateAsync({ data: { ...values, branch: values.branch || undefined, upiId: values.upiId || undefined } });
      toast({ title: "Bank details saved!", description: "Your payment details have been updated." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e.message });
    }
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bank Details</h1>
        <p className="text-muted-foreground">Add your payment details to receive project payments.</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-700 text-sm">
          Your bank details are encrypted and stored securely. They are only used to process payments for completed projects.
        </AlertDescription>
      </Alert>

      {/* Status card */}
      <Card className={`border-none shadow-sm ${bankDetails ? "bg-green-50 border-l-4 border-l-green-500" : "bg-yellow-50 border-l-4 border-l-yellow-500"}`}>
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <ShieldCheck className={`w-5 h-5 ${bankDetails ? "text-green-600" : "text-yellow-600"}`} />
          <div>
            <p className={`text-sm font-semibold ${bankDetails ? "text-green-800" : "text-yellow-800"}`}>
              {bankDetails ? "Bank details on file" : "No bank details added"}
            </p>
            {bankDetails && <p className="text-xs text-green-700">{bankDetails.bankName} · ****{bankDetails.accountNumber.slice(-4)}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Landmark className="w-4 h-4" /> Bank Account Details</CardTitle>
          <CardDescription>Add your Indian bank account details for receiving payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="accountHolder" render={({ field }) => (
                <FormItem><FormLabel>Account Holder Name *</FormLabel>
                  <FormControl><Input placeholder="As per bank records" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="accountNumber" render={({ field }) => (
                  <FormItem><FormLabel>Account Number *</FormLabel>
                    <FormControl><Input placeholder="Enter account number" type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ifscCode" render={({ field }) => (
                  <FormItem><FormLabel>IFSC Code *</FormLabel>
                    <FormControl><Input placeholder="e.g. SBIN0001234" className="uppercase" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="bankName" render={({ field }) => (
                  <FormItem><FormLabel>Bank Name *</FormLabel>
                    <FormControl><Input placeholder="e.g. State Bank of India" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="branch" render={({ field }) => (
                  <FormItem><FormLabel>Branch (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g. Anna Nagar, Chennai" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="upiId" render={({ field }) => (
                <FormItem><FormLabel>UPI ID (Optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. 9876543210@upi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                {updateMutation.isPending ? "Saving..." : "Save Bank Details"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
