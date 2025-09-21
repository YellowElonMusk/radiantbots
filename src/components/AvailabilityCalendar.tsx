import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailabilityCalendarProps {
  userId: string;
}

interface AvailabilityData {
  [dateStr: string]: boolean | null; // true = available, false = unavailable, null = not set
}

export function AvailabilityCalendar({ userId }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({});
  const { toast } = useToast();

  useEffect(() => {
    loadAvailability();
  }, [userId, currentDate]);

  const loadAvailability = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const { data, error } = await supabase
      .from('availability')
      .select('date, is_available')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error loading availability:', error);
      return;
    }

    const newAvailabilityData: AvailabilityData = {};
    data?.forEach(item => {
      newAvailabilityData[item.date] = item.is_available;
    });
    setAvailabilityData(newAvailabilityData);
  };

  const updateAvailability = async (date: Date, isAvailable: boolean) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('availability')
      .upsert({
        user_id: userId,
        date: dateStr,
        is_available: isAvailable
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
      return;
    }

    setAvailabilityData(prev => ({
      ...prev,
      [dateStr]: isAvailable
    }));

    toast({
      title: "Success",
      description: `Marked ${date.toLocaleDateString()} as ${isAvailable ? 'available' : 'unavailable'}`,
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr];
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Set Your Availability</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">{monthYear}</span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2"></div>;
            }

            const status = getDateStatus(date);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <div key={index} className="text-center">
                <div className={`
                  p-2 mb-2 rounded border text-sm font-medium
                  ${status === true ? 'bg-green-100 border-green-500 text-green-700' : 
                    status === false ? 'bg-red-100 border-red-500 text-red-700' : 
                    'bg-background border-border'}
                  ${isPast ? 'opacity-50' : ''}
                `}>
                  {date.getDate()}
                  {status !== null && (
                    <div className="mt-1">
                      <Badge 
                        variant={status ? "default" : "destructive"} 
                        className="text-xs py-0 px-1"
                      >
                        {status ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {!isPast && (
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant={status === true ? "default" : "outline"}
                      className="text-xs h-6 w-full"
                      onClick={() => updateAvailability(date, true)}
                    >
                      Available
                    </Button>
                    <Button
                      size="sm"
                      variant={status === false ? "destructive" : "outline"}
                      className="text-xs h-6 w-full"
                      onClick={() => updateAvailability(date, false)}
                    >
                      Unavailable
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}