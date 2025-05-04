
export type CalendarViewType = "month" | "week" | "day";

export type EventCategory = "exam" | "holiday" | "meeting" | "sport" | "administrative" | string;

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  location?: string;
  createdBy: string;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
  attendees: EventAttendee[];
  isApproved: boolean;
  classIds?: string[];
}

export interface EventAttendee {
  id: string;
  name: string;
  role: "student" | "teacher" | "admin" | "staff" | "parent";
  responded: boolean;
  attending: boolean;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
}

export interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarMonth {
  weeks: {
    days: CalendarDay[];
  }[];
}
