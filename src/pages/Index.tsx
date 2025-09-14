import { AppRouter } from '@/components/AppRouter';
import { LanguageProvider } from '@/contexts/LanguageContext';

const Index = () => {
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
};

export default Index;
