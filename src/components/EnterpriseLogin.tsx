import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface EnterpriseLoginProps {
  onNavigate: (page: string) => void;
}

export function EnterpriseLogin({ onNavigate }: EnterpriseLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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
            title: "Erreur",
            description: "Impossible de vérifier le type de compte",
            variant: "destructive",
          });
          return;
        }
        
        // Redirect if user is not an enterprise client
        if (profileData?.user_type === 'technician') {
          await supabase.auth.signOut(); // Sign them out since they're in the wrong place
          toast({
            title: "Compte Technicien Détecté",
            description: "Vous avez un compte technicien. Cliquez sur 'Me connecter' et choisissez 'Freelance' pour accéder à votre tableau de bord.",
            variant: "destructive",
          });
          return;
        } else if (profileData?.user_type !== 'enterprise') {
          await supabase.auth.signOut();
          toast({
            title: "Accès Refusé",
            description: "Ce compte n'est pas autorisé à accéder à l'espace entreprise.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre espace entreprise !",
        });
        onNavigate('enterprise-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            Connexion Entreprise
          </div>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Connexion Entreprise
            </h1>
            <p className="text-gray-600">
              Connectez-vous à votre espace entreprise
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@email-professionnel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>&gt; 8 caractères</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">•</span>
                  <span>1 lettre majuscule</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">•</span>
                  <span>1 caractère spécial</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onNavigate('login-type-selection')}
              >
                Retour
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={loading || !email || !password}
              >
                {loading ? 'Connexion...' : 'Continuer'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-sm text-blue-600 hover:underline mb-4 block w-full"
            >
              Mot de passe oublié ?
            </button>
            <p className="text-sm text-gray-600">
              Pas encore de compte ? <button onClick={() => onNavigate('enterprise-registration')} className="text-blue-600 hover:underline">S'inscrire</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}