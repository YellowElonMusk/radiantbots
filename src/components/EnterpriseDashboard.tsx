import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Building, User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  linkedin_url: string;
  profile_photo_url: string;
  user_type: 'technician' | 'enterprise';
  created_at: string;
  updated_at: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  desired_date: string;
  desired_time: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  accepted_at: string | null;
  client_id: string;
  technician_id: string | null;
}

interface EnterpriseDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({ onNavigate }) => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('enterprise-login');
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('user_type', 'enterprise')
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
        return;
      }

      if (!profileData) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup.",
          variant: "destructive"
        });
        return;
      }
        
      setUserProfile(profileData as Profile);
      
      // Load missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('client_id', profileData.id)
        .order('created_at', { ascending: false });

      if (missionsError) {
        console.error('Error loading missions:', missionsError);
      } else {
        setMissions(missionsData || []);
      }

    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p>No profile found. Please contact support.</p>
            <Button onClick={() => onNavigate('landing')} className="mt-4">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile.first_name} {userProfile.last_name}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{missions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missions.filter(m => m.status === 'accepted').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Missions</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missions.filter(m => m.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Missions</CardTitle>
              <CardDescription>Your latest mission requests</CardDescription>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No missions yet. Create your first mission request.
                </p>
              ) : (
                <div className="space-y-4">
                  {missions.slice(0, 5).map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mission.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(mission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        mission.status === 'completed' ? 'default' :
                        mission.status === 'accepted' ? 'secondary' :
                        mission.status === 'declined' ? 'destructive' : 'outline'
                      }>
                        {mission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your enterprise profile information
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  {editingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={userProfile.first_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={userProfile.last_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userProfile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={userProfile.phone || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={userProfile.city || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input value={userProfile.linkedin_url || ''} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};