import { Card } from "@/components/ui/card";

interface LoginTypeSelectionProps {
  onNavigate: (page: string) => void;
}

export function LoginTypeSelection({ onNavigate }: LoginTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            Connexion !
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Quel type de compte souhaitez-vous connecter ?
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card 
            className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate('enterprise-login')}
          >
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-4xl">🏢</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Entreprise</h3>
            <p className="text-gray-600 font-medium">
              Je cherche des freelances
            </p>
          </Card>

          <Card 
            className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate('technician-login')}
          >
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-4xl">👨‍💻</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Freelance</h3>
            <p className="text-gray-600 font-medium">
              Je crée mon profil de freelance
            </p>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Pas encore de compte ? <button onClick={() => onNavigate('account-type-selection')} className="text-blue-600 hover:underline">Créer un compte</button>
          </p>
        </div>
      </div>
    </div>
  );
}