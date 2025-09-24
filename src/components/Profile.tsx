import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Star, MapPin, Clock, Award, MessageSquare, Calendar, Wrench, CheckCircle } from 'lucide-react';
import { TechnicianProfile } from './TechnicianProfile';

interface TechnicianProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  hourly_rate: number;
  profile_photo_url: string;
  brands: string[];
  skills: string[];
}

interface ProfileProps {
  technicianId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function Profile({ technicianId, onNavigate }: ProfileProps) {
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if this is a fake profile
    if (technicianId.startsWith('fake_tech_')) {
      // Use TechnicianProfile component for fake profiles
      return;
    }
    loadTechnician();
  }, [technicianId]);

  // If it's a fake profile, use the TechnicianProfile component
  if (technicianId.startsWith('fake_tech_')) {
    return (
      <TechnicianProfile 
        technicianId={technicianId} 
        onBack={() => onNavigate('catalog')}
        onNavigate={onNavigate}
      />
    );
  }

  const loadTechnician = async () => {
    try {
      setLoading(true);
      
      // Get technician profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', technicianId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Get technician brands
      const { data: technicianBrands, error: brandsError } = await supabase
        .from('technician_brands')
        .select(`
          brands (name)
        `)
        .eq('user_id', technicianId);

      // Get technician skills
      const { data: technicianSkills, error: skillsError } = await supabase
        .from('technician_skills')
        .select(`
          skills (name)
        `)
        .eq('user_id', technicianId);

      if (profile) {
        setTechnician({
          id: profile.id,
          user_id: profile.user_id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          city: profile.city || '',
          bio: profile.bio || '',
          hourly_rate: profile.hourly_rate || 0,
          profile_photo_url: profile.profile_photo_url || '',
          brands: technicianBrands?.map(tb => tb.brands?.name).filter(Boolean) || [],
          skills: technicianSkills?.map(ts => ts.skills?.name).filter(Boolean) || []
        });
      }
    } catch (error) {
      console.error('Error loading technician:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('profile.notFound')}</h2>
          <Button variant="outline" onClick={() => onNavigate('catalog')}>
            {t('profile.backToCatalog')}
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onNavigate('catalog');
  };

  const handleBookNow = () => {
    onNavigate('mission-booking', { technicianId });
  };

  const handleMessage = () => {
    // Navigate to messaging with the technician
    onNavigate('messaging-inbox', { technicianId: technician.user_id });
  };

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

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
              <h1 className="text-2xl font-bold">{technician.first_name} {technician.last_name}</h1>
              <p className="text-sm text-muted-foreground">{t('profile.roboticsTechnician')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {technician.profile_photo_url ? (
                      <img 
                        src={technician.profile_photo_url} 
                        alt={`${technician.first_name} ${technician.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Wrench className="h-16 w-16 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{technician.first_name} {technician.last_name}</h2>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{technician.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">4.9</span>
                            <span className="text-muted-foreground">(reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-accent font-medium">{t('profile.availableToday')}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">€{technician.hourly_rate}/hr</div>
                        <div className="text-sm text-muted-foreground">{t('profile.startingRate')}</div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{technician.bio}</p>
                    
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">Expérience certifiée</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">Missions accomplies</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('profile.about')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('profile.experience')}</h4>
                    <p className="text-muted-foreground">{technician.bio}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Contact</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {technician.email && <p>Email: {technician.email}</p>}
                      {technician.phone && <p>Téléphone: {technician.phone}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Brands */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('profile.skillsExpertise')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('profile.robotBrands')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.brands.length > 0 ? (
                        technician.brands.map((brand) => (
                          <Badge key={brand} variant="secondary" className="text-sm">
                            🤖 {brand}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune marque spécifiée</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('profile.technicalSkills')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.skills.length > 0 ? (
                        technician.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-sm">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune compétence spécifiée</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section (Static for demo) */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('profile.recentReviews')}</h3>
                <div className="space-y-4">
                  <div className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Sarah M.</span>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      "Excellent work fixing our warehouse robot navigation issues. Very professional and quick response time."
                    </p>
                  </div>
                  
                  <div className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Tech Corp</span>
                      <span className="text-sm text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      "Outstanding technical knowledge and problem-solving skills. Highly recommend!"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">{t('profile.book')} {technician.first_name}</h3>
                
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary mb-1">€{technician.hourly_rate}/hr</div>
                      <div className="text-sm text-muted-foreground">{t('profile.startingRate')}</div>
                    </div>

                    {/* Available Time Slots */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Disponibilité
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 text-left rounded-lg border border-border">
                          <div className="font-medium">Aujourd'hui</div>
                          <div className="text-sm text-muted-foreground">Disponible sur demande</div>
                        </div>
                        <div className="p-3 text-left rounded-lg border border-border">
                          <div className="font-medium">Demain</div>
                          <div className="text-sm text-muted-foreground">Créneaux libres</div>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Button 
                      variant="book" 
                      size="lg" 
                      className="w-full"
                      onClick={handleBookNow}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {t('profile.bookNow')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('profile.sendMessage')}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2">
                    💬 Free to message • ⚡ Instant booking • 🔒 Secure payment
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-3">{t('profile.responseTime')}</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">{t('profile.usuallyResponds')}</div>
                    <div className="text-sm text-muted-foreground">{t('profile.veryResponsive')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}