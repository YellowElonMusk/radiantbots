import radiantbotsLogo from '@/assets/radiantbots-logo.png';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="focus:outline-none"
          >
            <img 
              src={radiantbotsLogo} 
              alt="Radiantbots" 
              className="h-72 w-auto hover:opacity-80 transition-opacity"
            />
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('catalog')}
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              {t('header.findTechnician')}
            </button>
            <button 
              onClick={() => onNavigate('bootcamp')}
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              {t('header.bootcamp')}
            </button>
            <button 
              onClick={() => onNavigate('registration')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {t('header.becomeTech')}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}