import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Mission {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  desired_date: string | null;
  desired_time: string | null;
  created_at: string;
  accepted_at: string | null;
  client_user_id: string | null;
  technician_id: string;
  technician: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
    hourly_rate: number;
    phone: string;
    email: string;
  } | null;
}

interface EnterpriseMissionDashboardProps {
  currentUserId: string;
  onNavigate: (page: string) => void;
}

export function EnterpriseMissionDashboard({ currentUserId, onNavigate }: EnterpriseMissionDashboardProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissions();
  }, [currentUserId]);

  const loadMissions = async () => {
    try {
      // Get user profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single();

      if (profileError || !profile) {
        console.error('Error loading profile:', profileError);
        return;
      }

      const { data: missionsData, error } = await supabase
        .from('missions')
        .select(`
          *,
          technician:profiles!missions_technician_id_fkey(
            first_name,
            last_name,
            profile_photo_url,
            hourly_rate,
            phone,
            email
          )
        `)
        .eq('client_user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMissions = missionsData?.map(mission => ({
        ...mission,
        technician: Array.isArray(mission.technician) ? mission.technician[0] : mission.technician
      })) || [];

      setMissions(formattedMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      accepted: { label: 'Acceptée', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Terminée', variant: 'default' as const, icon: CheckCircle },
      declined: { label: 'Refusée', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('enterprise-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mes demandes de mission</h1>
            <p className="text-muted-foreground">Toutes vos demandes de mission et leur statut</p>
          </div>
        </div>
        <Button onClick={() => onNavigate('catalog')}>
          Nouvelle mission
        </Button>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        {missions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune mission trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore soumis de demande de mission.
              </p>
              <Button onClick={() => onNavigate('catalog')}>
                Rechercher un technicien
              </Button>
            </CardContent>
          </Card>
        ) : (
          missions.map((mission) => (
            <Card key={mission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {mission.title}
                    </CardTitle>
                    <CardDescription>
                      Demandé le {formatDate(mission.created_at)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(mission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mission.description && (
                  <p className="text-sm text-muted-foreground">
                    {mission.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mission Details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Détails de la mission</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date souhaitée: {formatDate(mission.desired_date)}
                        {mission.desired_time && ` à ${formatTime(mission.desired_time)}`}
                      </div>
                      {mission.accepted_at && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Acceptée le {formatDate(mission.accepted_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technician Info */}
                  {mission.technician && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Technicien assigné</h4>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mission.technician.profile_photo_url} />
                          <AvatarFallback>
                            {mission.technician.first_name?.[0]}{mission.technician.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {mission.technician.first_name} {mission.technician.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mission.technician.hourly_rate}€/heure
                          </p>
                          {mission.status === 'accepted' && (
                            <div className="flex gap-2 text-xs">
                              {mission.technician.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {mission.technician.phone}
                                </div>
                              )}
                              {mission.technician.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {mission.technician.email}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status-specific information */}
                {mission.status === 'pending' && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Votre demande est en attente de réponse du technicien.
                    </p>
                  </div>
                )}

                {mission.status === 'accepted' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      Mission acceptée ! Vous pouvez maintenant contacter le technicien directement.
                    </p>
                  </div>
                )}

                {mission.status === 'declined' && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      Cette mission a été déclinée. Vous pouvez rechercher d'autres techniciens disponibles.
                    </p>
                  </div>
                )}

                {mission.status === 'completed' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Mission terminée avec succès !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}