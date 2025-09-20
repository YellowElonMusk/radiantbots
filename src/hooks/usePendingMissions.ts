import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePendingMissions(userId?: string) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPendingCount(0);
      setIsLoading(false);
      return;
    }

    const fetchPendingMissions = async () => {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('id')
          .eq('technician_id', userId)
          .eq('status', 'pending');

        if (error) {
          console.error('Error fetching pending missions:', error);
        } else {
          setPendingCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error in fetchPendingMissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingMissions();

    // Set up real-time subscription for missions changes
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
          filter: `technician_id=eq.${userId}`
        },
        (payload) => {
          console.log('Mission change detected:', payload);
          // Refetch pending missions when there's a change
          fetchPendingMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { pendingCount, isLoading };
}