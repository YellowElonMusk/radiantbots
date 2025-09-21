import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Search, Mail, Phone, Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Technician {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  linkedin_url: string;
  profile_photo_url: string;
  user_type: 'technician' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export const Catalog = () => {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'technician')
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);

      if (error) throw error;
      setTechnicians((data || []).filter(t => t.user_type === 'technician'));
    } catch (error: any) {
      console.error('Error loading technicians:', error);
      toast({
        title: "Error",
        description: "Failed to load technicians. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTechnicians = technicians.filter(tech =>
    `${tech.first_name} ${tech.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading technicians...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Technician Catalog</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <Card key={technician.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={technician.profile_photo_url} />
                  <AvatarFallback>
                    {technician.first_name[0]}{technician.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {technician.first_name} {technician.last_name}
                  </CardTitle>
                  {technician.city && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {technician.city}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {technician.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {technician.email}
                  </div>
                )}
                {technician.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {technician.phone}
                  </div>
                )}
                {technician.linkedin_url && (
                  <div className="flex items-center text-sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    <a href={technician.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
              <Button className="w-full mt-4">
                Contact Technician
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No technicians found matching your search.</p>
        </div>
      )}
    </div>
  );
};