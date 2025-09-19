import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const translations = {
    fr: {
      title: "Mot de passe oublié",
      subtitle: "Entrez votre email pour recevoir un lien de réinitialisation",
      email: "Email",
      sendLink: "Envoyer le lien",
      backToLogin: "Retour à la connexion",
      emailSentTitle: "Email envoyé !",
      emailSentMessage: "Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.",
      resendEmail: "Renvoyer l'email"
    },
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive a reset link",
      email: "Email",
      sendLink: "Send Link",
      backToLogin: "Back to Login",
      emailSentTitle: "Email Sent!",
      emailSentMessage: "Check your mailbox and click the link to reset your password.",
      resendEmail: "Resend Email"
    }
  };

  const t = translations[language];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "Success",
        description: "Password reset email sent successfully!",
      });
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

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t.emailSentTitle}</CardTitle>
            <CardDescription>{t.emailSentMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setEmailSent(false)}
              variant="outline" 
              className="w-full"
            >
              {t.resendEmail}
            </Button>
            <Button 
              onClick={() => onNavigate('landing')}
              className="w-full"
            >
              {t.backToLogin}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : t.sendLink}
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