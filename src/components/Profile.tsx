import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { store } from '@/lib/store';
import type { Technician } from '@/lib/store';
import { ArrowLeft, Star, MapPin, Clock, Award, MessageSquare, Calendar, Wrench, CheckCircle } from 'lucide-react';

interface ProfileProps {
  technicianId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function Profile({ technicianId, onNavigate }: ProfileProps) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    const tech = store.getTechnician(technicianId);
    setTechnician(tech || null);
  }, [technicianId]);

  if (!technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Technician not found</h2>
          <Button variant="outline" onClick={() => onNavigate('catalog')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onNavigate('catalog');
  };

  const handleBookNow = () => {
    onNavigate('booking', { technicianId });
  };

  const handleMessage = () => {
    // For demo, we'll create a mock booking to enable messaging
    const booking = store.createBooking({
      technicianId,
      clientName: 'Demo Client',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      location: 'Demo Location',
      notes: 'Initial inquiry',
      status: 'pending',
      price: technician.rate,
    });
    
    onNavigate('messages', { bookingId: booking.id });
  };

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

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
              <h1 className="text-2xl font-bold">{technician.name}</h1>
              <p className="text-sm text-muted-foreground">Robotics Technician</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Wrench className="h-16 w-16 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{technician.name}</h2>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{technician.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{technician.rating}</span>
                            <span className="text-muted-foreground">({technician.completedJobs} reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="text-accent font-medium">Available Today</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">€{technician.rate}/hr</div>
                        <div className="text-sm text-muted-foreground">Starting rate</div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{technician.bio}</p>
                    
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">{technician.experience} experience</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm">{technician.completedJobs} jobs completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">About</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-muted-foreground">{technician.bio}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-sm">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Brands */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Skills & Expertise</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Robot Brands</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.brands.map((brand) => (
                        <Badge key={brand} variant="secondary" className="text-sm">
                          🤖 {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section (Static for demo) */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  <div className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Sarah M.</span>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      "Excellent work fixing our warehouse robot navigation issues. Very professional and quick response time."
                    </p>
                  </div>
                  
                  <div className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Tech Corp</span>
                      <span className="text-sm text-muted-foreground">1 week ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      "Outstanding technical knowledge and problem-solving skills. Highly recommend!"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Book {technician.name}</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">€{technician.rate}/hr</div>
                    <div className="text-sm text-muted-foreground">Starting rate</div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Available Times
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {technician.availability.slice(0, 3).map((slot) => {
                        const formatted = formatTimeSlot(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-3 text-left rounded-lg border transition-colors ${
                              selectedTimeSlot === slot
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="font-medium">{formatted.date}</div>
                            <div className="text-sm text-muted-foreground">{formatted.time}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Button 
                      variant="book" 
                      size="lg" 
                      className="w-full"
                      onClick={handleBookNow}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={handleMessage}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2">
                    💬 Free to message • ⚡ Instant booking • 🔒 Secure payment
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-3">Response Time</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Usually responds in 15 minutes</div>
                    <div className="text-sm text-muted-foreground">Very responsive</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}