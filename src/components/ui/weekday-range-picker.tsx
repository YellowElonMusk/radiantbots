import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isValid, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TIMEZONE = "Europe/Paris";

interface WeekdayRange {
  start_date: string;
  end_date: string;
  selected_weekdays: string[];
  weekend_excluded: boolean;
  count_weekdays: number;
}

interface WeekdayRangePickerProps {
  value?: WeekdayRange | null;
  onChange: (range: WeekdayRange | null) => void;
  minDate?: Date;
  maxWeekdays?: number;
  placeholder?: string;
  className?: string;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

function normalizeRange(startDate: Date, endDate: Date): WeekdayRange {
  const [start, end] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  
  const weekdays: string[] = [];
  const days = eachDayOfInterval({ start, end });
  
  days.forEach(day => {
    if (!isWeekend(day)) {
      // Convert to Europe/Paris timezone and format as YYYY-MM-DD
      const parisDate = toZonedTime(day, TIMEZONE);
      weekdays.push(formatInTimeZone(parisDate, TIMEZONE, 'yyyy-MM-dd'));
    }
  });

  return {
    start_date: formatInTimeZone(toZonedTime(start, TIMEZONE), TIMEZONE, 'yyyy-MM-dd'),
    end_date: formatInTimeZone(toZonedTime(end, TIMEZONE), TIMEZONE, 'yyyy-MM-dd'),
    selected_weekdays: weekdays,
    weekend_excluded: true,
    count_weekdays: weekdays.length
  };
}

export function WeekdayRangePicker({
  value,
  onChange,
  minDate,
  maxWeekdays = 30,
  placeholder = "Sélectionner une période",
  className
}: WeekdayRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [showTooltip, setShowTooltip] = React.useState<{ show: boolean; message: string }>({ show: false, message: "" });

  // Initialize from value prop
  React.useEffect(() => {
    if (value && value.selected_weekdays.length > 0) {
      const start = new Date(value.start_date);
      const end = new Date(value.end_date);
      if (isValid(start) && isValid(end)) {
        setStartDate(start);
        setEndDate(end);
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [value]);

  const handleDayClick = (date: Date) => {
    // Check if it's a weekend
    if (isWeekend(date)) {
      setShowTooltip({ show: true, message: "Les week-ends ne sont pas disponibles" });
      setTimeout(() => setShowTooltip({ show: false, message: "" }), 2000);
      return;
    }

    // Check if it's before minDate
    if (minDate && date < minDate) {
      setShowTooltip({ show: true, message: "Cette date n'est pas disponible" });
      setTimeout(() => setShowTooltip({ show: false, message: "" }), 2000);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // First click or reset
      setStartDate(date);
      setEndDate(null);
    } else {
      // Second click - temporarily set end date for visual feedback
      setEndDate(date);
      
      // Validate the range
      const range = normalizeRange(startDate, date);
      
      // Check max weekdays limit
      if (range.count_weekdays > maxWeekdays) {
        setShowTooltip({ show: true, message: `Maximum ${maxWeekdays} jours ouvrables autorisés` });
        setTimeout(() => setShowTooltip({ show: false, message: "" }), 2000);
        // Reset if exceeds limit
        setStartDate(null);
        setEndDate(null);
        return;
      }

      // If validation passes, emit the range and close
      onChange(range);
      setTimeout(() => setIsOpen(false), 200); // Slightly longer delay to show final selection
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDayClick(date);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate) return false;
    
    const compareDate = endDate || hoverDate;
    if (!compareDate) return date.getTime() === startDate.getTime();
    
    const [rangeStart, rangeEnd] = startDate <= compareDate ? [startDate, compareDate] : [compareDate, startDate];
    return date >= rangeStart && date <= rangeEnd && !isWeekend(date);
  };

  const isDateDisabled = (date: Date): boolean => {
    return isWeekend(date) || (minDate ? date < minDate : false);
  };

  const getDisplayText = (): string => {
    if (!value || value.selected_weekdays.length === 0) {
      return placeholder;
    }
    
    if (value.count_weekdays === 1) {
      return format(new Date(value.start_date), "dd/MM/yyyy");
    }
    
    return `${format(new Date(value.start_date), "dd/MM")} - ${format(new Date(value.end_date), "dd/MM/yyyy")}`;
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value?.selected_weekdays.length && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
            {value && value.count_weekdays > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {value.count_weekdays} jour{value.count_weekdays > 1 ? 's' : ''}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <DayPicker
              mode="single"
              className="pointer-events-auto"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                  "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  "min-h-[40px] min-w-[40px]" // Mobile touch targets
                ),
                day: cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 w-10 p-0 font-normal aria-selected:opacity-100 min-h-[40px] min-w-[40px]",
                  "focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-red-500 opacity-40 cursor-not-allowed",
                day_range_middle: "bg-blue-50 text-blue-900",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                Day: ({ date, ...props }) => {
                  const isInRange = isDateInRange(date);
                  const isDisabled = isDateDisabled(date);
                  const isStart = startDate && date.getTime() === startDate.getTime();
                  const isEnd = endDate && date.getTime() === endDate.getTime();

                  return (
                    <Tooltip open={showTooltip.show && isDisabled}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-10 w-10 p-0 font-normal min-h-[40px] min-w-[40px]",
                            "focus:outline-2 focus:outline-blue-500 focus:outline-offset-2",
                            isInRange && !isDisabled && "bg-blue-100 text-blue-900",
                            (isStart || isEnd) && !isDisabled && "ring-2 ring-blue-500 bg-blue-500 text-white",
                            isDisabled && "text-red-500 opacity-40 cursor-not-allowed hover:bg-transparent",
                            date.toDateString() === new Date().toDateString() && "font-bold bg-accent"
                          )}
                          onClick={() => !isDisabled && handleDayClick(date)}
                          onKeyDown={(e) => !isDisabled && handleKeyDown(e, date)}
                          onMouseEnter={() => !isDisabled && startDate && !endDate && setHoverDate(date)}
                          onMouseLeave={() => setHoverDate(null)}
                          disabled={isDisabled}
                          aria-label={format(date, "dd MMMM yyyy")}
                          {...props}
                        >
                          {format(date, "d")}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{showTooltip.message}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
              }}
              onDayClick={handleDayClick}
            />
            
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Sélectionné</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 text-red-500 border border-red-300 rounded flex items-center justify-center text-[8px]">×</div>
                  <span>Indisponible (week-end)</span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}