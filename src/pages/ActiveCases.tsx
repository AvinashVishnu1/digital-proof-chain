import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CaseData {
  case_number: string;
  evidence_count: number;
  latest_date: string;
  statuses: string[];
}

const ActiveCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchCases();
    };

    checkAuth();
  }, [navigate]);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("evidence")
        .select("case_number, status, collected_at");

      if (error) throw error;

      // Group by case_number
      const casesMap = new Map<string, CaseData>();
      
      data?.forEach((record) => {
        if (!casesMap.has(record.case_number)) {
          casesMap.set(record.case_number, {
            case_number: record.case_number,
            evidence_count: 0,
            latest_date: record.collected_at,
            statuses: [],
          });
        }
        
        const caseData = casesMap.get(record.case_number)!;
        caseData.evidence_count++;
        
        if (!caseData.statuses.includes(record.status)) {
          caseData.statuses.push(record.status);
        }
        
        if (new Date(record.collected_at) > new Date(caseData.latest_date)) {
          caseData.latest_date = record.collected_at;
        }
      });

      setCases(Array.from(casesMap.values()).sort((a, b) => 
        new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime()
      ));
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "collected":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_analysis":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Active Cases</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active cases found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cases.map((caseData) => (
              <Card key={caseData.case_number} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/evidence?case=${caseData.case_number}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Case #{caseData.case_number}</CardTitle>
                      <CardDescription>
                        Last updated: {new Date(caseData.latest_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {caseData.evidence_count} Evidence {caseData.evidence_count === 1 ? 'Item' : 'Items'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caseData.statuses.map((status) => (
                      <Badge
                        key={status}
                        variant="outline"
                        className={getStatusColor(status)}
                      >
                        {status.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActiveCases;
