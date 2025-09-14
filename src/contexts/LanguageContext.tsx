import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Landing page
    'landing.trusted': '🤖 Approuvé par 500+ Entreprises',
    'landing.hero.title': 'Réservez des Techniciens Robotiques Certifiés',
    'landing.hero.subtitle': 'N\'importe quand, N\'importe où. Connectez-vous avec des techniciens robotiques experts pour la maintenance, le dépannage et l\'optimisation système. Réservez instantanément comme chez le coiffeur.',
    'landing.hero.findTech': 'Trouver un Technicien',
    'landing.hero.becomeTech': 'Devenir un Technicien Robotique Certifié',
    'landing.stats.technicians': 'Techniciens',
    'landing.stats.response': 'Réponse Moy.',
    'landing.stats.success': 'Taux de Réussite',
    'landing.featured.title': 'Les Plus Réservés Cette Semaine',
    'landing.featured.subtitle': 'Rencontrez nos techniciens robotiques les mieux notés, approuvés par les entreprises leaders',
    'landing.featured.bookNow': 'Réserver Maintenant',
    'landing.howItWorks.title': 'Simple comme 1-2-3',
    'landing.howItWorks.subtitle': 'Réservez un support robotique expert en quelques minutes',
    'landing.howItWorks.step1.title': 'Parcourir et Filtrer',
    'landing.howItWorks.step1.desc': 'Trouvez des techniciens par localisation, marque de robot et expertise',
    'landing.howItWorks.step2.title': 'Réserver Instantanément',
    'landing.howItWorks.step2.desc': 'Choisissez votre créneau horaire et confirmez votre réservation en quelques secondes',
    'landing.howItWorks.step3.title': 'Obtenir de l\'Aide',
    'landing.howItWorks.step3.desc': 'Chattez avec votre technicien et suivez les progrès en temps réel',
  },
  en: {
    // Landing page
    'landing.trusted': '🤖 Trusted by 500+ Companies',
    'landing.hero.title': 'Book Certified Robotics Technicians',
    'landing.hero.subtitle': 'Anytime, Anywhere. Connect with expert robotics technicians for maintenance, troubleshooting, and system optimization. Book instantly like a haircut.',
    'landing.hero.findTech': 'Find a Technician',
    'landing.hero.becomeTech': 'Become a Certified Robotics Tech',
    'landing.stats.technicians': 'Technicians',
    'landing.stats.response': 'Avg Response',
    'landing.stats.success': 'Success Rate',
    'landing.featured.title': 'Most Booked This Week',
    'landing.featured.subtitle': 'Meet our top-rated robotics technicians trusted by leading companies',
    'landing.featured.bookNow': 'Book Now',
    'landing.howItWorks.title': 'Simple as 1-2-3',
    'landing.howItWorks.subtitle': 'Book expert robotics support in minutes',
    'landing.howItWorks.step1.title': 'Browse & Filter',
    'landing.howItWorks.step1.desc': 'Find technicians by location, robot brand, and expertise',
    'landing.howItWorks.step2.title': 'Book Instantly',
    'landing.howItWorks.step2.desc': 'Choose your time slot and confirm your booking in seconds',
    'landing.howItWorks.step3.title': 'Get Support',
    'landing.howItWorks.step3.desc': 'Chat with your technician and track progress in real-time',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}