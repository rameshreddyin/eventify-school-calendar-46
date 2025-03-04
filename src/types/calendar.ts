
export type CalendarViewType = 'month' | 'week' | 'day';

export type EventCategory = 
  | 'exam' 
  | 'holiday' 
  | 'meeting' 
  | 'sport' 
  | 'administrative';

export interface EventAttendee {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'staff' | 'parent';
  responded: boolean;
  attending: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  createdBy: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEndDate?: Date;
  attendees: EventAttendee[];
  isApproved: boolean;
  classIds?: string[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  weeks: CalendarWeek[];
  month: number;
  year: number;
}
