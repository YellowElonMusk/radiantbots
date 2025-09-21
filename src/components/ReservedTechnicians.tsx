import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  desired_date: string;
  desired_time: string;
  created_at: string;
  accepted_at?: string | null;
  technician_id: string | null;
  client_id: string | null;
  updated_at: string;
  technician: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
    phone?: string;
    id: string;
    user_id: string;
    email: string;
    city: string;
    user_type: 'technician' | 'enterprise';
    linkedin_url?: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface ReservedTechniciansProps {
  userId: string;
  onViewProfile?: (technicianId: string) => void;
}

export function ReservedTechnicians({ userId, onViewProfile }: ReservedTechniciansProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, [userId]);

  const loadMissions = async () => {
    try {
      // Get client profile ID first
      const { data: clientProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!clientProfile) {
        console.error('Client profile not found');
        setLoading(false);
        return;
      }

      const { data: missionsData, error } = await supabase
        .from('missions')
        .select(`
          *,
          technician:profiles!technician_id(
            id,
            user_id,
            first_name,
            last_name,
            profile_photo_url,
            phone,
            email,
            city,
            user_type,
            linkedin_url,
            created_at,
            updated_at
          )
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading missions:', error);
      } else {
        // Filter out any missions where the technician query failed and cast to proper type
        const validMissions = (missionsData || []).filter(mission => 
          !mission.technician || (typeof mission.technician === 'object' && !('error' in mission.technician))
        ) as Mission[];
        setMissions(validMissions);
      }
    } catch (error) {
      console.error('Error in loadMissions:', error);
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
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Accepté';
      case 'declined':
        return 'Refusé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission</h3>
        <p className="text-gray-600">Vous n'avez encore fait aucune demande de mission.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missions.map((mission) => (
        <Card key={mission.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {mission.technician && (
                  <Avatar 
                    className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => onViewProfile && mission.technician_id && onViewProfile(mission.technician_id)}
                  >
                    <AvatarImage src={mission.technician.profile_photo_url} />
                    <AvatarFallback>
                      {mission.technician.first_name?.[0]}{mission.technician.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onViewProfile && mission.technician_id && onViewProfile(mission.technician_id)}
                  >
                    {mission.technician ? `${mission.technician.first_name} ${mission.technician.last_name}` : 'Unknown Technician'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    75€/heure
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(mission.status)}
                <Badge className={getStatusColor(mission.status)}>
                  {getStatusText(mission.status)}
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">{mission.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{mission.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Demandé: {formatDate(mission.desired_date)}</span>
              </div>
              {mission.desired_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Heure: {formatTime(mission.desired_time)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Créé: {formatDate(mission.created_at)}</span>
              </div>
              {mission.accepted_at && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Accepté: {formatDate(mission.accepted_at)}</span>
                </div>
              )}
            </div>

            {mission.technician?.phone && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Contact: {mission.technician.phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}