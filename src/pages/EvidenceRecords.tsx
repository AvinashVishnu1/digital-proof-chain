import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, ArrowLeft, Plus, FileText } from "lucide-react";
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

const evidenceSchema = z.object({
  evidence_number: z.string().min(1, "Evidence number is required").max(100),
  case_number: z.string().min(1, "Case number is required").max(100),
  type: z.string().min(1, "Evidence type is required"),
  description: z.string().min(1, "Description is required").max(1000),
  location: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

type EvidenceFormValues = z.infer<typeof evidenceSchema>;

const EvidenceRecords = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      evidence_number: "",
      case_number: "",
      type: "",
      description: "",
      location: "",
      notes: "",
    },
  });

  useEffect(() => {
    checkAuthAndFetchEvidence();
  }, []);

  const checkAuthAndFetchEvidence = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await fetchEvidence();
  };

  const fetchEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from("evidence")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch evidence records");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const onSubmit = async (values: EvidenceFormValues) => {
    try {
      // Generate hash from evidence data
      const dataToHash = JSON.stringify({
        evidence_number: values.evidence_number,
        case_number: values.case_number,
        type: values.type,
        description: values.description,
        timestamp: new Date().toISOString(),
      });
      
      const hash_value = await generateHash(dataToHash);

      const { error } = await supabase.from("evidence").insert([{
        evidence_number: values.evidence_number,
        case_number: values.case_number,
        type: values.type,
        description: values.description,
        location: values.location || null,
        notes: values.notes || null,
        hash_value,
        collected_by: userId,
        status: "collected",
      }]);

      if (error) throw error;

      toast.success("Evidence record created successfully");
      form.reset();
      setShowForm(false);
      await fetchEvidence();
    } catch (error: any) {
      toast.error(error.message || "Failed to create evidence record");
      console.error(error);
    }
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
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Evidence Records</h1>
                <p className="text-xs text-muted-foreground">Manage evidence entries</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Evidence
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create Evidence Record</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="evidence_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="EV-2025-0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="case_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="CASE-2025-0001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="physical">Physical Evidence</SelectItem>
                            <SelectItem value="digital">Digital Evidence</SelectItem>
                            <SelectItem value="biological">Biological Sample</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="weapon">Weapon</SelectItem>
                            <SelectItem value="drug">Drug/Narcotic</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel>Storage Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Evidence Room A, Shelf 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the evidence..."
                          className="min-h-[100px]"
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
                  <Button type="submit">Create Evidence Record</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}

        {/* Evidence List */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Evidence Records</h2>
          {loading ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading evidence records...</p>
            </div>
          ) : evidence.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Evidence Records</h3>
              <p className="text-muted-foreground mb-4">
                Create your first evidence record to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evidence #</TableHead>
                    <TableHead>Case #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidence.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.evidence_number}</TableCell>
                      <TableCell>{item.case_number}</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500">
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.location || "-"}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
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

export default EvidenceRecords;
