import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ArrowLeft, Plus, Archive } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const custodySchema = z.object({
  evidence_id: z.string().min(1, "Evidence selection is required"),
  transferred_to: z.string().optional(),
  location: z.string().min(1, "Location is required").max(255),
  condition: z.string().max(500).optional(),
  purpose: z.string().min(1, "Purpose is required").max(500),
  notes: z.string().max(1000).optional(),
});

type CustodyFormValues = z.infer<typeof custodySchema>;

const CustodyChain = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [custodyRecords, setCustodyRecords] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<CustodyFormValues>({
    resolver: zodResolver(custodySchema),
    defaultValues: {
      evidence_id: "",
      transferred_to: "",
      location: "",
      condition: "",
      purpose: "",
      notes: "",
    },
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await Promise.all([
      fetchCustodyRecords(),
      fetchEvidence(),
      fetchProfiles(),
    ]);
  };

  const fetchCustodyRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("custody_chain")
        .select("*")
        .order("transfer_date", { ascending: false });

      if (error) throw error;
      setCustodyRecords(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch custody records");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from("evidence")
        .select("id, evidence_number, case_number, description")
        .order("evidence_number");

      if (error) throw error;
      setEvidence(data || []);
    } catch (error: any) {
      console.error("Failed to fetch evidence:", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, badge_number")
        .order("full_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Failed to fetch profiles:", error);
    }
  };

  const onSubmit = async (values: CustodyFormValues) => {
    try {
      const { error } = await supabase.from("custody_chain").insert([{
        evidence_id: values.evidence_id,
        transferred_from: userId,
        transferred_to: values.transferred_to || null,
        location: values.location,
        condition: values.condition || null,
        purpose: values.purpose,
        notes: values.notes || null,
        transfer_date: new Date().toISOString(),
      }]);

      if (error) throw error;

      toast.success("Custody record created successfully");
      form.reset();
      setShowForm(false);
      await fetchCustodyRecords();
    } catch (error: any) {
      toast.error(error.message || "Failed to create custody record");
      console.error(error);
    }
  };

  const getEvidenceLabel = (evidenceId: string) => {
    const item = evidence.find(e => e.id === evidenceId);
    return item ? `${item.evidence_number} - ${item.case_number}` : evidenceId;
  };

  const getProfileName = (profileId: string | null) => {
    if (!profileId) return "System";
    const profile = profiles.find(p => p.id === profileId);
    return profile ? `${profile.full_name}${profile.badge_number ? ` (${profile.badge_number})` : ''}` : profileId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Shield className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Chain of Custody</h1>
                <p className="text-xs text-muted-foreground">Track evidence transfers</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Record Evidence Transfer</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="evidence_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Item *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select evidence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {evidence.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.evidence_number} - {item.case_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transferred_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transferred To</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select officer (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {profiles.map((profile) => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {profile.full_name} {profile.badge_number && `(${profile.badge_number})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Evidence Room A, Forensic Lab, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <FormControl>
                          <Input placeholder="Good, Sealed, Damaged, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Reason for transfer (Analysis, Storage, Court, etc.)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit">Record Transfer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {/* Custody Records List */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Custody History</h2>
          {loading ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-amber-500 animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading custody records...</p>
            </div>
          ) : custodyRecords.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Custody Records</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custody transfer record to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evidence</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {custodyRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getEvidenceLabel(record.evidence_id)}
                      </TableCell>
                      <TableCell>{getProfileName(record.transferred_from)}</TableCell>
                      <TableCell>{getProfileName(record.transferred_to)}</TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{record.condition || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.purpose}</TableCell>
                      <TableCell>
                        {new Date(record.transfer_date).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CustodyChain;
