import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { WeekdayRangePicker } from '@/components/ui/weekday-range-picker';
import { TechCard } from './TechCard';

import { store } from '@/lib/store';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Technician } from '@/lib/store';
import { ArrowLeft, Search, Filter, MapPin, Star, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CatalogProps {
  onNavigate: (page: string, data?: any) => void;
}

interface TechnicianData {
  id: string;
  user_id: string;
  name: string;
  first_name: string;
  last_name: string;
  city: string;
  rating: number;
  rate: number;
  brands: string[];
  skills: string[];
  bio: string;
  photo: string;
  experience: string;
  completedJobs: number;
  acceptsTravel: boolean;
  maxTravelDistance: number;
}

interface SearchCriteria {
  deploymentCity: string;
  missionDateRange: {
    start_date: string;
    end_date: string;
    selected_weekdays: string[];
    weekend_excluded: boolean;
    count_weekdays: number;
  } | null;
  dateFlexible: boolean;
}

export function Catalog({ onNavigate }: CatalogProps) {
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [filteredTechs, setFilteredTechs] = useState<TechnicianData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    deploymentCity: '',
    missionDateRange: null,
    dateFlexible: false
  });
  const [missionTypes, setMissionTypes] = useState<string[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianData | null>(null);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const { t } = useLanguage();

  // Get unique values for filters
  const [locations, setLocations] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    loadTechnicians();
    loadMissionTypes();
  }, []);

  const loadMissionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('mission_types')
        .select('name')
        .order('name');
      
      if (error) {
        console.error('Error loading mission types:', error);
        return;
      }

      setMissionTypes(data?.map(item => item.name) || []);
    } catch (error) {
      console.error('Error loading mission types:', error);
    }
  };

  const fakeTechnicians: TechnicianData[] = [
    {
      id: 'fake_tech_1',
      user_id: 'fake_tech_1',
      name: 'Alexandre Dupont',
      first_name: 'Alexandre',
      last_name: 'Dupont',
      city: 'Paris',
      rating: 4.9,
      rate: 75,
      brands: ['ABB', 'KUKA', 'Fanuc'],
      skills: ['Programmation', 'Maintenance préventive', 'Diagnostic'],
      bio: 'Ingénieur robotique avec 8 ans d\'expérience dans l\'automatisation industrielle. Spécialisé dans la programmation et la maintenance de robots industriels.',
      photo: 'https://i.pravatar.cc/150?img=1',
      experience: '8+ ans',
      completedJobs: 127,
      acceptsTravel: true,
      maxTravelDistance: 200
    },
    {
      id: 'fake_tech_2',
      user_id: 'fake_tech_2',
      name: 'Sophie Martin',
      first_name: 'Sophie',
      last_name: 'Martin',
      city: 'Lyon',
      rating: 4.8,
      rate: 65,
      brands: ['Universal Robots', 'ABB', 'Yaskawa'],
      skills: ['Cobotique', 'Intégration système', 'Formation'],
      bio: 'Experte en robotique collaborative avec une approche centrée sur la sécurité et l\'ergonomie. Formatrice certifiée Universal Robots.',
      photo: 'https://i.pravatar.cc/150?img=5',
      experience: '6+ ans',
      completedJobs: 94,
      acceptsTravel: true,
      maxTravelDistance: 150
    },
    {
      id: 'fake_tech_3',
      user_id: 'fake_tech_3',
      name: 'Thomas Leroy',
      first_name: 'Thomas',
      last_name: 'Leroy',
      city: 'Toulouse',
      rating: 4.7,
      rate: 60,
      brands: ['Fanuc', 'Mitsubishi', 'Denso'],
      skills: ['Soudage robotisé', 'Vision artificielle', 'Calibrage'],
      bio: 'Technicien spécialisé dans les applications de soudage robotisé et les systèmes de vision. Expert en calibrage haute précision.',
      photo: 'https://i.pravatar.cc/150?img=3',
      experience: '7+ ans',
      completedJobs: 156,
      acceptsTravel: false,
      maxTravelDistance: 50
    },
    {
      id: 'fake_tech_4',
      user_id: 'fake_tech_4',
      name: 'Marie Dubois',
      first_name: 'Marie',
      last_name: 'Dubois',
      city: 'Marseille',
      rating: 4.9,
      rate: 70,
      brands: ['KUKA', 'Staubli', 'Epson'],
      skills: ['Palettisation', 'Manipulation', 'Optimisation trajectoires'],
      bio: 'Ingénieure spécialisée dans les systèmes de palettisation et manipulation. Reconnue pour ses solutions d\'optimisation de trajectoires.',
      photo: 'https://i.pravatar.cc/150?img=9',
      experience: '5+ ans',
      completedJobs: 78,
      acceptsTravel: true,
      maxTravelDistance: 300
    },
    {
      id: 'fake_tech_5',
      user_id: 'fake_tech_5',
      name: 'Pierre Moreau',
      first_name: 'Pierre',
      last_name: 'Moreau',
      city: 'Lille',
      rating: 4.6,
      rate: 55,
      brands: ['Universal Robots', 'Doosan', 'Techman'],
      skills: ['Installation', 'Dépannage d\'urgence', 'Mise en service'],
      bio: 'Technicien de terrain expérimenté, spécialisé dans l\'installation et le dépannage d\'urgence. Disponible 24h/24 pour les interventions critiques.',
      photo: 'https://i.pravatar.cc/150?img=7',
      experience: '10+ ans',
      completedJobs: 203,
      acceptsTravel: true,
      maxTravelDistance: 400
    },
    {
      id: 'fake_tech_6',
      user_id: 'fake_tech_6',
      name: 'Camille Rousseau',
      first_name: 'Camille',
      last_name: 'Rousseau',
      city: 'Nantes',
      rating: 4.8,
      rate: 68,
      brands: ['ABB', 'Fanuc', 'Kawasaki'],
      skills: ['Peinture robotisée', 'Environnement propre', 'Automatisation'],
      bio: 'Spécialiste des applications de peinture robotisée et des environnements propres. Experte en automatisation de processus complexes.',
      photo: 'https://i.pravatar.cc/150?img=16',
      experience: '6+ ans',
      completedJobs: 89,
      acceptsTravel: true,
      maxTravelDistance: 250
    },
    {
      id: 'fake_tech_7',
      user_id: 'fake_tech_7',
      name: 'Julien Bernard',
      first_name: 'Julien',
      last_name: 'Bernard',
      city: 'Strasbourg',
      rating: 4.7,
      rate: 62,
      brands: ['KUKA', 'Universal Robots', 'Franka Emika'],
      skills: ['R&D', 'Prototypage', 'IA robotique'],
      bio: 'Ingénieur R&D passionné par l\'innovation en robotique. Spécialisé dans le prototypage rapide et l\'intégration d\'IA dans les systèmes robotiques.',
      photo: 'https://i.pravatar.cc/150?img=11',
      experience: '4+ ans',
      completedJobs: 45,
      acceptsTravel: false,
      maxTravelDistance: 100
    },
    {
      id: 'fake_tech_8',
      user_id: 'fake_tech_8',
      name: 'Amélie Garnier',
      first_name: 'Amélie',
      last_name: 'Garnier',
      city: 'Bordeaux',
      rating: 4.9,
      rate: 72,
      brands: ['Yaskawa', 'Mitsubishi', 'Omron'],
      skills: ['Logistique automatisée', 'Convoyage', 'Système WMS'],
      bio: 'Experte en logistique automatisée et systèmes de convoyage. Spécialisée dans l\'intégration de robots avec les systèmes WMS.',
      photo: 'https://i.pravatar.cc/150?img=20',
      experience: '7+ ans',
      completedJobs: 112,
      acceptsTravel: true,
      maxTravelDistance: 180
    },
    {
      id: 'fake_tech_9',
      user_id: 'fake_tech_9',
      name: 'Nicolas Petit',
      first_name: 'Nicolas',
      last_name: 'Petit',
      city: 'Nice',
      rating: 4.8,
      rate: 58,
      brands: ['Staubli', 'Epson', 'Denso'],
      skills: ['Assemblage précision', 'Micromécanique', 'Contrôle qualité'],
      bio: 'Technicien haute précision spécialisé dans l\'assemblage micromécanique et le contrôle qualité automatisé. Expert en applications médicales.',
      photo: 'https://i.pravatar.cc/150?img=14',
      experience: '9+ ans',
      completedJobs: 167,
      acceptsTravel: true,
      maxTravelDistance: 120
    }
  ];

  const loadTechnicians = async () => {
    try {
      // Use fake technicians instead of real database data
      setTechnicians(fakeTechnicians);
      setFilteredTechs(fakeTechnicians);

      // Extract unique locations and brands from fake data
      const uniqueLocations = [...new Set(fakeTechnicians.map(tech => tech.city))].sort();
      const uniqueBrands = [...new Set(fakeTechnicians.flatMap(tech => tech.brands))].sort();
      
      setLocations(uniqueLocations);
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = technicians;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(tech => tech.city === selectedLocation);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(tech =>
        selectedBrands.some(brand => tech.brands.includes(brand))
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(tech => tech.rating >= minRating);
    }

    // Sort by rating (highest first)
    filtered.sort((a, b) => b.rating - a.rating);

    setFilteredTechs(filtered);
  }, [technicians, searchQuery, selectedLocation, selectedBrands, minRating]);

  const handleBack = () => {
    onNavigate('landing');
  };

  const handleViewProfile = (technicianId: string) => {
    onNavigate('profile', { technicianId });
  };

  const handleBookNow = (technicianId: string) => {
    if (technicianId.startsWith('fake_tech_')) {
      // For fake profiles, redirect to quote request
      const technician = fakeTechnicians.find(t => t.id === technicianId);
      onNavigate('request-quote', { technicianName: technician?.name });
    } else {
      // For real profiles, use normal booking flow
      onNavigate('mission-booking', { technicianId });
    }
  };


  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedBrands([]);
    setMinRating(0);
    setSearchCriteria({
      deploymentCity: '',
      missionDateRange: null,
      dateFlexible: false
    });
  };

  const handleAdvancedSearch = async () => {
    console.log('Starting advanced search with criteria:', searchCriteria);
    
    // Start with all technicians
    let filtered = technicians;

    // Filter by city with improved logic
    if (searchCriteria.deploymentCity) {
      const requestedCity = searchCriteria.deploymentCity.toLowerCase().trim();
      
      filtered = filtered.filter(tech => {
        const techCity = tech.city.toLowerCase().trim();
        
        // Exact or partial city match (local technician)
        if (techCity.includes(requestedCity) || requestedCity.includes(techCity)) {
          return true;
        }
        
        // Technician accepts travel and has specified max distance
        if (tech.acceptsTravel && tech.maxTravelDistance > 0) {
          return true;
        }
        
        return false;
      });
    }

    // Filter by availability periods if date range is selected
    if (searchCriteria.missionDateRange) {
      const { start_date, end_date } = searchCriteria.missionDateRange;
      
      try {
        // Query availability periods that overlap with the requested range
        const { data: availabilityPeriods, error } = await supabase
          .from('availability_periods')
          .select('user_id')
          .lte('start_date', end_date)
          .gte('end_date', start_date);

        if (error) {
          console.error('Error querying availability periods:', error);
        } else {
          console.log('Found availability periods:', availabilityPeriods);
          
          // Filter technicians to only include those with availability
          const availableUserIds = new Set(availabilityPeriods?.map(ap => ap.user_id) || []);
          filtered = filtered.filter(tech => availableUserIds.has(tech.user_id));
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    }

    console.log('Filtered technicians:', filtered.length);
    setFilteredTechs(filtered);
  };

  const hasActiveFilters = searchQuery || selectedLocation || selectedBrands.length > 0 || minRating > 0 || 
    searchCriteria.deploymentCity || searchCriteria.missionDateRange;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTechs.length} {t('catalog.available')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Advanced Search Bar */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recherche de technicien spécialisée
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deployment City */}
                <div>
                  <Label htmlFor="deploymentCity">Ville de déploiement *</Label>
                  <Input
                    id="deploymentCity"
                    placeholder="Ville"
                    value={searchCriteria.deploymentCity}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, deploymentCity: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mission Date Range */}
                <div>
                  <Label>Période de mission</Label>
                  <WeekdayRangePicker
                    value={searchCriteria.missionDateRange}
                    onChange={(range) => setSearchCriteria(prev => ({ ...prev, missionDateRange: range }))}
                    minDate={new Date()}
                    placeholder="Sélectionner une période"
                  />
                </div>

                {/* Date Flexibility */}
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="dateFlexible"
                    checked={searchCriteria.dateFlexible}
                    onCheckedChange={(checked) => setSearchCriteria(prev => ({ ...prev, dateFlexible: checked as boolean }))}
                  />
                  <Label htmlFor="dateFlexible">
                    Dates flexibles (+/- 1-2 jours)
                  </Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAdvancedSearch} className="min-w-32">
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {t('catalog.filters')}
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    {t('catalog.clearAll')}
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">{t('catalog.search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('catalog.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('catalog.location')}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">{t('catalog.allLocations')}</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">{t('catalog.robotBrands')}</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {t('catalog.minRating')}
                </label>
                <div className="space-y-2">
                  {[0, 4.5, 4.7, 4.8, 4.9].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="rounded-full border-border"
                      />
                      <span className="text-sm">
                        {rating === 0 ? t('catalog.anyRating') : `${rating}+ ${t('catalog.stars')}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <h4 className="font-medium mb-3">{t('catalog.activeFilters')}</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation && (
                    <Badge variant="secondary" className="text-xs">
                      📍 {selectedLocation}
                    </Badge>
                  )}
                  {selectedBrands.map(brand => (
                    <Badge key={brand} variant="secondary" className="text-xs">
                      🤖 {brand}
                    </Badge>
                  ))}
                  {minRating > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ⭐ {minRating}+ {t('catalog.stars')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {filteredTechs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{t('catalog.noResults')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('catalog.noResultsDesc')}
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  {t('catalog.clearFilters')}
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTechs.map(technician => (
                  <TechCard
                    key={technician.id}
                    technician={technician}
                    onViewProfile={handleViewProfile}
                    onBookNow={handleBookNow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}