import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, FileText, Archive, Activity, Users } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  full_name: string;
  department: string | null;
  badge_number: string | null;
}

interface UserRole {
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and fetch data
    const initializeDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (rolesData) {
        setRoles(rolesData.map((r: UserRole) => r.role));
      }

      setLoading(false);
    };

    initializeDashboard();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: "bg-primary text-primary-foreground",
      police: "bg-blue-500 text-white",
      fsl_officer: "bg-purple-500 text-white",
      evidence_room: "bg-amber-500 text-white",
      investigation_officer: "bg-green-500 text-white",
    };
    return colors[role] || "bg-secondary text-secondary-foreground";
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      admin: "System Admin",
      police: "Police Officer",
      fsl_officer: "FSL Officer",
      evidence_room: "Evidence Room",
      investigation_officer: "Investigation Officer",
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">SecureEvidence</h1>
                <p className="text-xs text-muted-foreground">Evidence Management Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-card to-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Welcome, {profile?.full_name || "Officer"}
              </h2>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              {profile?.department && (
                <p className="text-sm text-muted-foreground">Department: {profile.department}</p>
              )}
              {profile?.badge_number && (
                <p className="text-sm text-muted-foreground">Badge: {profile.badge_number}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Badge key={role} className={getRoleBadgeColor(role)}>
                    {getRoleLabel(role)}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">No Role Assigned</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        {roles.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              No Role Assigned
            </h3>
            <p className="text-muted-foreground mb-4">
              Please contact your system administrator to assign a role to your account.
            </p>
            <p className="text-sm text-muted-foreground">
              Once assigned, you'll have access to role-specific features and modules.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/evidence">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <FileText className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Evidence Records</h3>
                <p className="text-sm text-muted-foreground">View and manage evidence entries</p>
              </Card>
            </Link>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <Archive className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Chain of Custody</h3>
              <p className="text-sm text-muted-foreground">Track evidence transfers</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <Activity className="h-10 w-10 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Active Cases</h3>
              <p className="text-sm text-muted-foreground">Monitor ongoing investigations</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <Users className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Members</h3>
              <p className="text-sm text-muted-foreground">View authorized personnel</p>
            </Card>
          </div>
        )}

        {/* System Info */}
        <Card className="mt-8 p-6 bg-muted/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Cloud Storage</p>
                <p className="text-xs text-muted-foreground">AWS S3 Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">Encryption</p>
                <p className="text-xs text-muted-foreground">SHA-256 / AES-256</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
