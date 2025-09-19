import { Card } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';

interface AccountTypeSelectionProps {
  onNavigate: (page: string) => void;
}

export function AccountTypeSelection({ onNavigate }: AccountTypeSelectionProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            {t('accountType.badge')}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('accountType.title')}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card 
            className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate('enterprise-registration')}
          >
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-4xl">🏢</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">{t('accountType.enterprise.title')}</h3>
            <p className="text-gray-600 font-medium">
              {t('accountType.enterprise.description')}
            </p>
          </Card>

          <Card 
            className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate('registration')}
          >
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-4xl">👨‍💻</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">{t('accountType.freelance.title')}</h3>
            <p className="text-gray-600 font-medium">
              {t('accountType.freelance.description')}
            </p>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            {t('accountType.alreadyHaveAccount')} <button onClick={() => onNavigate('login-type-selection')} className="text-blue-600 hover:underline">{t('accountType.signIn')}</button>
          </p>
        </div>
      </div>
    </div>
  );
}