import radiantbotsLogo from '@/assets/radiantbots-logo-new.png';
import ukFlag from '@/assets/uk-flag.png';
import franceFlag from '@/assets/france-flag.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Menu, User as UserIcon, MessageCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSheetOpen(false);
    onNavigate('landing');
  };

  const handleMyProfile = () => {
    if (user) {
      setIsSheetOpen(false);
      onNavigate('technician-dashboard');
    }
  };

  const handlePreviewProfile = () => {
    if (user) {
      setIsSheetOpen(false);
      onNavigate('profile', { technicianId: user.id });
    }
  };

  const handleMessages = () => {
    setIsSheetOpen(false);
    onNavigate('messaging-inbox');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="focus:outline-none"
          >
            <img 
              src={radiantbotsLogo} 
              alt="Radiantbots" 
              className="h-16 w-auto hover:opacity-80 transition-opacity"
            />
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('account-type-selection')}
              className="bg-gradient-hero text-white px-6 py-2 rounded-lg hover:scale-105 shadow-button hover:shadow-hover transition-all duration-300 font-medium"
            >
              Créer mon compte
            </button>
            <button 
              onClick={() => onNavigate('technician-login')}
              className="text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 font-medium"
            >
              Me connecter
            </button>
            {user ? (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="py-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Menu</h2>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                        className="flex items-center gap-2 px-3 py-1.5 h-8 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90"
                      >
                        <img 
                          src={language === 'fr' ? franceFlag : ukFlag} 
                          alt={language === 'fr' ? 'French flag' : 'UK flag'}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                        <span className="text-sm font-medium">
                          {language === 'fr' ? 'FR' : 'EN'}
                        </span>
                      </Button>
                      
                      <hr className="my-2" />
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={handleMyProfile}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Mon Profil
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={handleMessages}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => {
                          setIsSheetOpen(false);
                          onNavigate('client-dashboard');
                        }}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        My Missions
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={handlePreviewProfile}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Preview Profil
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => {
                          setIsSheetOpen(false);
                          onNavigate('bootcamp');
                        }}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Formation
                      </Button>
                      
                      <hr className="my-4" />
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleLogout}
                      >
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}