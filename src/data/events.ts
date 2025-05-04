import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours, addMonths, format, setHours, startOfDay, subDays } from 'date-fns';
import { CalendarEvent, EventAttendee, EventCategory } from '@/types/calendar';

// Generate a random time between 9 AM and 5 PM
const randomBusinessHour = (date: Date): Date => {
  const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
  return setHours(date, hours);
};

// Generate a random duration between 30 minutes and 2 hours (in milliseconds)
const randomDuration = (): number => {
  return (Math.floor(Math.random() * 4) + 1) * 30 * 60 * 1000;
};

// Generate a random event category
const randomCategory = (): EventCategory => {
  const categories: EventCategory[] = ['exam', 'holiday', 'meeting', 'sport', 'administrative'];
  return categories[Math.floor(Math.random() * categories.length)];
};

// Generate a random boolean with a given probability
const randomBoolean = (probability = 0.5): boolean => {
  return Math.random() < probability;
};

// Generate a random attendee
const generateAttendee = (id: number): EventAttendee => {
  const roles: EventAttendee['role'][] = ['student', 'teacher', 'admin', 'staff', 'parent'];
  const role = roles[Math.floor(Math.random() * roles.length)];
  
  return {
    id: `attendee-${id}`,
    name: `${role.charAt(0).toUpperCase() + role.slice(1)} ${id}`,
    role,
    responded: randomBoolean(0.7),
    attending: randomBoolean(0.8),
    notificationPreferences: {
      email: randomBoolean(0.9),
      push: randomBoolean(0.7),
    },
  };
};

// Generate random attendees
const generateAttendees = (count: number): EventAttendee[] => {
  return Array.from({ length: count }, (_, i) => generateAttendee(i + 1));
};

// Generate a single event
const generateEvent = (id: number, date: Date): CalendarEvent => {
  const start = randomBusinessHour(date);
  const end = new Date(start.getTime() + randomDuration());
  const isAllDay = randomBoolean(0.2);
  const category = randomCategory();
  const isRecurring = randomBoolean(0.3);
  
  let recurrencePattern: CalendarEvent['recurrencePattern'] = undefined;
  if (isRecurring) {
    const patterns: NonNullable<CalendarEvent['recurrencePattern']>[] = ['daily', 'weekly', 'monthly', 'yearly'];
    recurrencePattern = patterns[Math.floor(Math.random() * patterns.length)];
  }
  
  return {
    id: `event-${id}`,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Event ${id}`,
    description: `This is a sample ${category} event with ID ${id}. This description provides details about the event.`,
    category,
    start: isAllDay ? startOfDay(start) : start,
    end: isAllDay ? startOfDay(end) : end,
    allDay: isAllDay,
    location: randomBoolean(0.7) ? `Room ${Math.floor(Math.random() * 100) + 100}` : undefined,
    createdBy: `user-${Math.floor(Math.random() * 5) + 1}`,
    isRecurring,
    recurrencePattern,
    attendees: generateAttendees(Math.floor(Math.random() * 5) + 1),
    isApproved: randomBoolean(0.9),
    classIds: randomBoolean(0.6) ? [`class-${Math.floor(Math.random() * 10) + 1}`] : undefined,
  };
};

// Generate events for a specific date range
const generateEventsForDateRange = (
  startDate: Date,
  endDate: Date,
  count: number
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < count; i++) {
    const randomDayOffset = Math.floor(Math.random() * daysDiff);
    const eventDate = addDays(startDate, randomDayOffset);
    events.push(generateEvent(i + 1, eventDate));
  }
  
  return events;
};

// Generate some predefined events for the current month
const generatePredefinedEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [];
  
  // Add a staff meeting every Monday
  for (let i = 0; i < 4; i++) {
    const meetingDate = addDays(today, (i * 7) - today.getDay() + 1); // Next Monday + i weeks
    if (meetingDate.getMonth() === today.getMonth()) {
      events.push({
        id: uuidv4(),
        title: 'Weekly Staff Meeting',
        description: 'Regular staff meeting to discuss ongoing projects and issues.',
        category: 'meeting',
        start: setHours(meetingDate, 9), // 9 AM
        end: setHours(meetingDate, 10), // 10 AM
        allDay: false,
        location: 'Conference Room A',
        createdBy: 'admin-1',
        isRecurring: true,
        recurrencePattern: 'weekly',
        attendees: generateAttendees(8),
        isApproved: true,
        classIds: undefined,
      });
    }
  }
  
  // Add a school holiday
  const holidayDate = addDays(today, 15);
  events.push({
    id: uuidv4(),
    title: 'School Holiday',
    description: 'School closed for national holiday.',
    category: 'holiday',
    start: startOfDay(holidayDate),
    end: startOfDay(holidayDate),
    allDay: true,
    createdBy: 'admin-1',
    isRecurring: false,
    attendees: [],
    isApproved: true,
  });
  
  // Add an exam period
  const examStartDate = addDays(today, 10);
  for (let i = 0; i < 5; i++) {
    const examDate = addDays(examStartDate, i);
    events.push({
      id: uuidv4(),
      title: `Final Exam - Subject ${i + 1}`,
      description: `Final examination for Subject ${i + 1}.`,
      category: 'exam',
      start: setHours(examDate, 10), // 10 AM
      end: setHours(examDate, 12), // 12 PM
      allDay: false,
      location: `Exam Hall ${String.fromCharCode(65 + i)}`, // Hall A, B, C, etc.
      createdBy: 'admin-2',
      isRecurring: false,
      attendees: generateAttendees(15),
      isApproved: true,
      classIds: [`class-${i + 1}`],
    });
  }
  
  // Add a sports event
  const sportsDate = addDays(today, 5);
  events.push({
    id: uuidv4(),
    title: 'Inter-School Basketball Tournament',
    description: 'Annual basketball tournament between local schools.',
    category: 'sport',
    start: setHours(sportsDate, 14), // 2 PM
    end: setHours(sportsDate, 17), // 5 PM
    allDay: false,
    location: 'School Gymnasium',
    createdBy: 'teacher-3',
    isRecurring: false,
    attendees: generateAttendees(20),
    isApproved: true,
    classIds: ['class-5', 'class-6', 'class-7'],
  });
  
  return events;
};

// Generate events for the current month and the next month
const today = new Date();
const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

// Generate random events
const randomEvents = generateEventsForDateRange(
  startOfCurrentMonth,
  endOfNextMonth,
  30
);

// Generate predefined events
const predefinedEvents = generatePredefinedEvents();

// Combine all events
export const events: CalendarEvent[] = [...randomEvents, ...predefinedEvents];

// Function to get events for a specific date range
export const getEventsForDateRange = (
  start: Date,
  end: Date
): CalendarEvent[] => {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return eventStart >= start && eventStart <= end || 
           eventEnd >= start && eventEnd <= end ||
           eventStart <= start && eventEnd >= end;
  });
};

// Function to get an event by ID
export const getEventById = (id: string): CalendarEvent | undefined => {
  return events.find((event) => event.id === id);
};

// Function to add a new event
export const addEvent = (event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
  const newEvent = { ...event, id: uuidv4() };
  events.push(newEvent);
  return newEvent;
};

// Function to update an existing event
export const updateEvent = (
  id: string,
  eventData: Partial<CalendarEvent>
): CalendarEvent | undefined => {
  const index = events.findIndex((event) => event.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...eventData };
    return events[index];
  }
  return undefined;
};

// Function to delete an event
export const deleteEvent = (id: string): boolean => {
  const index = events.findIndex((event) => event.id === id);
  if (index !== -1) {
    events.splice(index, 1);
    return true;
  }
  return false;
};
