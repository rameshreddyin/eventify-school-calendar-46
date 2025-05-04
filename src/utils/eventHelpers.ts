
import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent, EventAttendee } from '@/types/calendar';

/**
 * Generate a new unique ID for an event
 */
export const generateEventId = (): string => {
  return uuidv4();
};

/**
 * Create a new event with default values
 */
export const createDefaultEvent = (title: string = ''): Partial<CalendarEvent> => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  
  return {
    id: generateEventId(),
    title: title,
    description: '',
    category: 'administrative',
    start: now,
    end: oneHourLater,
    allDay: false,
    createdBy: 'current-user',
    isRecurring: false,
    attendees: [],
    isApproved: false
  };
};

/**
 * Create a new attendee
 */
export const createAttendee = (name: string, role: EventAttendee['role']): EventAttendee => {
  return {
    id: uuidv4(),
    name,
    role,
    responded: false,
    attending: false
  };
};
