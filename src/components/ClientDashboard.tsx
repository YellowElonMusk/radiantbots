import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  technician?: {
    first_name: string;
    last_name: string;
    city: string;
    email: string;
    phone: string;
    linkedin_url: string;
    profile_photo_url: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  mission_id: string;
  sender?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const ClientDashboard = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('missions');

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get client profile ID first
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientProfile) {
        console.error('Client profile not found');
        return;
      }

      // Load missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id,
          title,
          description,
          desired_date,
          desired_time,
          status,
          created_at,
          accepted_at,
          client_id,
          technician_id,
          technician:profiles(
            first_name,
            last_name,
            city,
            email,
            phone,
            linkedin_url,
            profile_photo_url
          )
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (missionsError) throw missionsError;

      // Load messages for accepted missions
      const acceptedMissionIds = missionsData
        ?.filter(m => m.status === 'accepted')
        .map(m => m.id) || [];

      let messagesData = [];
      if (acceptedMissionIds.length > 0) {
        const { data: msgs, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .in('mission_id', acceptedMissionIds)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;
        messagesData = msgs || [];
      }

      // Use 'any' type to avoid TypeScript errors with the simplified schema
      setMissions(missionsData as any || []);
      setMessages(messagesData as any || []);
    } catch (error: any) {
      console.error('Error loading client data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your mission requests and communicate with technicians
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            My Missions ({missions.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4">
          {missions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No missions yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't requested any missions yet. Browse our catalog to find technicians.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Browse Technicians
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {missions.map((mission) => (
                <Card key={mission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {mission.title}
                          {getStatusIcon(mission.status)}
                        </CardTitle>
                        <CardDescription>
                          {mission.technician ? `Requested from ${mission.technician.first_name} ${mission.technician.last_name}` : 'Technician not found'}
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

                    {mission.status === 'accepted' && mission.technician && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Mission Accepted! Contact Information:
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Email:</strong> {mission.technician.email}</p>
                          {mission.technician.phone && (
                            <p><strong>Phone:</strong> {mission.technician.phone}</p>
                          )}
                          {mission.technician.linkedin_url && (
                            <p>
                              <strong>LinkedIn:</strong>{' '}
                              <a 
                                href={mission.technician.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View Profile
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Messages will appear here once a technician accepts your mission request.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {message.sender.first_name} {message.sender.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};