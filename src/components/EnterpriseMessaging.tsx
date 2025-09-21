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
  receiver_id: string;
  created_at: string;
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
}

interface EnterpriseMessagingProps {
  technicianId: string;
  onBack: () => void;
  currentUserId: string;
  onViewProfile?: (technicianId: string) => void;
}

export function EnterpriseMessaging({ technicianId, onBack, currentUserId, onViewProfile }: EnterpriseMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [technician, setTechnician] = useState<any>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTechnicianAndMission();
  }, [technicianId, currentUserId]);

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

  const loadTechnicianAndMission = async () => {
    try {
      // Load technician profile
      const { data: techData, error: techError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', technicianId)
        .single();

      if (techError) throw techError;
      setTechnician(techData);

      // Load mission between current user and technician
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('client_user_id', currentUserId)
        .eq('technician_id', technicianId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (missionError && missionError.code !== 'PGRST116') throw missionError;
      if (missionData) {
        setMission(missionData);
      }
    } catch (error) {
      console.error('Error loading technician and mission:', error);
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
      setMessages(data || []);
      
      // Mark messages as read when loading conversation
      console.log('Loading messages for mission:', mission.id, 'user:', currentUserId);
      await markMissionMessagesAsRead(mission.id, currentUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !mission?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: currentUserId,
          receiver_id: technicianId,
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

      setMessages(prev => [...prev, data]);
      setNewMessage('');

      // Simulate technician response after a short delay
      setTimeout(() => {
        simulateTechnicianResponse();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const simulateTechnicianResponse = async () => {
    if (!mission?.id) return;

    const responses = [
      "Merci pour votre message ! Je prends note de vos exigences.",
      "Parfait, je serai là à l'heure convenue.",
      "J'ai bien reçu votre demande, je vous confirme ma disponibilité.",
      "Excellent, j'ai hâte de travailler avec vous sur ce projet.",
      "Compris, je prépare le matériel nécessaire."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: randomResponse,
          sender_id: technicianId,
          receiver_id: currentUserId,
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
      setMessages(prev => [...prev, data]);
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

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(technicianId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!technician || !mission) {
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
              <Avatar 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleViewProfile}
              >
                <AvatarImage src={technician.profile_photo_url} />
                <AvatarFallback>
                  {technician.first_name?.[0]}{technician.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 
                  className="font-semibold cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewProfile}
                >
                  {technician.first_name} {technician.last_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {technician.hourly_rate}€/heure
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
              <p className="text-sm text-gray-600">
                Date souhaitée: {formatDate(mission.desired_date)}
              </p>
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
              "Confirmez-vous votre disponibilité ?",
              "À quelle heure pouvez-vous commencer ?",
              "Avez-vous besoin d'informations supplémentaires ?",
              "Merci pour votre professionnalisme !"
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
    </div>
  );
}