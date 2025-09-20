import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Clock, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianProfileProps {
  technicianId: string;
  onBack: () => void;
  onMessage?: () => void;
}

interface TechnicianProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  hourly_rate?: number;
  profile_photo_url?: string;
  city?: string;
  postal_code?: string;
  regions?: string[];
  robot_brands?: string[];
  robot_models?: string[];
  linkedin_url?: string;
  max_travel_distance?: number;
  accepts_travel?: boolean;
}

export function TechnicianProfile({ technicianId, onBack, onMessage }: TechnicianProfileProps) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadSkillsAndBrands();
  }, [technicianId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', technicianId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSkillsAndBrands = async () => {
    try {
      // Load skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('technician_skills')
        .select(`
          skills (
            name
          )
        `)
        .eq('user_id', technicianId);

      if (skillsError) throw skillsError;
      setSkills(skillsData?.map(item => item.skills.name) || []);

      // Load brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('technician_brands')
        .select(`
          brands (
            name
          )
        `)
        .eq('user_id', technicianId);

      if (brandsError) throw brandsError;
      setBrands(brandsData?.map(item => item.brands.name) || []);
    } catch (error) {
      console.error('Error loading skills and brands:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profil non trouvé</h3>
        <p className="text-gray-600">Ce profil de technicien n'existe pas ou n'est plus accessible.</p>
        <Button onClick={onBack} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        {onMessage && (
          <Button onClick={onMessage}>
            Envoyer un message
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profile_photo_url} />
              <AvatarFallback className="text-2xl">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                {profile.city && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city} {profile.postal_code}</span>
                  </div>
                )}
                
                {profile.hourly_rate && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold text-primary">{profile.hourly_rate}€/heure</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Availability */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.phone && (
              <div>
                <span className="text-sm text-gray-600">Téléphone:</span>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
            
            {profile.email && (
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{profile.email}</p>
              </div>
            )}
            
            {profile.linkedin_url && (
              <div>
                <span className="text-sm text-gray-600">LinkedIn:</span>
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Voir le profil
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Zone d'intervention</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.max_travel_distance && (
              <div>
                <span className="text-sm text-gray-600">Distance max:</span>
                <p className="font-medium">{profile.max_travel_distance} km</p>
              </div>
            )}
            
            <div>
              <span className="text-sm text-gray-600">Accepte les déplacements:</span>
              <p className="font-medium">
                {profile.accepts_travel ? 'Oui' : 'Non'}
              </p>
            </div>

            {profile.regions && profile.regions.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 block mb-2">Régions:</span>
                <div className="flex flex-wrap gap-1">
                  {profile.regions.map((region, index) => (
                    <Badge key={index} variant="outline">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills & Expertise */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Compétences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune compétence renseignée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Marques spécialisées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(brands.length > 0 || (profile.robot_brands && profile.robot_brands.length > 0)) ? (
              <div className="flex flex-wrap gap-2">
                {brands.map((brand, index) => (
                  <Badge key={`db-${index}`} variant="outline">
                    {brand}
                  </Badge>
                ))}
                {profile.robot_brands?.map((brand, index) => (
                  <Badge key={`profile-${index}`} variant="outline">
                    {brand}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune marque spécialisée renseignée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Robot Models */}
      {profile.robot_models && profile.robot_models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Modèles de robots maîtrisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.robot_models.map((model, index) => (
                <Badge key={index} variant="outline">
                  {model}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}