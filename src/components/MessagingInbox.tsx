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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load real messages from database
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          mission_id,
          sender_id,
          receiver_id,
          mission:missions!messages_mission_id_fkey(
            title,
            client_name,
            client_user_id,
            guest_user_id
          ),
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
        setLoading(false);
        return;
      }

      // Group messages by mission and get the latest message for each conversation
      const conversationMap = new Map();
      
      messages?.forEach((message: any) => {
        const missionId = message.mission_id;
        if (!conversationMap.has(missionId) || 
            new Date(message.created_at) > new Date(conversationMap.get(missionId).timestamp)) {
          
          const isFromClient = message.sender_id !== user.id;
          const clientName = message.mission?.client_name || 
                           `${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`.trim() ||
                           'Unknown Client';
          
          conversationMap.set(missionId, {
            id: missionId,
            clientName,
            lastMessage: message.content,
            timestamp: message.created_at,
            unread: false, // Could be implemented with read status tracking
            missionType: message.mission?.title || 'Mission'
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
      setLoading(false);
    }
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