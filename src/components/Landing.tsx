import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Wrench, Clock } from 'lucide-react';
import { store } from '@/lib/store';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import type { Technician } from '@/lib/store';

interface LandingProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [featuredTechs, setFeaturedTechs] = useState<Technician[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Clear any fake data and start fresh
    store.initializeStore();
    
    // Get technicians (will be empty until real registrations)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pt-20">
      <Header onNavigate={onNavigate} />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 text-sm font-medium">
                {t('landing.trusted')}
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
              {t('landing.hero.title')}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleFindTechnician}
                className="text-lg px-8 py-6 h-auto"
              >
                <Wrench className="mr-2 h-5 w-5" />
                {t('landing.hero.findTech')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onNavigate('bootcamp')}
                className="text-lg px-8 py-6 h-auto"
              >
                {t('landing.hero.becomeTech')}
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => onNavigate('technician-login')}
                className="text-lg px-8 py-6 h-auto"
              >
                Technician Login
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">{t('landing.stats.technicians')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15min</div>
                <div className="text-sm text-muted-foreground">{t('landing.stats.response')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">{t('landing.stats.success')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Technicians */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('landing.featured.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.featured.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredTechs.length > 0 ? featuredTechs.map((tech) => (
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
                    {t('landing.featured.bookNow')}
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 md:col-span-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{t('landing.featured.noTechs')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('landing.featured.noTechsDesc')}
                </p>
                <Button variant="outline" onClick={() => onNavigate('bootcamp')}>
                  {t('landing.featured.registerFirst')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
            <p className="text-muted-foreground">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('landing.howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.howItWorks.step1.desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('landing.howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.howItWorks.step2.desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('landing.howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.howItWorks.step3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}