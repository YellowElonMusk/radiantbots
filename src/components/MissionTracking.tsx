import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users, Target } from 'lucide-react';
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
  } | null;
}

interface MissionStats {
  totalMissions: number;
  completedMissions: number;
  successRate: number;
  averageDuration: number;
  totalSpent: number;
  topTechnician: string;
}

interface MissionTrackingProps {
  onBack: () => void;
  currentUserId: string;
}

export function MissionTracking({ onBack, currentUserId }: MissionTrackingProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats | null>(null);
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
            hourly_rate
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
      calculateStats(formattedMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (missions: Mission[]) => {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.status === 'completed').length;
    const successRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
    
    // Calculate average duration (simulated for now)
    const averageDuration = 4.5; // hours
    
    // Calculate total spent (simulated based on hourly rates)
    const totalSpent = missions.reduce((sum, mission) => {
      if (mission.status === 'completed' && mission.technician) {
        return sum + (mission.technician.hourly_rate * averageDuration);
      }
      return sum;
    }, 0);

    // Find top technician
    const technicianCounts = missions.reduce((acc, mission) => {
      if (mission.technician) {
        const name = `${mission.technician.first_name} ${mission.technician.last_name}`;
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topTechnician = Object.entries(technicianCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Aucun';

    setStats({
      totalMissions,
      completedMissions,
      successRate,
      averageDuration,
      totalSpent,
      topTechnician
    });
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
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Suivi des missions</h1>
            <p className="text-muted-foreground">Analysez vos missions et leur performance</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total missions</p>
                  <p className="text-2xl font-bold">{stats.totalMissions}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Durée moyenne</p>
                  <p className="text-2xl font-bold">{stats.averageDuration}h</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total dépensé</p>
                  <p className="text-2xl font-bold">{stats.totalSpent.toFixed(0)}€</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Technician */}
      {stats && stats.topTechnician !== 'Aucun' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Technicien le plus sollicité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{stats.topTechnician}</p>
            <p className="text-sm text-muted-foreground">
              A réalisé le plus de missions pour votre entreprise
            </p>
          </CardContent>
        </Card>
      )}

      {/* Missions List */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des missions</CardTitle>
          <CardDescription>
            Liste complète de toutes vos missions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune mission trouvée</p>
              <p className="text-sm">Commencez par réserver un technicien</p>
            </div>
          ) : (
            missions.map((mission) => (
              <div key={mission.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{mission.title}</h3>
                    {mission.description && (
                      <p className="text-sm text-muted-foreground">{mission.description}</p>
                    )}
                  </div>
                  {getStatusBadge(mission.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {mission.technician && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mission.technician.profile_photo_url} />
                          <AvatarFallback>
                            {mission.technician.first_name?.[0]}{mission.technician.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {mission.technician.first_name} {mission.technician.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mission.technician.hourly_rate}€/heure
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(mission.desired_date)}
                      {mission.desired_time && ` à ${formatTime(mission.desired_time)}`}
                    </div>
                    <p className="text-xs">
                      Créée le {formatDate(mission.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}