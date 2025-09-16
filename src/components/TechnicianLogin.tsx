import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TechnicianLoginProps {
  onNavigate: (page: string, data?: any) => void;
}

export function TechnicianLogin({ onNavigate }: TechnicianLoginProps) {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const translations = {
    fr: {
      title: "Connexion Technicien",
      subtitle: "Accédez à votre tableau de bord technicien certifié",
      email: "Email",
      password: "Mot de passe",
      login: "Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      backToHome: "Retour à l'accueil"
    },
    en: {
      title: "Technician Login",
      subtitle: "Access your certified technician dashboard",
      email: "Email",
      password: "Password",
      login: "Login",
      forgotPassword: "Forgot password?",
      backToHome: "Back to home"
    }
  };

  const t = translations[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, simulate login - will be replaced with real auth later
    onNavigate('technician-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t.login}
            </Button>
            <div className="text-center">
              <Button variant="link" className="text-sm">
                {t.forgotPassword}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('landing')}
              className="w-full"
            >
              {t.backToHome}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}