import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { store } from '@/lib/store';
import type { Booking, Technician, Message } from '@/lib/store';
import { ArrowLeft, Send, Phone, Star, MapPin, Calendar } from 'lucide-react';

interface MessagesProps {
  bookingId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function Messages({ bookingId, onNavigate }: MessagesProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookingData = store.getBooking(bookingId);
    if (bookingData) {
      setBooking(bookingData);
      const techData = store.getTechnician(bookingData.technicianId);
      setTechnician(techData || null);
      
      // Load existing messages
      const existingMessages = store.getMessages(bookingId);
      setMessages(existingMessages);
      
      // Add some demo messages if none exist
      if (existingMessages.length === 0) {
        const demoMessages = [
          {
            bookingId,
            sender: 'technician' as const,
            content: `Hi ${bookingData.clientName}! I've received your booking for ${bookingData.date} at ${bookingData.time}. I'll be there to help with your robotics issue. Is there anything specific I should know before arriving?`,
          },
          {
            bookingId,
            sender: 'client' as const,
            content: 'Thanks for confirming! The robot has been having navigation issues in our warehouse. It seems to get stuck in certain areas.',
          },
          {
            bookingId,
            sender: 'technician' as const,
            content: 'That sounds like a mapping or sensor calibration issue. I\'ll bring my diagnostic equipment and should be able to resolve it quickly. See you tomorrow!',
          }
        ];
        
        demoMessages.forEach(msg => {
          setTimeout(() => {
            const addedMessage = store.addMessage(msg);
            setMessages(prev => [...prev, addedMessage]);
          }, 100);
        });
      }
    }
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!booking || !technician) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Conversation not found</h2>
          <Button variant="outline" onClick={() => onNavigate('landing')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onNavigate('confirmation', { bookingId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message = store.addMessage({
      bookingId,
      sender: 'client',
      content: newMessage.trim(),
    });

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate technician response (for demo)
    setTimeout(() => {
      const responses = [
        "Thanks for the additional details! I'll make sure to address that.",
        "Got it! I'll be prepared for that specific issue.",
        "Perfect, that helps me understand the situation better.",
        "I'll bring the right tools for that. Thanks for letting me know!",
        "Understood. I should be able to fix that during our appointment."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response = store.addMessage({
        bookingId,
        sender: 'technician',
        content: randomResponse,
      });

      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {technician.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div>
                <h1 className="font-semibold">{technician.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{technician.rating}</span>
                  <span>•</span>
                  <span className="text-green-500">● Online</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Booking Info Card */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Booking Details</h3>
                <Badge variant="secondary">#{booking.id.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(booking.date)} at {booking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{booking.location}</span>
                </div>
                <div className="text-primary font-medium">
                  €{booking.price} total
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'client'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'client' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="book" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => setNewMessage("What time will you arrive?")}>
              📅 Arrival time?
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewMessage("Do you need any specific information?")}>
              ❓ Need info?
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewMessage("Can we reschedule?")}>
              🔄 Reschedule
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewMessage("Thank you!")}>
              🙏 Thank you
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}