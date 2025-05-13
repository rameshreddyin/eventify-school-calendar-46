
export type CalendarViewType = "month" | "week" | "day";

export type EventCategory = "meeting" | "holiday" | "exam" | "cultural" | "pta" | "announcement" | "sport" | "administrative" | string;

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
  audienceType?: string[];
  showInCalendar?: boolean;
  sendPushNotification?: boolean;
  sendEmailAlert?: boolean;
  reminder?: {
    time: number;
    unit: "minutes" | "hours" | "days";
  };
  allowRSVP?: boolean;
  followUpNotification?: boolean;
}

export interface EventAttendee {
  id: string;
  name: string;
  role: "student" | "teacher" | "admin" | "staff" | "parent";
  responded: boolean;
  attending: boolean;
  classId?: string;
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

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel?: string;
}

export interface SchoolDepartment {
  id: string;
  name: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
}
