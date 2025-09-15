// RoboMatch - Local data store using localStorage
// This manages all app state including technicians, bookings, and messages

export interface Technician {
  id: string;
  name: string;
  city: string;
  rating: number;
  rate: number;
  brands: string[];
  skills: string[];
  bio: string;
  photo: string;
  availability: string[];
  certifications: string[];
  experience: string;
  completedJobs: number;
}

export interface Booking {
  id: string;
  technicianId: string;
  clientName: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed';
  price: number;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  sender: 'client' | 'technician';
  content: string;
  timestamp: string;
}

class Store {
  private storageKey = 'robomatch-data';

  private data = {
    technicians: [] as Technician[],
    bookings: [] as Booking[],
    messages: [] as Message[],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = { ...this.data, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Technicians
  getTechnicians(): Technician[] {
    return this.data.technicians;
  }

  getTechnician(id: string): Technician | undefined {
    return this.data.technicians.find(tech => tech.id === id);
  }

  // Bookings
  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: `b_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    this.data.bookings.push(newBooking);
    this.save();
    return newBooking;
  }

  getBooking(id: string): Booking | undefined {
    return this.data.bookings.find(booking => booking.id === id);
  }

  getBookings(): Booking[] {
    return this.data.bookings;
  }

  // Messages
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: `m_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    this.data.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  getMessages(bookingId: string): Message[] {
    return this.data.messages
      .filter(msg => msg.bookingId === bookingId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Add technician (for registration)
  addTechnician(technician: Omit<Technician, 'id'>): Technician {
    const newTechnician: Technician = {
      ...technician,
      id: `tech_${Date.now()}`,
    };
    
    this.data.technicians.push(newTechnician);
    this.save();
    return newTechnician;
  }

  // Clear all fake data - start fresh for real registrations only
  clearAllData() {
    this.data = {
      technicians: [],
      bookings: [],
      messages: [],
    };
    this.save();
  }

  // Initialize store (clear fake data on first load)
  initializeStore() {
    // Clear any existing fake data
    this.clearAllData();
    console.log('Store initialized - ready for real technician registrations');
  }

  // Search and filter
  searchTechnicians(query: {
    location?: string;
    brands?: string[];
    skills?: string[];
    minRating?: number;
  }): Technician[] {
    let results = this.getTechnicians();

    if (query.location) {
      results = results.filter(tech => 
        tech.city.toLowerCase().includes(query.location!.toLowerCase())
      );
    }

    if (query.brands?.length) {
      results = results.filter(tech =>
        query.brands!.some(brand => tech.brands.includes(brand))
      );
    }

    if (query.skills?.length) {
      results = results.filter(tech =>
        query.skills!.some(skill => tech.skills.includes(skill))
      );
    }

    if (query.minRating) {
      results = results.filter(tech => tech.rating >= query.minRating!);
    }

    // Sort by rating (highest first)
    return results.sort((a, b) => b.rating - a.rating);
  }
}

export const store = new Store();