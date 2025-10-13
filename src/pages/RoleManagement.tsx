import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ArrowLeft } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  email?: string;
};

type UserRole = {
  id: string;
  user_id: string;
  role: string;
};

const RoleManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const availableRoles = ['admin', 'police', 'fsl_officer', 'evidence_room', 'investigation_officer'];

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: adminCheck } = await supabase.rpc('is_admin', { _user_id: user.id });
      
      if (!adminCheck) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadUsers();
      await loadUserRoles();
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Failed to verify permissions");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name');

    if (profilesError) {
      toast.error("Failed to load users");
      return;
    }

    // Get emails from auth.users via a separate query
    const userIds = profilesData?.map(p => p.id) || [];
    const usersWithEmails = await Promise.all(
      profilesData?.map(async (profile) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
        return {
          ...profile,
          email: user?.email
        };
      }) || []
    );

    setUsers(usersWithEmails);
  };

  const loadUserRoles = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');

    if (error) {
      toast.error("Failed to load roles");
      return;
    }

    setUserRoles(data || []);
  };

  const handleAssignRole = async (userId: string, role: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role: role as any,
        assigned_by: user.id
      }]);

    if (error) {
      if (error.code === '23505') {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to assign role");
      }
      return;
    }

    toast.success("Role assigned successfully");
    await loadUserRoles();
  };

  const handleRemoveRole = async (roleId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      toast.error("Failed to remove role");
      return;
    }

    toast.success("Role removed successfully");
    await loadUserRoles();
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(ur => ur.user_id === userId);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      police: "bg-blue-500",
      fsl_officer: "bg-purple-500",
      evidence_room: "bg-green-500",
      investigation_officer: "bg-orange-500",
    };
    return colors[role] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Shield className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Role Management
            </CardTitle>
            <CardDescription>
              Assign and manage user roles across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Roles</TableHead>
                  <TableHead>Assign Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roles = getUserRoles(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {roles.length === 0 ? (
                            <span className="text-muted-foreground text-sm">No roles assigned</span>
                          ) : (
                            roles.map((role) => (
                              <Badge
                                key={role.id}
                                className={`${getRoleBadgeColor(role.role)} cursor-pointer`}
                                onClick={() => handleRemoveRole(role.id)}
                              >
                                {role.role} ×
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => handleAssignRole(user.id, value)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleManagement;
