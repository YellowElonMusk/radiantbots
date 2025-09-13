import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Wrench, Clock } from 'lucide-react';
import { store } from '@/lib/store';
import { seedTechnicians } from '@/lib/seed';
import type { Technician } from '@/lib/store';

interface LandingProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [featuredTechs, setFeaturedTechs] = useState<Technician[]>([]);

  useEffect(() => {
    // Seed data if needed
    store.seedData(seedTechnicians);
    
    // Get top 3 rated technicians for featured section
    const allTechs = store.getTechnicians();
    const featured = allTechs
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    setFeaturedTechs(featured);
  }, []);

  const handleFindTechnician = () => {
    onNavigate('catalog');
  };

  const handleTechClick = (tech: Technician) => {
    onNavigate('profile', { technicianId: tech.id });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 text-sm font-medium">
                🤖 Trusted by 500+ Companies
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
              Book Certified Robotics Technicians
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Anytime, Anywhere. Connect with expert robotics technicians for maintenance, 
              troubleshooting, and system optimization. Book instantly like a haircut.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleFindTechnician}
                className="text-lg px-8 py-6 h-auto"
              >
                <Wrench className="mr-2 h-5 w-5" />
                Find a Technician
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                How it Works
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Technicians</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15min</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Technicians */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Most Booked This Week</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet our top-rated robotics technicians trusted by leading companies
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredTechs.map((tech) => (
              <div
                key={tech.id}
                onClick={() => handleTechClick(tech)}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group border border-border/50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-primary mb-4 flex items-center justify-center">
                    <Wrench className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {tech.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{tech.city}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tech.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({tech.completedJobs} jobs)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tech.brands.slice(0, 2).map((brand) => (
                      <Badge key={brand} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-primary font-semibold mb-4">
                    Starting at €{tech.rate}/hr
                  </div>
                  
                  <Button variant="book" size="sm" className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple as 1-2-3</h2>
            <p className="text-muted-foreground">
              Book expert robotics support in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse & Filter</h3>
              <p className="text-muted-foreground">
                Find technicians by location, robot brand, and expertise
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Book Instantly</h3>
              <p className="text-muted-foreground">
                Choose your time slot and confirm your booking in seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Support</h3>
              <p className="text-muted-foreground">
                Chat with your technician and track progress in real-time
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}