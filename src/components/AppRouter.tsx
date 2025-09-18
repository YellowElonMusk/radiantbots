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
import { MissionBookingForm } from './MissionBookingForm';
import { MessagingInbox } from './MessagingInbox';
import { ClientDashboard } from './ClientDashboard';

import { Header } from './Header';

type Page = 'landing' | 'catalog' | 'profile' | 'booking' | 'confirmation' | 'messages' | 'bootcamp' | 'registration' | 'technician-login' | 'technician-dashboard' | 'mission-booking' | 'messaging-inbox' | 'client-dashboard';

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
      
      case 'mission-booking':
        return (
          <MissionBookingForm 
            technicianId={pageData.technicianId!} 
            onNavigate={navigate} 
          />
        );
      
      case 'messaging-inbox':
        return <MessagingInbox onNavigate={navigate} />;
      
      case 'client-dashboard':
        return <ClientDashboard />;
      
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header onNavigate={navigate} />
      
      {renderPage()}
    </div>
  );
}