
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subWeeks,
  addWeeks,
  format,
} from 'date-fns';
import { CalendarEvent, CalendarDay, CalendarMonth } from '@/types/calendar';

// Get an array of day names (Sun, Mon, etc.)
export const getDayNames = () => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
};

// Generate days for a month view calendar
export const generateCalendarMonth = (
  date: Date,
  events: CalendarEvent[]
): CalendarMonth => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days in the calendar grid (including those from prev/next month)
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Find today's date
  const today = new Date();

  // Group days into weeks
  const weeks: { days: CalendarDay[] }[] = [];
  let week: CalendarDay[] = [];
  
  allDays.forEach((day, index) => {
    // Add events for this day
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // For all-day or multi-day events, check if this day falls within the event duration
      if (event.allDay) {
        return isSameDay(day, eventStart) || 
               (day >= eventStart && day <= eventEnd);
      }
      
      // For regular events, check if they start on this day
      return isSameDay(day, eventStart);
    });
    
    // Create the calendar day object
    const calendarDay: CalendarDay = {
      date: day,
      events: dayEvents,
      isToday: isSameDay(day, today),
      isCurrentMonth: isSameMonth(day, date)
    };
    
    // Add to the current week
    week.push(calendarDay);
    
    // Start a new week after every 7 days
    if (week.length === 7) {
      weeks.push({ days: week });
      week = [];
    }
  });
  
  return { weeks };
};

// Generate days for a week view
export const generateCalendarDays = (date: Date, events: CalendarEvent[]): CalendarDay[] => {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();
  
  return days.map(day => {
    // Add events for this day
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // For all-day or multi-day events
      if (event.allDay) {
        return isSameDay(day, eventStart) || 
               (day >= eventStart && day <= eventEnd);
      }
      
      // For regular events
      return isSameDay(day, eventStart);
    });
    
    return {
      date: day,
      events: dayEvents,
      isToday: isSameDay(day, today),
      isCurrentMonth: isSameMonth(day, date)
    };
  });
};

// Format date for display in calendar
export const formatCalendarDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
