import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TechnicianProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  city: string;
  hourly_rate: number;
  profile_photo_url?: string;
}

interface MissionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  technician: TechnicianProfile;
}

export const MissionRequestDialog = ({ isOpen, onClose, technician }: MissionRequestDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    desiredDate: '',
    desiredTime: '',
    clientName: '',
    clientEmail: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setCurrentUser(profile);
          setFormData(prev => ({
            ...prev,
            clientName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            clientEmail: profile.email || ''
          }));
        }
      }
    };

    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);

  const generateGuestToken = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getOrCreateGuestUser = async () => {
    let guestToken = localStorage.getItem('guest_token');
    
    if (!guestToken) {
      guestToken = generateGuestToken();
      localStorage.setItem('guest_token', guestToken);
    }

    const { data: existingGuest } = await supabase
      .from('guest_users')
      .select('id')
      .eq('browser_token', guestToken)
      .single();

    if (existingGuest) {
      return existingGuest.id;
    }

    const { data: newGuest, error } = await supabase
      .from('guest_users')
      .insert({
        browser_token: guestToken,
        name: formData.clientName,
        email: formData.clientEmail
      })
      .select('id')
      .single();

    if (error) throw error;
    return newGuest.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.clientName || !formData.clientEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let missionData: any = {
        technician_id: technician.user_id, // This should match the technician's user_id
        title: formData.title,
        description: formData.description,
        desired_date: formData.desiredDate || null,
        desired_time: formData.desiredTime || null,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        status: 'pending'
      };

      if (user) {
        missionData.client_user_id = user.id;
      } else {
        const guestUserId = await getOrCreateGuestUser();
        missionData.guest_user_id = guestUserId;
      }

      console.log('Submitting mission request:', missionData);

      const { error } = await supabase
        .from('missions')
        .insert(missionData);

      if (error) throw error;

      toast({
        title: "Mission Request Sent!",
        description: `Your request has been sent to ${technician.first_name}. They will be notified and can respond soon.`
      });

      onClose();
      setFormData({
        title: '',
        description: '',
        desiredDate: '',
        desiredTime: '',
        clientName: '',
        clientEmail: ''
      });

    } catch (error: any) {
      console.error('Error submitting mission request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Request Mission with {technician.first_name} {technician.last_name}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to request a mission from this technician. They will review your request and respond accordingly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Technician Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {technician.profile_photo_url ? (
                  <img 
                    src={technician.profile_photo_url} 
                    alt={`${technician.first_name}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {technician.first_name} {technician.last_name}
                  </h3>
                  <p className="text-muted-foreground">{technician.city}</p>
                  <p className="text-primary font-medium">${technician.hourly_rate}/hour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Mission Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Robot maintenance and calibration"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mission Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide details about what work needs to be done..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desiredDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Desired Date
                </Label>
                <Input
                  id="desiredDate"
                  type="date"
                  value={formData.desiredDate}
                  onChange={(e) => handleInputChange('desiredDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="desiredTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time
                </Label>
                <Input
                  id="desiredTime"
                  type="time"
                  value={formData.desiredTime}
                  onChange={(e) => handleInputChange('desiredTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            
            {!currentUser && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You're submitting as a guest. To track your request and communicate with the technician, 
                  consider creating an account after submission.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Your Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Full name"
                  required
                  disabled={!!currentUser}
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Your Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={!!currentUser}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Mission Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};