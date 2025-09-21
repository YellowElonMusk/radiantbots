import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { ReservedTechnicians } from './ReservedTechnicians';
import { EnterpriseMessaging } from './EnterpriseMessaging';
import { MissionTracking } from './MissionTracking';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { TechnicianProfile } from './TechnicianProfile';

interface EnterpriseDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnterpriseDashboard({ onNavigate }: EnterpriseDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [acceptedTechnicians, setAcceptedTechnicians] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'messaging' | 'profile' | 'missions'>('dashboard');
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    regions: [] as string[],
    robot_brands: [] as string[],
    robot_models: [] as string[],
    description: ''
  });
  const [newRegion, setNewRegion] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const { toast } = useToast();
  const { unreadCount } = useUnreadMessages(user?.id);

  // Mark all messages as read when clicking Messages tab
  const handleMessagesTabClick = async () => {
    if (user?.id && unreadCount > 0) {
      // Mark all unread messages as read for this user
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .is('read_at', null);
      
      if (unreadMessages && unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(m => m.id);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', messageIds);
      }
    }
    setCurrentView('dashboard');
  };

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Check user role from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setUserProfile(profileData);
        
        // Load existing profile data into form
        if (profileData) {
          setProfile({
            company_name: profileData.company_name || '',
            contact_person: profileData.contact_person || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            city: profileData.city || '',
            postal_code: profileData.postal_code || '',
            regions: profileData.regions || [],
            robot_brands: profileData.robot_brands || [],
            robot_models: profileData.robot_models || [],
            description: profileData.description || ''
          });
        }
        
        // Check accepted missions with specific technicians
        await checkAcceptedMissions(currentUser.id);
        
        // Redirect if user is not a client/enterprise
        if (profileData?.role !== 'client') {
          toast({
            title: "Accès refusé",
            description: "Cette page est réservée aux entreprises.",
            variant: "destructive"
          });
          if (profileData?.role === 'technician') {
            onNavigate('technician-dashboard');
          } else {
            onNavigate('home');
          }
          return;
        }
      }
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          initializeUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onNavigate, toast]);

  const checkAcceptedMissions = async (userId: string) => {
    try {
      const { data: missions, error } = await supabase
        .from('missions')
        .select(`
          id,
          technician_id,
          profiles!missions_technician_id_fkey(
            user_id,
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('client_user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error checking missions:', error);
        return;
      }

      // Get unique technicians who have accepted missions
      const uniqueTechnicians = missions?.reduce((acc: any[], mission: any) => {
        const existing = acc.find(tech => tech.user_id === mission.technician_id);
        if (!existing && mission.profiles) {
          acc.push({
            user_id: mission.technician_id,
            first_name: mission.profiles.first_name,
            last_name: mission.profiles.last_name,
            profile_photo_url: mission.profiles.profile_photo_url
          });
        }
        return acc;
      }, []) || [];

      setAcceptedTechnicians(uniqueTechnicians);
    } catch (error) {
      console.error('Error checking accepted missions:', error);
    }
  };

  const handleAddItem = (type: 'regions' | 'robot_brands' | 'robot_models', value: string, setter: (value: string) => void) => {
    if (value.trim() && !profile[type].includes(value.trim())) {
      setProfile(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setter('');
    }
  };

  const handleRemoveItem = (type: 'regions' | 'robot_brands' | 'robot_models', index: number) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: profile.company_name,
          contact_person: profile.contact_person,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postal_code: profile.postal_code,
          regions: profile.regions,
          robot_brands: profile.robot_brands,
          robot_models: profile.robot_models,
          description: profile.description,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profil sauvegardé",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle messaging view
  if (currentView === 'messaging' && selectedTechnician && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <EnterpriseMessaging
            technicianId={selectedTechnician}
            currentUserId={user.id}
            onBack={() => setCurrentView('dashboard')}
            onViewProfile={(technicianId) => {
              setSelectedTechnician(technicianId);
              setCurrentView('profile');
            }}
          />
        </div>
      </div>
    );
  }

  // Handle profile view
  if (currentView === 'profile' && selectedTechnician) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <TechnicianProfile
            technicianId={selectedTechnician}
            onBack={() => setCurrentView('dashboard')}
            onMessage={() => {
              setCurrentView('messaging');
            }}
          />
        </div>
      </div>
    );
  }

  // Handle mission tracking view
  if (currentView === 'missions' && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <MissionTracking
            currentUserId={user.id}
            onBack={() => setCurrentView('dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord Entreprise</h1>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error('Logout error:', error);
                } else {
                  // Clear any local state and navigate
                  setUser(null);
                  setUserProfile(null);
                  setAcceptedTechnicians([]);
                  onNavigate('landing');
                }
              } catch (error) {
                console.error('Logout failed:', error);
                // Force navigation even if logout fails
                onNavigate('landing');
              }
            }}
          >
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
            <TabsTrigger value="technicians">Techniciens Réservés</TabsTrigger>
            <TabsTrigger 
              value="messages" 
              disabled={acceptedTechnicians.length === 0} 
              className="flex items-center gap-2 relative"
              onClick={handleMessagesTabClick}
            >
              Messages {acceptedTechnicians.length === 0 && "(Verrouillé)"}
              {unreadCount > 0 && acceptedTechnicians.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  !
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="missions"
              onClick={() => setCurrentView('missions')}
            >
              Suivi des missions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Informations de l'entreprise</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company_name">Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    value={profile.company_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_person">Personne de contact</Label>
                  <Input
                    id="contact_person"
                    value={profile.contact_person}
                    onChange={(e) => setProfile(prev => ({ ...prev, contact_person: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={profile.postal_code}
                    onChange={(e) => setProfile(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>Régions d'activité</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ajouter une région"
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('regions', newRegion, setNewRegion)}
                  />
                  <Button onClick={() => handleAddItem('regions', newRegion, setNewRegion)}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.regions.map((region, index) => (
                    <Badge key={index} variant="secondary">
                      {region}
                      <button 
                        onClick={() => handleRemoveItem('regions', index)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Marques de robots</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ajouter une marque"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('robot_brands', newBrand, setNewBrand)}
                  />
                  <Button onClick={() => handleAddItem('robot_brands', newBrand, setNewBrand)}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.robot_brands.map((brand, index) => (
                    <Badge key={index} variant="secondary">
                      {brand}
                      <button 
                        onClick={() => handleRemoveItem('robot_brands', index)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Modèles de robots</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ajouter un modèle"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem('robot_models', newModel, setNewModel)}
                  />
                  <Button onClick={() => handleAddItem('robot_models', newModel, setNewModel)}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.robot_models.map((model, index) => (
                    <Badge key={index} variant="secondary">
                      {model}
                      <button 
                        onClick={() => handleRemoveItem('robot_models', index)}
                        className="ml-2 text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="description">Description de l'entreprise</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} className="mt-6">
                Sauvegarder le profil
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="technicians">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Techniciens réservés</h2>
              {user && (
                <ReservedTechnicians 
                  userId={user.id} 
                  onViewProfile={(technicianId) => {
                    setSelectedTechnician(technicianId);
                    setCurrentView('profile');
                  }}
                />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Messages avec les techniciens</h2>
              {acceptedTechnicians.length > 0 ? (
                <div className="space-y-4">
                  {acceptedTechnicians.map((technician) => (
                    <div 
                      key={technician.user_id} 
                      className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedTechnician(technician.user_id);
                        setCurrentView('messaging');
                      }}
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {technician.profile_photo_url ? (
                          <img 
                            src={technician.profile_photo_url} 
                            alt={`${technician.first_name} ${technician.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {technician.first_name?.[0]}{technician.last_name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{technician.first_name} {technician.last_name}</p>
                        <p className="text-sm text-gray-500">Cliquer pour voir les messages</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Fonctionnalité de messagerie verrouillée</p>
                  <p className="text-sm text-gray-400">
                    Envoyez une demande de mission à un technicien et attendez qu'elle soit acceptée pour débloquer la messagerie avec ce technicien.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}