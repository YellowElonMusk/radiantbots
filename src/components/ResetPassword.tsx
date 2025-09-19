import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    fr: {
      title: "Réinitialiser le mot de passe",
      subtitle: "Entrez votre nouveau mot de passe",
      password: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      resetPassword: "Réinitialiser",
      backToLogin: "Retour à la connexion",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères"
    },
    en: {
      title: "Reset Password",
      subtitle: "Enter your new password",
      password: "New Password",
      confirmPassword: "Confirm Password",
      resetPassword: "Reset Password",
      backToLogin: "Back to Login",
      passwordMismatch: "Passwords do not match",
      passwordTooShort: "Password must be at least 8 characters"
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Check if user came from password reset email
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: t.passwordTooShort,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: t.passwordMismatch,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password updated successfully! You can now login with your new password.",
      });
      
      // Sign out user so they can login with new password
      await supabase.auth.signOut();
      onNavigate('landing');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : t.resetPassword}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('landing')}
              className="w-full"
            >
              {t.backToLogin}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}