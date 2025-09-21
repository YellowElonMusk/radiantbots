import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TechnicianLoginProps {
  onNavigate: (page: string, data?: any) => void;
}

export function TechnicianLogin({ onNavigate }: TechnicianLoginProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    fr: {
      loginTitle: "Connexion",
      signupTitle: "S'inscrire",
      loginSubtitle: "Accédez à votre tableau de bord technicien certifié",
      signupSubtitle: "Créez votre compte technicien",
      email: "Email",
      password: "Mot de passe",
      firstName: "Prénom",
      lastName: "Nom",
      login: "Se connecter",
      signup: "S'inscrire",
      switchToSignup: "Pas de compte ? S'inscrire",
      switchToLogin: "Déjà un compte ? Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      backToHome: "Retour à l'accueil"
    },
    en: {
      loginTitle: "Login",
      signupTitle: "Sign Up",
      loginSubtitle: "Access your certified technician dashboard",
      signupSubtitle: "Create your technician account",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      login: "Login",
      signup: "Sign Up",
      switchToSignup: "Don't have an account? Sign up",
      switchToLogin: "Already have an account? Login",
      forgotPassword: "Forgot password?",
      backToHome: "Back to home"
    }
  };

  const t = translations[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          // Check user role from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('user_id', data.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            toast({
              title: "Error",
              description: "Unable to verify account type",
              variant: "destructive",
            });
            return;
          }
          
          // Redirect if user is not a technician
          if (profileData?.user_type === 'enterprise') {
            await supabase.auth.signOut(); // Sign them out since they're in the wrong place
            toast({
              title: "Compte Entreprise Détecté",
              description: "Vous avez un compte entreprise. Cliquez sur 'Me connecter' et choisissez 'Entreprise' pour accéder à votre tableau de bord.",
              variant: "destructive",
            });
            return;
          } else if (profileData?.user_type !== 'technician') {
            await supabase.auth.signOut();
            toast({
              title: "Accès Refusé",
              description: "Ce compte n'est pas autorisé à accéder à l'espace technicien.",
              variant: "destructive",
            });
            return;
          }
          
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
          onNavigate('technician-dashboard');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });

        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email to confirm your account.",
          });
          setIsLogin(true);
        }
      }
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
          <CardTitle className="text-2xl">{isLogin ? t.loginTitle : t.signupTitle}</CardTitle>
          <CardDescription>{isLogin ? t.loginSubtitle : t.signupSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isLogin ? t.login : t.signup)}
            </Button>
            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={() => onNavigate('registration')}
                className="text-sm"
              >
                {t.switchToSignup}
              </Button>
            </div>
            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={() => onNavigate('forgot-password')}
                className="text-sm"
              >
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