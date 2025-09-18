import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Calendar as CalendarIcon, Settings, LogOut, Upload, Plus, X, Briefcase } from 'lucide-react';
import { MissionManagement } from './MissionManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TechnicianDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function TechnicianDashboard({ onNavigate }: TechnicianDashboardProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    bio: '',
    hourlyRate: '',
    profilePhotoUrl: ''
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    fr: {
      dashboard: "Tableau de Bord Technicien",
      profile: "Profil",
      availability: "Disponibilité",
      settings: "Paramètres",
      logout: "Déconnexion",
      name: "Nom complet",
      phone: "Téléphone",
      location: "Localisation",
      linkedin: "Profil LinkedIn",
      bio: "Biographie",
      skills: "Compétences",
      brands: "Marques de robots",
      hourlyRate: "Tarif horaire (€)",
      firstName: "Prénom",
      lastName: "Nom",
      uploadPhoto: "Télécharger une photo",
      addSkill: "Ajouter une compétence",
      addBrand: "Ajouter une marque",
      saveProfile: "Sauvegarder le profil",
      calendarTitle: "Calendrier de disponibilité",
      availableDays: "Jours disponibles",
      unavailableDays: "Jours indisponibles",
      clickToToggle: "Cliquez sur une date pour basculer sa disponibilité",
      profileSaved: "Profil sauvegardé avec succès!"
    },
    en: {
      dashboard: "Technician Dashboard",
      profile: "Profile",
      availability: "Availability",
      settings: "Settings",
      logout: "Logout",
      name: "Full name",
      phone: "Phone",
      location: "Location",
      linkedin: "LinkedIn profile",
      bio: "Biography",
      skills: "Skills",
      brands: "Robot brands",
      hourlyRate: "Hourly rate (€)",
      firstName: "First Name",
      lastName: "Last Name",
      uploadPhoto: "Upload photo",
      addSkill: "Add skill",
      addBrand: "Add brand",
      saveProfile: "Save profile",
      calendarTitle: "Availability calendar",
      availableDays: "Available days",
      unavailableDays: "Unavailable days",
      clickToToggle: "Click on a date to toggle availability",
      profileSaved: "Profile saved successfully!"
    }
  };

  const t = translations[language];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate('technician-login');
      return;
    }
    setUser(user);
    await loadUserProfile(user.id);
    await loadUserSkills(user.id);
    await loadUserBrands(user.id);
  };

  const loadUserProfile = async (userId: string) => {
    console.log('Loading profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }
    
    console.log('Profile data loaded:', data);

    if (data) {
      setProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || user?.user_metadata?.phone || '',
        linkedin: data.linkedin_url || '',
        bio: data.bio || user?.user_metadata?.bio || '',
        hourlyRate: data.hourly_rate ? data.hourly_rate.toString() : '',
        profilePhotoUrl: data.profile_photo_url || ''
      });
    } else if (user) {
      // If no profile exists, load from user metadata
      setProfile({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        linkedin: '',
        bio: user.user_metadata?.bio || '',
        hourlyRate: '',
        profilePhotoUrl: ''
      });
    }
  };

  const loadUserSkills = async (userId: string) => {
    const { data, error } = await supabase
      .from('technician_skills')
      .select(`
        skills (name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading skills:', error);
      return;
    }

    if (data) {
      setSkills(data.map((item: any) => item.skills.name));
    }
  };

  const loadUserBrands = async (userId: string) => {
    const { data, error } = await supabase
      .from('technician_brands')
      .select(`
        brands (name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading brands:', error);
      return;
    }

    if (data) {
      setBrands(data.map((item: any) => item.brands.name));
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('landing');
  };


  const addSkill = async () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim()) || !user) return;

    // First, create or get the skill
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .upsert({ name: newSkill.trim() })
      .select()
      .single();

    if (skillError) {
      console.error('Error creating skill:', skillError);
      return;
    }

    // Then, link it to the user
    const { error: linkError } = await supabase
      .from('technician_skills')
      .insert({ user_id: user.id, skill_id: skillData.id });

    if (linkError) {
      console.error('Error linking skill:', linkError);
      return;
    }

    setSkills(prev => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const addBrand = async () => {
    if (!newBrand.trim() || brands.includes(newBrand.trim()) || !user) return;

    // First, create or get the brand
    const { data: brandData, error: brandError } = await supabase
      .from('brands')
      .upsert({ name: newBrand.trim() })
      .select()
      .single();

    if (brandError) {
      console.error('Error creating brand:', brandError);
      return;
    }

    // Then, link it to the user
    const { error: linkError } = await supabase
      .from('technician_brands')
      .insert({ user_id: user.id, brand_id: brandData.id });

    if (linkError) {
      console.error('Error linking brand:', linkError);
      return;
    }

    setBrands(prev => [...prev, newBrand.trim()]);
    setNewBrand('');
  };

  const removeSkill = async (skill: string) => {
    if (!user) return;

    // First get the skill ID
    const { data: skillData } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skill)
      .single();

    if (!skillData) return;

    const { error } = await supabase
      .from('technician_skills')
      .delete()
      .eq('user_id', user.id)
      .eq('skill_id', skillData.id);

    if (error) {
      console.error('Error removing skill:', error);
      return;
    }

    setSkills(prev => prev.filter(s => s !== skill));
  };

  const removeBrand = async (brand: string) => {
    if (!user) return;

    // First get the brand ID
    const { data: brandData } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brand)
      .single();

    if (!brandData) return;

    const { error } = await supabase
      .from('technician_brands')
      .delete()
      .eq('user_id', user.id)
      .eq('brand_id', brandData.id);

    if (error) {
      console.error('Error removing brand:', error);
      return;
    }

    setBrands(prev => prev.filter(b => b !== brand));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        email: profile.email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        linkedin_url: profile.linkedin,
        bio: profile.bio,
        hourly_rate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : null,
        profile_photo_url: profile.profilePhotoUrl
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: t.profileSaved,
      });
    }
    
    setIsLoading(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;

    setIsLoading(true);

    try {
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      setProfile(prev => ({ ...prev, profilePhotoUrl: publicUrl }));
      
      // Save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          profile_photo_url: publicUrl,
          // Include other required fields to prevent constraint violations
          email: profile.email || user.email,
          first_name: profile.firstName,
          last_name: profile.lastName
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.dashboard}</h1>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={profile.profilePhotoUrl} />
              <AvatarFallback>
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName[0]}${profile.lastName[0]}` 
                  : <User className="h-4 w-4" />
                }
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {t.availability}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t.settings}
          </TabsTrigger>
        </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.profile}</CardTitle>
                <CardDescription>
                  Gérez vos informations professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profilePhotoUrl} />
                    <AvatarFallback>
                      {profile.firstName && profile.lastName 
                        ? `${profile.firstName[0]}${profile.lastName[0]}` 
                        : <User className="h-8 w-8" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                      {isLoading ? "Uploading..." : t.uploadPhoto}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t.firstName || "First Name"}</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t.lastName || "Last Name"}</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">{t.linkedin}</Label>
                    <Input
                      id="linkedin"
                      value={profile.linkedin}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">{t.hourlyRate}</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={profile.hourlyRate}
                      onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t.bio}</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>{t.skills}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder={t.addSkill}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>{t.brands}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder={t.addBrand}
                        onKeyPress={(e) => e.key === 'Enter' && addBrand()}
                      />
                      <Button onClick={addBrand} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {brands.map((brand, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {brand}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeBrand(brand)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : t.saveProfile}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <MissionManagement />
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.calendarTitle}</CardTitle>
                <CardDescription>{t.clickToToggle}</CardDescription>
              </CardHeader>
               <CardContent>
                 <AvailabilityCalendar userId={user?.id} />
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings}</CardTitle>
                <CardDescription>
                  Paramètres du compte et préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Les paramètres seront ajoutés ici...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}