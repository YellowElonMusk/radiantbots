import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, User, MapPin, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RequestQuoteProps {
  onNavigate: (page: string, data?: any) => void;
  technicianName?: string;
}

export function RequestQuote({ onNavigate, technicianName }: RequestQuoteProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    missionTitle: '',
    description: '',
    location: '',
    preferredDate: '',
    urgency: 'normal',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to confirmation
    onNavigate('confirmation', { 
      type: 'quote_request',
      technicianName,
      missionTitle: formData.missionTitle 
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('catalog')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">Demande de Devis Personnalisé</h1>
              {technicianName && (
                <p className="text-sm text-muted-foreground">
                  Pour une mission avec {technicianName}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Informations de votre demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations entreprise
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Votre entreprise"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactName">Personne de contact *</Label>
                    <Input
                      id="contactName"
                      required
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@entreprise.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              {/* Mission Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Détails de la mission
                </h3>
                
                <div>
                  <Label htmlFor="missionTitle">Titre de la mission *</Label>
                  <Input
                    id="missionTitle"
                    required
                    value={formData.missionTitle}
                    onChange={(e) => handleInputChange('missionTitle', e.target.value)}
                    placeholder="Ex: Maintenance préventive robot industriel"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre besoin, le type de robot, la problématique, les compétences requises..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Lieu d'intervention *</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ville, région"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredDate">Date souhaitée</Label>
                    <Input
                      id="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="urgency">Urgence</Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="low">Pas urgent (+ de 2 semaines)</option>
                      <option value="normal">Normal (1-2 semaines)</option>
                      <option value="high">Urgent (quelques jours)</option>
                      <option value="critical">Critique (immédiat)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Budget estimé (optionnel)</Label>
                    <Input
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="Ex: 2000-3000€"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('catalog')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi...
                    </div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}