import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Clock, Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  title: string;
  description: string;
  desired_date: string;
  desired_time: string;
  client_name: string;
  client_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  accepted_at: string;
  client_user_id: string;
  guest_user_id: string;
  client_profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    linkedin_url: string;
    company_name: string;
    city: string;
    contact_person: string;
  };
  guest_profile?: {
    name: string;
    email: string;
  };
}

export const MissionManagement = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Loading missions for technician user ID:', user.id);

      const { data: missionsData, error } = await supabase
        .from('missions')
        .select(`
          *,
          client_profile:profiles!missions_client_user_id_fkey(
            first_name,
            last_name,
            email,
            phone,
            linkedin_url,
            company_name,
            city,
            contact_person
          ),
          guest_profile:guest_users!missions_guest_user_id_fkey(
            name,
            email
          )
        `)
        .eq('technician_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading missions:', error);
        throw error;
      }

      console.log('Loaded missions:', missionsData);
      setMissions(missionsData || []);
    } catch (error: any) {
      console.error('Error loading missions:', error);
      toast({
        title: "Error",
        description: "Failed to load mission requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMissionResponse = async (missionId: string, status: 'accepted' | 'declined' | 'completed') => {
    try {
      const updateData: any = { status };
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('missions')
        .update(updateData)
        .eq('id', missionId);

      if (error) throw error;

      // Update local state
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status, accepted_at: status === 'accepted' ? new Date().toISOString() : mission.accepted_at }
          : mission
      ));

      toast({
        title: status === 'accepted' ? "Mission Accepted!" : "Mission Declined",
        description: status === 'accepted' 
          ? "The client will be notified and can now see your contact information."
          : "The client will be notified of your decision."
      });

    } catch (error: any) {
      console.error('Error updating mission:', error);
      toast({
        title: "Error",
        description: "Failed to update mission status.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatClientName = (mission: Mission) => {
    if (!mission.client_profile) {
      return mission.guest_profile?.name || mission.client_name;
    }

    const { contact_person, company_name, city } = mission.client_profile;
    let formattedName = '';

    // Use contact_person if available, otherwise fallback to first_name last_name
    if (contact_person) {
      // Add Mr/Mrs prefix to contact_person if not already present
      if (!contact_person.toLowerCase().includes('mr') && !contact_person.toLowerCase().includes('mrs')) {
        formattedName = `Mr/Mrs ${contact_person}`;
      } else {
        formattedName = contact_person;
      }
    } else {
      const { first_name, last_name } = mission.client_profile;
      if (first_name && !first_name.toLowerCase().includes('mr') && !first_name.toLowerCase().includes('mrs')) {
        formattedName = `Mr ${first_name}`;
      } else {
        formattedName = first_name || '';
      }
      
      if (last_name) {
        formattedName += ` ${last_name}`;
      }
    }

    // Add company information
    if (company_name) {
      formattedName += ` from ${company_name}`;
    }

    // Add city information
    if (city) {
      formattedName += ` based in ${city}`;
    }

    return formattedName || mission.client_name;
  };

  const filterMissions = (status: string) => {
    if (status === 'all') return missions;
    return missions.filter(mission => mission.status === status);
  };

  const pendingCount = missions.filter(m => m.status === 'pending').length;
  const acceptedCount = missions.filter(m => m.status === 'accepted').length;
  const completedCount = missions.filter(m => m.status === 'completed').length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading mission requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mission Requests</h2>
        <p className="text-muted-foreground">
          Manage incoming mission requests from clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Accepted ({acceptedCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            All ({missions.length})
          </TabsTrigger>
        </TabsList>

        {['pending', 'accepted', 'completed', 'all'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterMissions(status).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No {status === 'all' ? 'missions' : status} requests
                  </h3>
                  <p className="text-muted-foreground">
                    {status === 'pending' 
                      ? "You don't have any pending mission requests."
                      : `No ${status} missions found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterMissions(status).map((mission) => (
                  <Card key={mission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {mission.title}
                            {getStatusIcon(mission.status)}
                          </CardTitle>
                          <CardDescription>
                            Requested by {formatClientName(mission)}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(mission.status)}>
                          {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mission.description && (
                        <p className="text-sm text-muted-foreground">
                          {mission.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Requested: {formatDate(mission.created_at)}
                        </div>
                        {mission.desired_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Desired: {formatDate(mission.desired_date)}
                            {mission.desired_time && ` at ${formatTime(mission.desired_time)}`}
                          </div>
                        )}
                        {mission.accepted_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Accepted: {formatDate(mission.accepted_at)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Client Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {formatClientName(mission)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {mission.client_profile?.email || mission.guest_profile?.email || mission.client_email}
                            </div>
                            {mission.client_profile?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {mission.client_profile.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {mission.status === 'accepted' && mission.client_profile && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Contact Details Shared</h4>
                            <p className="text-xs text-muted-foreground">
                              Your contact information is now visible to this client.
                            </p>
                          </div>
                        )}
                      </div>

                      {mission.status === 'pending' && (
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleMissionResponse(mission.id, 'declined')}
                            className="flex-1"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                          <Button
                            onClick={() => handleMissionResponse(mission.id, 'accepted')}
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept Mission
                          </Button>
                        </div>
                      )}

                      {mission.status === 'accepted' && (
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => handleMissionResponse(mission.id, 'completed')}
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};