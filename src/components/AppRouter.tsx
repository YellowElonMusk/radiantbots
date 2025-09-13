import { useState } from 'react';
import { Landing } from './Landing';
import { Catalog } from './Catalog';
import { Profile } from './Profile';
import { BookingForm } from './BookingForm';
import { Confirmation } from './Confirmation';
import { Messages } from './Messages';
import { Bootcamp } from './Bootcamp';

type Page = 'landing' | 'catalog' | 'profile' | 'booking' | 'confirmation' | 'messages' | 'bootcamp';

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
      
      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}