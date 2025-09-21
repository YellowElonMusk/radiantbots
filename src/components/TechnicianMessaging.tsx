import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { markMissionMessagesAsRead } from '@/hooks/useUnreadMessages';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string | null;
  mission_id: string;
  sender?: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

interface Mission {
  id: string;
  title: string;
  status: string;
  desired_date: string;
  created_at: string;
  client_id?: string;
  technician_id?: string;
  description?: string;
  desired_time?: string;
  accepted_at?: string;
  updated_at?: string;
}

interface TechnicianMessagingProps {
  missionId: string;
  onBack: () => void;
  currentUserId: string;
}

export function TechnicianMessaging({ missionId, onBack, currentUserId }: TechnicianMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [client, setClient] = useState<any>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMissionAndClient();
  }, [missionId, currentUserId]);

  useEffect(() => {
    if (mission) {
      loadMessages();
    }
  }, [mission]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMissionAndClient = async () => {
    try {
      // Load mission
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .eq('technician_id', currentUserId)
        .single();

      if (missionError) throw missionError;
      setMission(missionData);

      // Load client profile if they have a user account
      if (missionData.client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', missionData.client_id)
          .maybeSingle();

        if (clientError || !clientData) {
          console.error('Error loading client profile:', clientError);
          // Use default client data
          setClient({
            first_name: 'Client',
            last_name: '',
            profile_photo_url: null
          });
        } else {
          setClient(clientData);
        }
      } else {
        // No client ID - use default
        setClient({
          first_name: 'Client',
          last_name: '',
          profile_photo_url: null
        });
      }
    } catch (error) {
      console.error('Error loading mission and client:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      if (!mission?.id) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('mission_id', mission.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter out any messages where the sender query failed and cast to proper type
      const validMessages = (data || []).filter(message => 
        !message.sender || (typeof message.sender === 'object' && !('error' in message.sender))
      ) as Message[];
      
      setMessages(validMessages);
      
      // Mark messages as read when loading conversation
      console.log('Loading messages for mission:', mission.id, 'user:', currentUserId);
      await markMissionMessagesAsRead(mission.id, currentUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !mission?.id) return;

    // In simplified schema, we don't support messaging
    console.log('Messaging not supported in simplified schema');
    return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: currentUserId,
          mission_id: mission.id
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .single();

      if (error) throw error;

      // Only add the message if it has a valid sender
      if (!data.sender || (data.sender && typeof data.sender === 'object' && !('error' in data.sender))) {
        const validMessage = {
          ...data,
          sender: data.sender && typeof data.sender === 'object' && !('error' in data.sender)
            ? data.sender! as any
            : undefined
        } as Message;
        setMessages(prev => [...prev, validMessage]);
      }
      setNewMessage('');

      // Simulate client response after a short delay
      setTimeout(() => {
        simulateClientResponse();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const simulateClientResponse = async () => {
    if (!mission?.id || !mission.client_id) return;

    const responses = [
      "Merci pour votre message ! C'est exactement ce dont j'avais besoin.",
      "Parfait, j'attends votre arrivée avec impatience.",
      "Excellent, cela répond à toutes mes questions.",
      "Merci beaucoup pour ces informations détaillées.",
      "C'est noté, à bientôt !"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: randomResponse,
          sender_id: mission.client_id,
          mission_id: mission.id
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .single();

      if (error) throw error;
      
      // Only add the message if it has a valid sender
      if (!data.sender || (data.sender && typeof data.sender === 'object' && !('error' in data.sender))) {
        const validMessage = {
          ...data,
          sender: data.sender && typeof data.sender === 'object' && !('error' in data.sender)
            ? data.sender! as any
            : undefined
        } as Message;
        setMessages(prev => [...prev, validMessage]);
      }
    } catch (error) {
      console.error('Error simulating response:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: fr });
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'dd MMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mission || !client) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation non disponible</h3>
        <p className="text-gray-600">Cette conversation n'existe pas ou n'est plus accessible.</p>
        <Button onClick={onBack} className="mt-4">
          Retour aux messages
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Avatar>
                <AvatarImage src={client.profile_photo_url} />
                <AvatarFallback>
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {(() => {
                    if (!mission?.client_id) {
                      return client.first_name && client.last_name 
                        ? `${client.first_name} ${client.last_name}`
                        : 'Client';
                    }
                    
                    let formattedName = '';
                    if (client.first_name && !client.first_name.toLowerCase().includes('mr') && !client.first_name.toLowerCase().includes('mrs')) {
                      formattedName = `Mr ${client.first_name}`;
                    } else {
                      formattedName = client.first_name || '';
                    }
                    
                    if (client.last_name) {
                      formattedName += ` ${client.last_name}`;
                    }
                    
                    return formattedName || 'Client';
                  })()}
                </h3>
                <p className="text-sm text-gray-600">
                  Client
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mission Info */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{mission.title}</h4>
              <p className="text-sm text-gray-600">
                Mission créée le {formatDate(mission.created_at)}
              </p>
            </div>
            <div className="text-right">
              {mission.desired_date && (
                <p className="text-sm text-gray-600">
                  Date souhaitée: {formatDate(mission.desired_date)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Aucun message pour le moment</p>
                <p className="text-sm">Commencez la conversation ci-dessous</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === currentUserId
                        ? 'bg-primary text-white ml-4'
                        : 'bg-gray-100 text-gray-900 mr-4'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === currentUserId
                          ? 'text-white/70'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      {mission.client_id && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "J'ai bien reçu votre demande.",
                "Je serai là à l'heure convenue.",
                "Avez-vous des informations supplémentaires ?",
                "Merci pour votre confiance !"
              ].map((quickMessage) => (
                <Button
                  key={quickMessage}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewMessage(quickMessage)}
                  className="text-xs"
                >
                  {quickMessage}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}