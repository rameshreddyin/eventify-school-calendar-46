import { CalendarEvent } from "@/types/calendar";
import { addDays, setHours, startOfDay, subDays } from "date-fns";

const today = new Date();
const startOfToday = startOfDay(today);

export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Mid-Term Exams",
    description: "Math and Science mid-term examinations",
    category: "exam",
    start: addDays(setHours(startOfToday, 9), 2),
    end: addDays(setHours(startOfToday, 12), 2),
    allDay: false,
    location: "Main Building, Rooms 101-105",
    createdBy: "admin1",
    isRecurring: false,
    attendees: [
      {
        id: "student1",
        name: "John Smith",
        role: "student",
        responded: true,
        attending: true,
      },
      {
        id: "teacher1",
        name: "Emily Johnson",
        role: "teacher",
        responded: true,
        attending: true,
      },
    ],
    isApproved: true,
    classIds: ["class1", "class2"],
  },
  {
    id: "2",
    title: "Spring Break",
    description: "School closed for spring break",
    category: "holiday",
    start: addDays(startOfToday, 5),
    end: addDays(startOfToday, 12),
    allDay: true,
    createdBy: "admin1",
    isRecurring: false,
    attendees: [],
    isApproved: true,
  },
  {
    id: "3",
    title: "Parent-Teacher Conference",
    description: "Quarterly parent-teacher meeting",
    category: "meeting",
    start: addDays(setHours(startOfToday, 14), 3),
    end: addDays(setHours(startOfToday, 18), 3),
    allDay: false,
    location: "School Auditorium",
    createdBy: "admin2",
    isRecurring: false,
    attendees: [
      {
        id: "teacher1",
        name: "Emily Johnson",
        role: "teacher",
        responded: true,
        attending: true,
      },
      {
        id: "parent1",
        name: "Robert Davis",
        role: "parent",
        responded: false,
        attending: false,
      },
    ],
    isApproved: true,
  },
  {
    id: "4",
    title: "Basketball Tournament",
    description: "Inter-school basketball championship",
    category: "sport",
    start: addDays(setHours(startOfToday, 10), 7),
    end: addDays(setHours(startOfToday, 16), 7),
    allDay: false,
    location: "School Gymnasium",
    createdBy: "teacher3",
    isRecurring: false,
    attendees: [
      {
        id: "student2",
        name: "Michael Chen",
        role: "student",
        responded: true,
        attending: true,
      },
      {
        id: "teacher2",
        name: "Sarah Wilson",
        role: "teacher",
        responded: true,
        attending: true,
      },
    ],
    isApproved: true,
    classIds: ["class3", "class4"],
  },
  {
    id: "5",
    title: "Tuition Fee Due Date",
    description: "Last date for quarterly tuition fee payment",
    category: "administrative",
    start: addDays(startOfToday, 10),
    end: addDays(startOfToday, 10),
    allDay: true,
    createdBy: "admin1",
    isRecurring: false,
    attendees: [],
    isApproved: true,
  },
  {
    id: "6",
    title: "Science Fair",
    description: "Annual science project exhibition",
    category: "meeting",
    start: subDays(setHours(startOfToday, 9), 1),
    end: subDays(setHours(startOfToday, 15), 1),
    allDay: false,
    location: "School Hall",
    createdBy: "teacher1",
    isRecurring: false,
    attendees: [
      {
        id: "student1",
        name: "John Smith",
        role: "student",
        responded: true,
        attending: true,
      },
      {
        id: "student3",
        name: "David Lee",
        role: "student",
        responded: true,
        attending: true,
      },
    ],
    isApproved: true,
    classIds: ["class1", "class2", "class3"],
  },
  {
    id: "7",
    title: "Faculty Meeting",
    description: "Monthly staff coordination meeting",
    category: "meeting",
    start: addDays(setHours(startOfToday, 15), 1),
    end: addDays(setHours(startOfToday, 16, 30), 1),
    allDay: false,
    location: "Conference Room",
    createdBy: "admin2",
    isRecurring: true,
    recurrencePattern: "monthly",
    attendees: [
      {
        id: "teacher1",
        name: "Emily Johnson",
        role: "teacher",
        responded: true,
        attending: true,
      },
      {
        id: "teacher2",
        name: "Sarah Wilson",
        role: "teacher",
        responded: false,
        attending: false,
      },
    ],
    isApproved: true,
  },
  {
    id: "8",
    title: "Final Exams",
    description: "End of semester examinations",
    category: "exam",
    start: addDays(startOfToday, 14),
    end: addDays(startOfToday, 18),
    allDay: true,
    location: "Multiple Classrooms",
    createdBy: "admin1",
    isRecurring: false,
    attendees: [],
    isApproved: true,
  },
  {
    id: "9",
    title: "Report Card Distribution",
    description: "Semester report cards will be handed out",
    category: "administrative",
    start: addDays(setHours(startOfToday, 13), 20),
    end: addDays(setHours(startOfToday, 16), 20),
    allDay: false,
    location: "Classrooms",
    createdBy: "admin2",
    isRecurring: false,
    attendees: [],
    isApproved: true,
  },
  {
    id: "10",
    title: "Cultural Day",
    description: "Annual cultural performances and exhibitions",
    category: "sport",
    start: addDays(startOfToday, -3),
    end: addDays(startOfToday, -3),
    allDay: true,
    location: "School Auditorium and Grounds",
    createdBy: "teacher4",
    isRecurring: false,
    attendees: [],
    isApproved: true,
  },
  {
    id: "11",
    title: "Career Guidance Workshop",
    description: "Workshop for senior students on career planning",
    category: "meeting",
    start: addDays(setHours(startOfToday, 10), 4),
    end: addDays(setHours(startOfToday, 14), 4),
    allDay: false,
    location: "School Library",
    createdBy: "teacher5",
    isRecurring: false,
    attendees: [],
    isApproved: true,
    classIds: ["class5", "class6"],
  },
];

export const getEventById = (id: string): CalendarEvent | undefined => {
  return mockEvents.find(event => event.id === id);
};

export const filterEventsByCategory = (categories: string[]): CalendarEvent[] => {
  if (categories.length === 0) return mockEvents;
  return mockEvents.filter(event => categories.includes(event.category));
};

export const searchEvents = (query: string): CalendarEvent[] => {
  if (!query) return mockEvents;
  
  const lowerQuery = query.toLowerCase();
  return mockEvents.filter(
    event => 
      event.title.toLowerCase().includes(lowerQuery) || 
      event.description.toLowerCase().includes(lowerQuery) ||
      (event.location && event.location.toLowerCase().includes(lowerQuery))
  );
};
