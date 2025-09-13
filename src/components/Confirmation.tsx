import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { store } from '@/lib/store';
import type { Booking, Technician } from '@/lib/store';
import { CheckCircle, Calendar, MapPin, Euro, MessageSquare, Phone, Star, ArrowLeft } from 'lucide-react';

interface ConfirmationProps {
  bookingId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function Confirmation({ bookingId, onNavigate }: ConfirmationProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);

  useEffect(() => {
    const bookingData = store.getBooking(bookingId);
    if (bookingData) {
      setBooking(bookingData);
      const techData = store.getTechnician(bookingData.technicianId);
      setTechnician(techData || null);
    }
  }, [bookingId]);

  if (!booking || !technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
          <Button variant="outline" onClick={() => onNavigate('landing')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleMessageTechnician = () => {
    onNavigate('messages', { bookingId });
  };

  const handleBackHome = () => {
    onNavigate('landing');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackHome}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Booking Confirmed</h1>
              <p className="text-sm text-muted-foreground">Your robotics technician is on the way</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Message */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
            
            <p className="text-muted-foreground text-lg mb-6">
              Your robotics technician has been successfully booked. 
              You'll receive a confirmation email shortly.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                🆔 Job #{booking.id.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2">
                🔒 Payment Secured
              </Badge>
            </div>
          </div>

          {/* Booking Details Card */}
          <Card>
            <CardContent className="p-8">
              <h3 className="font-semibold text-xl mb-6">Booking Details</h3>
              
              <div className="space-y-6">
                {/* Technician Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {technician.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{technician.name}</h4>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{technician.rating} rating</span>
                      <span>•</span>
                      <span>{technician.completedJobs} jobs completed</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">€{booking.price}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Date & Time</div>
                      <div className="text-muted-foreground">{formatDate(booking.date)}</div>
                      <div className="text-muted-foreground">{booking.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-muted-foreground">{booking.location}</div>
                    </div>
                  </div>
                </div>

                {/* Service Notes */}
                {booking.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Service Notes</h4>
                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {booking.notes}
                    </p>
                  </div>
                )}

                {/* Payment Info */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Euro className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">Payment Secured</div>
                      <div className="text-sm text-muted-foreground">
                        Payment will be processed after service completion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              variant="book" 
              size="lg" 
              className="w-full"
              onClick={handleMessageTechnician}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Message {technician.name}
            </Button>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Call Support
              </Button>
              
              <Button variant="outline" size="lg" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </div>

          {/* What Happens Next */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center mt-1 font-semibold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Technician will contact you</div>
                    <div className="text-sm text-muted-foreground">
                      {technician.name} will reach out within 30 minutes to confirm details
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center mt-1 font-semibold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Service appointment</div>
                    <div className="text-sm text-muted-foreground">
                      Your technician will arrive at the scheduled time
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center mt-1 font-semibold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Payment & review</div>
                    <div className="text-sm text-muted-foreground">
                      Complete payment and leave a review after the service
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
            Need help? Contact our support team 24/7 at{' '}
            <span className="font-medium text-foreground">support@robomatch.com</span> or{' '}
            <span className="font-medium text-foreground">+1 (555) 123-4567</span>
          </div>
        </div>
      </div>
    </div>
  );
}