import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessages(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchUnreadMessages = async () => {
      try {
        // For now, we'll count all messages where user is receiver
        // In a real app, you'd track read status
        const { data, error } = await supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', userId);

        if (error) {
          console.error('Error fetching unread messages:', error);
        } else {
          setUnreadCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error in fetchUnreadMessages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadMessages();

    // Set up real-time subscription for message changes
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('Message change detected:', payload);
          // Refetch unread messages when there's a change
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount, isLoading };
}