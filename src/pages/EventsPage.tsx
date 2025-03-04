import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  createCalendarMonth,
  getMonthYearString,
  getNextMonth,
  getPrevMonth,
  getNextWeek,
  getPrevWeek,
  getNextDay,
  getPrevDay,
  getWeekDays,
  getWeekRangeString,
  populateCalendarEvents,
} from "@/utils/calendar";
import { CalendarEvent, CalendarViewType, CalendarMonth, CalendarDay } from "@/types/calendar";
import { 
  mockEvents, 
  filterEventsByCategory, 
  searchEvents, 
  addOrUpdateEvent,
  updateEventAttendee
} from "@/data/events";
import MainLayout from "@/components/layout/MainLayout";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import EventDetailsDialog from "@/components/calendar/EventDetailsDialog";
import EventForm from "@/components/calendar/EventForm";
import EventCreationWizard from "@/components/calendar/EventCreationWizard";
import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import { useToast } from "@/hooks/use-toast";

const EventsPage = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(
    createCalendarMonth(currentDate)
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isEventWizardOpen, setIsEventWizardOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [weekDays, setWeekDays] = useState<CalendarDay[]>([]);
  const [dayView, setDayView] = useState<CalendarDay | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [useWizard, setUseWizard] = useState(true);

  useEffect(() => {
    updateCalendarData();
  }, [currentDate, view, events, filteredEvents]);

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const updateCalendarData = () => {
    if (view === "month") {
      const newCalendarMonth = createCalendarMonth(currentDate);
      const populatedCalendar = populateCalendarEvents(
        newCalendarMonth,
        filteredEvents
      );
      setCalendarMonth(populatedCalendar);
    } else if (view === "week") {
      const days = getWeekDays(currentDate);
      
      const populatedDays = days.map(day => ({
        ...day,
        events: filteredEvents.filter(event => {
          const eventDate = new Date(event.start);
          return (
            eventDate.getDate() === day.date.getDate() &&
            eventDate.getMonth() === day.date.getMonth() &&
            eventDate.getFullYear() === day.date.getFullYear()
          );
        }),
      }));
      
      setWeekDays(populatedDays);
    } else if (view === "day") {
      const selectedDay = {
        date: currentDate,
        isCurrentMonth: true,
        isToday: 
          currentDate.getDate() === new Date().getDate() &&
          currentDate.getMonth() === new Date().getMonth() &&
          currentDate.getFullYear() === new Date().getFullYear(),
        events: filteredEvents.filter(event => {
          const eventDate = new Date(event.start);
          return (
            eventDate.getDate() === currentDate.getDate() &&
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getFullYear() === currentDate.getFullYear()
          );
        }),
      };
      
      setDayView(selectedDay);
    }
  };

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(getPrevMonth(currentDate));
    } else if (view === "week") {
      setCurrentDate(getPrevWeek(currentDate));
    } else if (view === "day") {
      setCurrentDate(getPrevDay(currentDate));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(getNextMonth(currentDate));
    } else if (view === "week") {
      setCurrentDate(getNextWeek(currentDate));
    } else if (view === "day") {
      setCurrentDate(getNextDay(currentDate));
    }
  };

  const handleViewChange = (newView: CalendarViewType) => {
    setView(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  const handleAddEvent = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    if (useWizard) {
      setIsEventWizardOpen(true);
    } else {
      setIsEventFormOpen(true);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    if (useWizard) {
      setIsEventWizardOpen(true);
    } else {
      setIsEventFormOpen(true);
    }
    setIsEventDetailsOpen(false);
  };

  const handleRSVP = (eventId: string, attendeeId: string, attending: boolean) => {
    try {
      updateEventAttendee(eventId, attendeeId, {
        responded: true,
        attending
      });
      
      setEvents([...mockEvents]);
      
      toast({
        title: `You have ${attending ? 'accepted' : 'declined'} the event invitation`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventFormSubmit = async (values: any) => {
    try {
      const eventData: CalendarEvent = {
        ...(isEditMode && selectedEvent ? selectedEvent : {}),
        id: isEditMode && selectedEvent ? selectedEvent.id : crypto.randomUUID(),
        title: values.title,
        description: values.description || "",
        category: values.category,
        start: new Date(
          values.startDate.getFullYear(),
          values.startDate.getMonth(),
          values.startDate.getDate(),
          values.allDay ? 0 : parseInt(values.startTime?.split(":")[0] || "0", 10),
          values.allDay ? 0 : parseInt(values.startTime?.split(":")[1] || "0", 10)
        ),
        end: new Date(
          values.endDate.getFullYear(),
          values.endDate.getMonth(),
          values.endDate.getDate(),
          values.allDay ? 23 : parseInt(values.endTime?.split(":")[0] || "0", 10),
          values.allDay ? 59 : parseInt(values.endTime?.split(":")[1] || "0", 10)
        ),
        allDay: values.allDay,
        location: values.location || undefined,
        isRecurring: values.isRecurring,
        recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
        createdBy: "current-user",
        attendees: (selectedEvent?.attendees || []).slice(),
        isApproved: true
      };

      if (values.addAttendees && values.attendeeRoles?.length > 0) {
        const roleAttendees: {[key: string]: string[]} = {
          student: ["John Smith", "David Lee", "Michael Chen"],
          teacher: ["Emily Johnson", "Sarah Wilson"],
          admin: ["Admin User"],
          staff: ["Staff Member"],
          parent: ["Robert Davis", "Parent User"]
        };
        
        const attendeeIds = {
          student: ["student1", "student2", "student3"],
          teacher: ["teacher1", "teacher2"],
          admin: ["admin1"],
          staff: ["staff1"],
          parent: ["parent1", "parent2"]
        };
        
        values.attendeeRoles.forEach((role: string, index: number) => {
          const namesList = roleAttendees[role] || [];
          const idsList = attendeeIds[role] || [];
          
          namesList.forEach((name, idx) => {
            if (idx < 2) {
              eventData.attendees.push({
                id: idsList[idx] || `${role}${idx+1}`,
                name,
                role: role as any,
                responded: false,
                attending: false,
                notificationPreferences: values.notifyAttendees ? {
                  email: true,
                  push: true,
                  reminderBefore: 30
                } : undefined
              });
            }
          });
        });
      }

      if (values.notifyAttendees) {
        eventData.attendees = eventData.attendees.map(attendee => ({
          ...attendee,
          notificationPreferences: attendee.notificationPreferences || {
            email: true,
            push: true,
            reminderBefore: 30
          }
        }));
      }

      addOrUpdateEvent(eventData);
      
      setEvents([...mockEvents]);
      
      toast({
        title: isEditMode ? "Event updated successfully" : "Event created successfully",
      });
      
      setIsEventFormOpen(false);
      setIsEventWizardOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setFilteredEvents(
        selectedFilters.length > 0
          ? filterEventsByCategory(selectedFilters)
          : events
      );
    } else {
      let results = searchEvents(query);
      
      if (selectedFilters.length > 0) {
        results = results.filter(event => selectedFilters.includes(event.category));
      }
      
      setFilteredEvents(results);
    }
  };

  const handleFilterChange = (categories: string[]) => {
    setSelectedFilters(categories);
    
    setFilteredEvents(
      categories.length > 0 ? filterEventsByCategory(categories) : events
    );
  };

  const getCalendarTitle = () => {
    if (view === "month") {
      return getMonthYearString(currentDate);
    } else if (view === "week") {
      return getWeekRangeString(currentDate);
    } else {
      return format(currentDate, "MMMM d, yyyy");
    }
  };

  const toggleCreationMode = () => {
    setUseWizard(!useWizard);
    toast({
      title: `Using ${!useWizard ? 'step-by-step wizard' : 'simple form'} for event creation`,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar & Events</h1>
            <p className="text-muted-foreground">
              Manage school events and schedules in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleCreationMode}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Switch to {useWizard ? 'simple form' : 'step-by-step wizard'}
            </button>
          </div>
        </div>

        <CalendarToolbar
          onAddEvent={handleAddEvent}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
        />

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6">
            <CalendarHeader
              currentDate={currentDate}
              view={view}
              title={getCalendarTitle()}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onViewChange={handleViewChange}
            />

            <div className="mt-6">
              {view === "month" && (
                <CalendarMonthView
                  calendarMonth={calendarMonth}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                />
              )}

              {view === "week" && (
                <CalendarWeekView
                  days={weekDays}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                />
              )}

              {view === "day" && dayView && (
                <CalendarDayView
                  day={dayView}
                  onEventClick={handleEventClick}
                />
              )}
            </div>
          </div>
        </div>

        <EventDetailsDialog
          event={selectedEvent}
          isOpen={isEventDetailsOpen}
          onClose={() => setIsEventDetailsOpen(false)}
          onEdit={handleEditEvent}
          onRSVP={handleRSVP}
        />

        {!useWizard && (
          <EventForm
            isOpen={isEventFormOpen}
            onClose={() => {
              setIsEventFormOpen(false);
              setIsEditMode(false);
            }}
            onSubmit={handleEventFormSubmit}
            initialEvent={isEditMode ? selectedEvent || undefined : undefined}
          />
        )}

        {useWizard && (
          <EventCreationWizard
            isOpen={isEventWizardOpen}
            onClose={() => {
              setIsEventWizardOpen(false);
              setIsEditMode(false);
            }}
            onSubmit={handleEventFormSubmit}
            initialEvent={isEditMode ? selectedEvent || undefined : undefined}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EventsPage;
