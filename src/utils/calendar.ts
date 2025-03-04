
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  format,
  parse,
  isWithinInterval,
  addDays,
  addWeeks,
  subWeeks,
  getDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { 
  CalendarDay, 
  CalendarEvent, 
  CalendarMonth, 
  CalendarWeek 
} from "@/types/calendar";

// Get days for a given week
export const getWeekDays = (date: Date): CalendarDay[] => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });

  return eachDayOfInterval({ start, end }).map((day) => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
    events: [],
  }));
};

// Get weeks for a given month
export const getMonthWeeks = (date: Date): CalendarWeek[] => {
  const firstDay = startOfMonth(date);
  const lastDay = endOfMonth(date);
  
  return eachWeekOfInterval(
    { start: firstDay, end: lastDay },
    { weekStartsOn: 0 }
  ).map((weekStart) => {
    return {
      days: getWeekDays(weekStart),
    };
  });
};

// Create a calendar month structure
export const createCalendarMonth = (date: Date): CalendarMonth => {
  return {
    weeks: getMonthWeeks(date),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
};

// Get the next month
export const getNextMonth = (date: Date): Date => {
  return addMonths(date, 1);
};

// Get the previous month
export const getPrevMonth = (date: Date): Date => {
  return subMonths(date, 1);
};

// Get the next week
export const getNextWeek = (date: Date): Date => {
  return addWeeks(date, 1);
};

// Get the previous week
export const getPrevWeek = (date: Date): Date => {
  return subWeeks(date, 1);
};

// Get the next day
export const getNextDay = (date: Date): Date => {
  return addDays(date, 1);
};

// Get the previous day
export const getPrevDay = (date: Date): Date => {
  return addDays(date, -1);
};

// Format date for display
export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr);
};

// Filter events for a specific day
export const getEventsForDay = (
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] => {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return events.filter((event) => {
    // For all-day events or events spanning multiple days
    if (event.allDay) {
      return isWithinInterval(day, { start: event.start, end: event.end });
    }
    
    // For events within a single day
    return (
      isWithinInterval(event.start, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(event.end, { start: dayStart, end: dayEnd }) ||
      (event.start <= dayStart && event.end >= dayEnd)
    );
  });
};

// Populate events for each day in the calendar
export const populateCalendarEvents = (
  calendarMonth: CalendarMonth,
  events: CalendarEvent[]
): CalendarMonth => {
  const updatedWeeks = calendarMonth.weeks.map((week) => {
    const updatedDays = week.days.map((day) => {
      return {
        ...day,
        events: getEventsForDay(events, day.date),
      };
    });
    return { ...week, days: updatedDays };
  });

  return { ...calendarMonth, weeks: updatedWeeks };
};

// Get the day name abbreviations
export const getDayNames = (): string[] => {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
};

// Get a formatted month and year string
export const getMonthYearString = (date: Date): string => {
  return format(date, "MMMM yyyy");
};

// Helper to get a string key from a date
export const getDateKey = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// Helper to parse a date from a string key
export const parseDateKey = (dateKey: string): Date => {
  return parse(dateKey, "yyyy-MM-dd", new Date());
};

// Get weekly date range string
export const getWeekRangeString = (date: Date): string => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
};

// Get the column position for a time-based event
export const getEventColumnPosition = (date: Date): number => {
  return getDay(date);
};
