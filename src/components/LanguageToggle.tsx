import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90"
    >
      {language === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
    </Button>
  );
}