import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Calendar as CalendarIcon, Settings, LogOut, Upload, Plus, X } from 'lucide-react';

interface TechnicianDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function TechnicianDashboard({ onNavigate }: TechnicianDashboardProps) {
  const { language } = useLanguage();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [profile, setProfile] = useState({
    name: '',
    photo: '',
    linkedin: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    brands: [] as string[],
    hourlyRate: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newBrand, setNewBrand] = useState('');

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

  const handleDateClick = (date: Date) => {
    const dateStr = date.toDateString();
    const isUnavailable = unavailableDates.some(d => d.toDateString() === dateStr);
    const isAvailable = selectedDates.some(d => d.toDateString() === dateStr);

    if (isUnavailable) {
      // Remove from unavailable, add to available
      setUnavailableDates(prev => prev.filter(d => d.toDateString() !== dateStr));
      setSelectedDates(prev => [...prev, date]);
    } else if (isAvailable) {
      // Remove from available, add to unavailable
      setSelectedDates(prev => prev.filter(d => d.toDateString() !== dateStr));
      setUnavailableDates(prev => [...prev, date]);
    } else {
      // Add to available
      setSelectedDates(prev => [...prev, date]);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const addBrand = () => {
    if (newBrand.trim() && !profile.brands.includes(newBrand.trim())) {
      setProfile(prev => ({
        ...prev,
        brands: [...prev.brands, newBrand.trim()]
      }));
      setNewBrand('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const removeBrand = (brand: string) => {
    setProfile(prev => ({
      ...prev,
      brands: prev.brands.filter(b => b !== brand)
    }));
  };

  const handleSaveProfile = () => {
    // Will be replaced with actual API call
    alert(t.profileSaved);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.dashboard}</h1>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={profile.photo} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={() => onNavigate('landing')}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t.profile}
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
                    <AvatarImage src={profile.photo} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {t.uploadPhoto}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.name}</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
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
                    <Label htmlFor="location">{t.location}</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
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
                      {profile.skills.map((skill, index) => (
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
                      {profile.brands.map((brand, index) => (
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

                <Button onClick={handleSaveProfile} className="w-full">
                  {t.saveProfile}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.calendarTitle}</CardTitle>
                <CardDescription>{t.clickToToggle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">{t.availableDays}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">{t.unavailableDays}</span>
                  </div>
                </div>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  onDayClick={handleDateClick}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    available: selectedDates,
                    unavailable: unavailableDates
                  }}
                  modifiersStyles={{
                    available: { backgroundColor: 'rgb(34, 197, 94)', color: 'white' },
                    unavailable: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
                  }}
                />
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