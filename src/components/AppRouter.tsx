import { useState } from 'react';
import { Landing } from './Landing';
import { Catalog } from './Catalog';
import { Profile } from './Profile';
import { BookingForm } from './BookingForm';
import { Confirmation } from './Confirmation';
import { Messages } from './Messages';
import { Bootcamp } from './Bootcamp';
import { TechnicianRegistration } from './TechnicianRegistration';
import { TechnicianLogin } from './TechnicianLogin';
import { TechnicianDashboard } from './TechnicianDashboard';
import { LanguageToggle } from './LanguageToggle';
import { Header } from './Header';

type Page = 'landing' | 'catalog' | 'profile' | 'booking' | 'confirmation' | 'messages' | 'bootcamp' | 'registration' | 'technician-login' | 'technician-dashboard';

interface PageData {
  technicianId?: string;
  bookingId?: string;
}

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageData, setPageData] = useState<PageData>({});

  const navigate = (page: Page, data?: PageData) => {
    setCurrentPage(page);
    setPageData(data || {});
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={navigate} />;
      
      case 'catalog':
        return <Catalog onNavigate={navigate} />;
      
      case 'profile':
        return (
          <Profile 
            technicianId={pageData.technicianId!} 
            onNavigate={navigate} 
          />
        );
      
      case 'booking':
        return (
          <BookingForm 
            technicianId={pageData.technicianId!} 
            onNavigate={navigate} 
          />
        );
      
      case 'confirmation':
        return (
          <Confirmation 
            bookingId={pageData.bookingId!} 
            onNavigate={navigate} 
          />
        );
      
      case 'messages':
        return (
          <Messages 
            bookingId={pageData.bookingId!} 
            onNavigate={navigate} 
          />
        );
      
      case 'bootcamp':
        return <Bootcamp onNavigate={navigate} />;
      
      case 'registration':
        return <TechnicianRegistration onNavigate={navigate} />;
      
      case 'technician-login':
        return <TechnicianLogin onNavigate={navigate} />;
      
      case 'technician-dashboard':
        return <TechnicianDashboard onNavigate={navigate} />;
      
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNavigate={navigate} />
      <LanguageToggle />
      {renderPage()}
    </div>
  );
}