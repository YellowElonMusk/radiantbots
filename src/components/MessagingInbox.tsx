import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MessagingInboxProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Conversation {
  id: string;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  missionType?: string;
}

export function MessagingInbox({ onNavigate }: MessagingInboxProps) {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate('technician-login');
      return;
    }
    setUser(user);
    loadConversations();
  };

  const loadConversations = async () => {
    // Simulate loading conversations - replace with real data when backend is ready
    setTimeout(() => {
      setConversations([
        {
          id: '1',
          clientName: 'Marie Dubois',
          lastMessage: 'Merci pour la maintenance, tout fonctionne parfaitement !',
          timestamp: '2024-01-15T10:30:00Z',
          unread: false,
          missionType: 'Maintenance préventive'
        },
        {
          id: '2',
          clientName: 'Jean Martin',
          lastMessage: 'Bonjour, j\'aurais besoin d\'aide pour un dépannage urgent',
          timestamp: '2024-01-16T14:20:00Z',
          unread: true,
          missionType: 'Dépannage'
        },
        {
          id: '3',
          clientName: 'Sophie Laurent',
          lastMessage: 'Quand pourriez-vous passer pour l\'installation ?',
          timestamp: '2024-01-16T16:45:00Z',
          unread: true,
          missionType: 'Déploiement'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const handleConversationClick = (conversationId: string) => {
    // Navigate to individual conversation - for now just simulate
    onNavigate('messages', { bookingId: conversationId });
  };

  if (loading) {
    return (
      <div className="pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('landing')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <p className="text-muted-foreground">
            Gérez vos conversations avec les clients et consultez les nouvelles demandes de mission.
          </p>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore de conversations avec des clients.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  conversation.unread ? 'border-primary/50 bg-primary/5' : ''
                }`}
                onClick={() => handleConversationClick(conversation.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {conversation.clientName}
                          {conversation.unread && (
                            <Badge variant="default" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </CardTitle>
                        {conversation.missionType && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {conversation.missionType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(conversation.timestamp)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-sm ${
                    conversation.unread ? 'font-medium' : 'text-muted-foreground'
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}