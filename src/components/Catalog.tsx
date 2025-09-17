import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TechCard } from './TechCard';
import { store } from '@/lib/store';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Technician } from '@/lib/store';
import { ArrowLeft, Search, Filter, MapPin, Star, CalendarIcon, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CatalogProps {
  onNavigate: (page: string, data?: any) => void;
}

interface TechnicianData {
  id: string;
  name: string;
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
  missionDate: Date | undefined;
  dateFlexible: boolean;
  missionType: string;
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
    missionDate: undefined,
    dateFlexible: false,
    missionType: ''
  });
  const [missionTypes, setMissionTypes] = useState<string[]>([]);
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

  const loadTechnicians = async () => {
    try {
      // Get all profiles that have the required technician data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          bio,
          hourly_rate,
          profile_photo_url,
          city,
          accepts_travel,
          max_travel_distance
        `)
        .not('first_name', 'is', null)
        .not('last_name', 'is', null)
        .not('hourly_rate', 'is', null);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      if (!profiles?.length) {
        setTechnicians([]);
        setFilteredTechs([]);
        return;
      }

      // Get brands and skills for each technician
      const technicianPromises = profiles.map(async (profile) => {
        const [brandsResult, skillsResult] = await Promise.all([
          supabase
            .from('technician_brands')
            .select(`
              brands (name)
            `)
            .eq('user_id', profile.user_id),
          supabase
            .from('technician_skills')
            .select(`
              skills (name)
            `)
            .eq('user_id', profile.user_id)
        ]);

        const brands = brandsResult.data?.map((item: any) => item.brands?.name).filter(Boolean) || [];
        const skills = skillsResult.data?.map((item: any) => item.skills?.name).filter(Boolean) || [];

        return {
          id: profile.user_id,
          name: `${profile.first_name} ${profile.last_name}`,
          city: profile.city || 'Paris',
          rating: 4.8, // Default for now, could be calculated from reviews
          rate: Number(profile.hourly_rate) || 50,
          brands,
          skills,
          bio: profile.bio || '',
          photo: profile.profile_photo_url || '',
          experience: '5+ ans', // Default for now
          completedJobs: 0, // Real data will be tracked when booking system is implemented
          acceptsTravel: profile.accepts_travel || false,
          maxTravelDistance: profile.max_travel_distance || 0
        } as TechnicianData;
      });

      const allTechs = await Promise.all(technicianPromises);
      setTechnicians(allTechs);
      setFilteredTechs(allTechs);

      // Extract unique locations and brands
      const uniqueLocations = [...new Set(allTechs.map(tech => tech.city))].sort();
      const uniqueBrands = [...new Set(allTechs.flatMap(tech => tech.brands))].sort();
      
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
    onNavigate('mission-booking', { technicianId });
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
      missionDate: undefined,
      dateFlexible: false,
      missionType: ''
    });
  };

  const handleAdvancedSearch = () => {
    // Filter technicians based on search criteria
    let filtered = technicians;

    if (searchCriteria.deploymentCity) {
      filtered = filtered.filter(tech => 
        tech.city.toLowerCase() === searchCriteria.deploymentCity.toLowerCase() ||
        (tech.acceptsTravel && tech.maxTravelDistance > 0)
      );
    }

    setFilteredTechs(filtered);
    setShowAdvancedSearch(false);
  };

  const hasActiveFilters = searchQuery || selectedLocation || selectedBrands.length > 0 || minRating > 0 || 
    searchCriteria.deploymentCity || searchCriteria.missionType;

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {/* Mission Type */}
                <div>
                  <Label htmlFor="missionType">Type de mission</Label>
                  <Select 
                    value={searchCriteria.missionType} 
                    onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, missionType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {missionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mission Date */}
                <div>
                  <Label>Date de mission</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !searchCriteria.missionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {searchCriteria.missionDate ? format(searchCriteria.missionDate, "PPP") : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={searchCriteria.missionDate}
                        onSelect={(date) => setSearchCriteria(prev => ({ ...prev, missionDate: date }))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
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