
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

/**
 * Create attendees for notification groups
 */
export const createAttendeesFromNotificationGroups = (groups: string[]): EventAttendee[] => {
  const attendees: EventAttendee[] = [];
  
  const addAttendee = (role: EventAttendee['role'], shouldNotify: boolean) => {
    attendees.push({
      id: uuidv4(),
      name: role.charAt(0).toUpperCase() + role.slice(1),
      role,
      responded: true,
      attending: true,
      ...(shouldNotify ? {
        notificationPreferences: {
          email: true,
          push: true
        }
      } : {})
    });
  };

  if (groups.includes('all') || groups.includes('parents')) {
    addAttendee('parent', true);
  }
  
  if (groups.includes('all') || groups.includes('teachers')) {
    addAttendee('teacher', true);
  }
  
  if (groups.includes('all') || groups.includes('staff')) {
    addAttendee('staff', true);
  }
  
  if (groups.includes('all') || groups.includes('administration')) {
    addAttendee('admin', true);
  }
  
  return attendees;
};
