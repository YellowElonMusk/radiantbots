import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TechCard } from './TechCard';
import { store } from '@/lib/store';
import type { Technician } from '@/lib/store';
import { ArrowLeft, Search, Filter, MapPin, Star } from 'lucide-react';

interface CatalogProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Catalog({ onNavigate }: CatalogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechs, setFilteredTechs] = useState<Technician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  // Get unique values for filters
  const [locations, setLocations] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const allTechs = store.getTechnicians();
    setTechnicians(allTechs);
    setFilteredTechs(allTechs);

    // Extract unique locations and brands
    const uniqueLocations = [...new Set(allTechs.map(tech => tech.city))].sort();
    const uniqueBrands = [...new Set(allTechs.flatMap(tech => tech.brands))].sort();
    
    setLocations(uniqueLocations);
    setBrands(uniqueBrands);
  }, []);

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
    onNavigate('booking', { technicianId });
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
  };

  const hasActiveFilters = searchQuery || selectedLocation || selectedBrands.length > 0 || minRating > 0;

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
              <h1 className="text-2xl font-bold">Find a Technician</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTechs.length} technicians available
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name, skills, or keywords..."
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
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">All locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Robot Brands</label>
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
                  Minimum Rating
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
                        {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="bg-card rounded-xl p-4 border border-border/50">
                <h4 className="font-medium mb-3">Active Filters</h4>
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
                      ⭐ {minRating}+ stars
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
                <h3 className="font-semibold mb-2">No technicians found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
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