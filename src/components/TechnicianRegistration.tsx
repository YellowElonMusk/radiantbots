import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, User, Briefcase, Car, CheckCircle } from 'lucide-react';

interface TechnicianRegistrationProps {
  onNavigate: (page: string) => void;
}

export function TechnicianRegistration({ onNavigate }: TechnicianRegistrationProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    age: '',
    techBackground: '',
    experience: '',
    canDrive: false,
    hasFreelancerStatus: false,
    hasTaxNumber: false,
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUnder18, setIsUnder18] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('registration.errors.required');
    if (!formData.lastName.trim()) newErrors.lastName = t('registration.errors.required');
    if (!formData.email.trim()) newErrors.email = t('registration.errors.required');
    if (!formData.phone.trim()) newErrors.phone = t('registration.errors.required');
    if (!formData.city.trim()) newErrors.city = t('registration.errors.required');
    if (!formData.age.trim()) newErrors.age = t('registration.errors.required');
    if (!formData.techBackground.trim()) newErrors.techBackground = t('registration.errors.required');
    if (!formData.experience) newErrors.experience = t('registration.errors.required');
    
    // Age validation
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 16 || age > 100) {
      newErrors.age = t('registration.errors.invalidAge');
    }
    
    // Only require freelancer status if 18 or older
    if (age >= 18 && !formData.hasFreelancerStatus) {
      newErrors.hasFreelancerStatus = t('registration.errors.freelancerRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const age = parseInt(formData.age);
      console.log('Registration data:', { ...formData, age, canWorkAsTech: age >= 18 });
      
      // Everyone can access courses, age only affects work eligibility
      onNavigate('bootcamp');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check age for under 18 warning
    if (field === 'age' && typeof value === 'string') {
      const age = parseInt(value);
      setIsUnder18(!isNaN(age) && age < 18);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('bootcamp')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('registration.backToBootcamp')}
          </Button>
        </div>
      </header>

      {/* Registration Form */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              {t('registration.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('registration.subtitle')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t('registration.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('registration.firstName')} *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-destructive' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('registration.lastName')} *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-destructive' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t('registration.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">{t('registration.phone')} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="age">{t('registration.age')} *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="16"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className={errors.age ? 'border-destructive' : ''}
                    />
                    {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">{t('registration.city')} *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>
                </div>

                {/* Under 18 Warning */}
                {isUnder18 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>{t('registration.under18Warning.title')}</strong><br />
                      {t('registration.under18Warning.message')}
                    </p>
                  </div>
                )}

                {/* Technical Background */}
                <div className="pt-6 border-t border-border">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {t('registration.technicalBackground')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="techBackground">{t('registration.currentField')} *</Label>
                      <Textarea
                        id="techBackground"
                        placeholder={t('registration.techBackgroundPlaceholder')}
                        value={formData.techBackground}
                        onChange={(e) => handleInputChange('techBackground', e.target.value)}
                        className={errors.techBackground ? 'border-destructive' : ''}
                      />
                      {errors.techBackground && <p className="text-sm text-destructive mt-1">{errors.techBackground}</p>}
                    </div>

                    <div>
                      <Label htmlFor="experience">{t('registration.experience')} *</Label>
                      <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                        <SelectTrigger className={errors.experience ? 'border-destructive' : ''}>
                          <SelectValue placeholder={t('registration.selectExperience')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">{t('registration.experienceOptions.beginner')}</SelectItem>
                          <SelectItem value="2-5">{t('registration.experienceOptions.intermediate')}</SelectItem>
                          <SelectItem value="5-10">{t('registration.experienceOptions.experienced')}</SelectItem>
                          <SelectItem value="10+">{t('registration.experienceOptions.expert')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.experience && <p className="text-sm text-destructive mt-1">{errors.experience}</p>}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="pt-6 border-t border-border">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {t('registration.requirementsTitle')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canDrive"
                        checked={formData.canDrive}
                        onCheckedChange={(checked) => handleInputChange('canDrive', checked as boolean)}
                      />
                      <Label htmlFor="canDrive" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {t('registration.canDrive')}
                      </Label>
                    </div>

                    {!isUnder18 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasFreelancerStatus"
                          checked={formData.hasFreelancerStatus}
                          onCheckedChange={(checked) => handleInputChange('hasFreelancerStatus', checked as boolean)}
                        />
                        <Label htmlFor="hasFreelancerStatus" className="text-sm">
                          {t('registration.freelancerStatus')} *
                        </Label>
                      </div>
                    )}
                    {errors.hasFreelancerStatus && <p className="text-sm text-destructive">{errors.hasFreelancerStatus}</p>}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasTaxNumber"
                        checked={formData.hasTaxNumber}
                        onCheckedChange={(checked) => handleInputChange('hasTaxNumber', checked as boolean)}
                      />
                      <Label htmlFor="hasTaxNumber" className="text-sm">
                        {t('registration.taxNumber')}
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="pt-6 border-t border-border">
                  <div>
                    <Label htmlFor="bio">{t('registration.bio')}</Label>
                    <Textarea
                      id="bio"
                      placeholder={t('registration.bioPlaceholder')}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <Button type="submit" className="w-full" size="lg">
                    {isUnder18 ? t('registration.accessCourses') : t('registration.createAccount')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t('registration.terms')}
                  </p>
                  {!isUnder18 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {t('registration.freeAccess')}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}