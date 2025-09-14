import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { store } from '@/lib/store';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Technician } from '@/lib/store';
import { ArrowLeft, Calendar, Clock, MapPin, Euro, User, MessageSquare, Star } from 'lucide-react';

interface BookingFormProps {
  technicianId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function BookingForm({ technicianId, onNavigate }: BookingFormProps) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const { t } = useLanguage();

  useEffect(() => {
    const tech = store.getTechnician(technicianId);
    setTechnician(tech || null);
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [technicianId]);

  if (!technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('profile.notFound')}</h2>
          <Button variant="outline" onClick={() => onNavigate('catalog')}>
            {t('profile.backToCatalog')}
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onNavigate('profile', { technicianId });
  };

  const calculateTotal = () => {
    return technician.rate * estimatedHours;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !location || !clientName) {
      alert('Please fill in all required fields');
      return;
    }

    // Create booking
    const booking = store.createBooking({
      technicianId,
      clientName,
      date: selectedDate,
      time: selectedTime,
      location,
      notes,
      status: 'confirmed',
      price: calculateTotal(),
    });

    // Navigate to confirmation
    onNavigate('confirmation', { bookingId: booking.id });
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('booking.title')} {technician.name}</h1>
              <p className="text-sm text-muted-foreground">{t('booking.completeBooking')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('booking.bookingDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('booking.yourInfo')}
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('booking.fullName')} *
                        </label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder={t('booking.fullNamePlaceholder')}
                          required
                        />
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('booking.dateTime')}
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Date *
                          </label>
                          <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Time *
                          </label>
                          <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full p-2 border border-border rounded-md bg-background"
                            required
                          >
                            <option value="">Select time</option>
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Service Location
                      </h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Address *
                        </label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Enter the service location address"
                          required
                        />
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Job Details
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Estimated Duration (hours)
                        </label>
                        <select
                          value={estimatedHours}
                          onChange={(e) => setEstimatedHours(Number(e.target.value))}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                            <option key={hours} value={hours}>
                              {hours} hour{hours > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Additional Notes
                        </label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Describe the issue, robot model, any specific requirements..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <Button type="submit" variant="book" size="lg" className="w-full">
                      {t('booking.confirmBooking')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              {/* Technician Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Your Technician</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white font-medium">
                        {technician.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{technician.name}</div>
                      <div className="text-sm text-muted-foreground">{technician.city}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{technician.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {technician.completedJobs} jobs
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {technician.brands.slice(0, 2).map(brand => (
                      <Badge key={brand} variant="outline" className="text-xs">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    Price Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Hourly rate</span>
                      <span>€{technician.rate}/hr</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>{estimatedHours} hour{estimatedHours > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">€{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      💡 Final price may vary based on actual time spent and materials used
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-3">Why book with us?</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Vetted professionals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>24/7 support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span>Money-back guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}