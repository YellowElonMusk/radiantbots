import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Wrench } from 'lucide-react';
import type { Technician } from '@/lib/store';

interface TechCardProps {
  technician: Technician;
  onViewProfile: (id: string) => void;
  onBookNow: (id: string) => void;
}

export function TechCard({ technician, onViewProfile, onBookNow }: TechCardProps) {
  const handleCardClick = () => {
    onViewProfile(technician.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookNow(technician.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-card rounded-xl border border-border/50 hover:border-primary/30 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      {/* Card Header with Photo */}
      <div className="relative h-48 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Wrench className="h-12 w-12 text-white" />
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{technician.rating}</span>
          </div>
        </div>

        {/* Available Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-accent/90 text-accent-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Available
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {technician.name}
          </h3>
          
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{technician.city}</span>
            <span className="text-sm">•</span>
            <span className="text-sm">{technician.experience} experience</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {technician.bio}
          </p>
        </div>

        {/* Brand Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {technician.brands.slice(0, 3).map((brand) => (
            <Badge key={brand} variant="outline" className="text-xs">
              {brand}
            </Badge>
          ))}
          {technician.brands.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{technician.brands.length - 3} more
            </Badge>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-4">
          {technician.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="inline-block px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {technician.skills.length > 2 && (
            <span className="inline-block px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
              +{technician.skills.length - 2} skills
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <span className="text-muted-foreground">
            {technician.completedJobs} jobs completed
          </span>
          <span className="font-semibold text-primary">
            Starting at €{technician.rate}/hr
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleCardClick}
          >
            View Profile
          </Button>
          <Button 
            variant="book" 
            size="sm" 
            className="flex-1"
            onClick={handleBookClick}
          >
            <Clock className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}