import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Users, FileText, Star, AlertCircle } from 'lucide-react';
import { WeekdayRangePicker } from '@/components/ui/weekday-range-picker';

interface TechnicianProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  city: string;
  profile_photo_url: string;
  user_type: 'technician' | 'enterprise';
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface MissionBookingFormProps {
  technicianId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function MissionBookingForm({ technicianId, onNavigate }: MissionBookingFormProps) {
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [missionLocation, setMissionLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salesTeamNumber, setSalesTeamNumber] = useState('');
  const [missionDateRange, setMissionDateRange] = useState<{
    start_date: string;
    end_date: string;
    selected_weekdays: string[];
    weekend_excluded: boolean;
    count_weekdays: number;
  } | null>(null);
  const [preferredTime, setPreferredTime] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [urgency, setUrgency] = useState('normal');
  
  const { t } = useLanguage();

  useEffect(() => {
    loadTechnician();
  }, [technicianId]);

  const loadTechnician = async () => {
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, city, profile_photo_url, user_type, email, phone, linkedin_url, created_at, updated_at')
        .eq('user_id', technicianId)
        .single();

      if (error) {
        console.error('Error loading technician:', error);
        return;
      }

      setTechnician(profile);
    } catch (error) {
      console.error('Error loading technician:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    onNavigate('profile', { technicianId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!missionLocation || !contactNumber || !missionDateRange || !missionDescription) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get current user or create guest user
      const { data: { user } } = await supabase.auth.getUser();
      let clientEmail = '';
      let clientName = '';
      let clientUserId = null;
      let guestUserId = null;

      if (user) {
        // Authenticated user
        clientEmail = user.email || '';
        clientUserId = user.id;
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          clientName = `${profile.first_name} ${profile.last_name}`;
        } else {
          clientName = user.email || 'Client';
        }
      } else {
        // Guest user - generate a browser token
        const browserToken = crypto.randomUUID();
        
        // For guest users, we'll store the mission without creating a guest_users record
        // Since guest_users table doesn't exist in our simplified schema
        guestUserId = browserToken; // Use browser token as identifier
        clientEmail = 'guest@example.com';
        clientName = clientCompany || 'Enterprise Client';

      }

      // Get client profile ID if authenticated user
      let clientProfileId = null;
      if (clientUserId) {
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', clientUserId)
          .single();
        clientProfileId = clientProfile?.id;
      }

      // Get technician profile ID
      const { data: techProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', technicianId)
        .single();

      if (!techProfile) {
        console.error('Technician profile not found');
        alert('Erreur: profil technicien non trouvé');
        return;
      }

      // Create mission record
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          title: `Mission: ${missionDescription.substring(0, 50)}...`,
          description: missionDescription,
          desired_date: missionDateRange.start_date,
          desired_time: preferredTime || null,
          client_id: clientProfileId,
          technician_id: techProfile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (missionError) {
        console.error('Error creating mission:', missionError);
        alert('Erreur lors de la création de la mission');
        return;
      }

      console.log('Mission created successfully:', mission);

      // Mission created successfully - no need for search_requests table in simplified schema

      alert('Votre demande de mission a été envoyée avec succès ! Le technicien recevra une notification.');
      onNavigate('catalog');
      
    } catch (error) {
      console.error('Error submitting mission:', error);
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Technicien non trouvé</h2>
          <Button variant="outline" onClick={() => onNavigate('catalog')}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Demande de mission</h1>
              <p className="text-sm text-muted-foreground">
                Remplissez les détails de votre mission pour {technician.first_name} {technician.last_name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mission Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Détails de la mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Informations client
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Entreprise *
                        </label>
                        <Input
                          value={clientCompany}
                          onChange={(e) => setClientCompany(e.target.value)}
                          placeholder="Nom de votre entreprise"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contacts
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Contact sur site *
                          </label>
                          <Input
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="+33 6 XX XX XX XX"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Équipe commerciale
                          </label>
                          <Input
                            value={salesTeamNumber}
                            onChange={(e) => setSalesTeamNumber(e.target.value)}
                            placeholder="+33 1 XX XX XX XX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Lieu de la mission
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Adresse complète *
                        </label>
                        <Input
                          value={missionLocation}
                          onChange={(e) => setMissionLocation(e.target.value)}
                          placeholder="Adresse complète de la mission"
                          required
                        />
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Planification
                      </h3>
                      
                       <div className="grid md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium mb-2">
                             Période de mission *
                           </label>
                           <WeekdayRangePicker
                             value={missionDateRange}
                             onChange={setMissionDateRange}
                             minDate={new Date()}
                             placeholder="Sélectionner une période"
                           />
                         </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Heure préférée
                          </label>
                          <select
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background"
                          >
                            <option value="">Flexible</option>
                            <option value="08:00">08:00</option>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mission Description */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description de la mission
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Urgence
                        </label>
                        <select
                          value={urgency}
                          onChange={(e) => setUrgency(e.target.value)}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="low">Faible - Planifié</option>
                          <option value="normal">Normal - Standard</option>
                          <option value="high">Élevée - Urgent</option>
                          <option value="critical">Critique - Intervention immédiate</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Détails de la mission *
                        </label>
                        <Textarea
                          value={missionDescription}
                          onChange={(e) => setMissionDescription(e.target.value)}
                          placeholder="Décrivez précisément la mission : type de robot, problème rencontré, maintenance préventive, installation, formation, etc."
                          rows={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Information importante</p>
                        <p>Le technicien recevra une notification avec tous ces détails et pourra accepter ou refuser la mission via son calendrier.</p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="book" 
                      size="lg" 
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? 'Envoi en cours...' : 'Envoyer la demande de mission'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Technician Summary */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Technicien sélectionné</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                      {technician.profile_photo_url ? (
                        <img 
                          src={technician.profile_photo_url} 
                          alt={`${technician.first_name} ${technician.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-lg">
                          {technician.first_name[0]}{technician.last_name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{technician.first_name} {technician.last_name}</div>
                      <div className="text-sm text-muted-foreground">{technician.city}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">€75/hr</div>
                    <div className="text-xs text-muted-foreground">Tarif de base</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-3">Processus de validation</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Envoi de votre demande</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span>Notification au technicien</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span>Validation dans son calendrier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span>Confirmation de la mission</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}