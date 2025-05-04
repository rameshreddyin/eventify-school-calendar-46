
import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  startOfDay,
} from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import EventForm from "@/components/calendar/EventForm";
import EventDetailsDialog from "@/components/calendar/EventDetailsDialog";
import { generateCalendarMonth, generateCalendarDays } from "@/utils/calendar";
import {
  events,
  getEventsForDateRange,
  getEventById,
  addEvent, 
  updateEvent,
  deleteEvent,
} from "@/data/events";
import { CalendarEvent, CalendarViewType } from "@/types/calendar";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import "../styles/calendar.css";

const EventsPage: React.FC = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [calendarTitle, setCalendarTitle] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(events);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  // Calculate calendar data based on current date and view
  useEffect(() => {
    updateCalendarTitle();
    updateFilteredEvents();
  }, [currentDate, view, selectedFilters, searchQuery]);

  const updateCalendarTitle = () => {
    switch (view) {
      case "month":
        setCalendarTitle(format(currentDate, "MMMM yyyy"));
        break;
      case "week": {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        if (format(weekStart, "MMM") === format(weekEnd, "MMM")) {
          setCalendarTitle(
            `${format(weekStart, "MMM d")} - ${format(weekEnd, "d, yyyy")}`
          );
        } else {
          setCalendarTitle(
            `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
          );
        }
        break;
      }
      case "day":
        setCalendarTitle(format(currentDate, "EEEE, MMMM d, yyyy"));
        break;
    }
  };

  const updateFilteredEvents = () => {
    // Get events for the current view period
    let eventsToShow = events;
    
    // Apply category filters if any are selected
    if (selectedFilters.length > 0) {
      eventsToShow = eventsToShow.filter(event => 
        selectedFilters.includes(event.category)
      );
    }
    
    // Apply search query if it exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      eventsToShow = eventsToShow.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        (event.location && event.location.toLowerCase().includes(query))
      );
    }
    
    setFilteredEvents(eventsToShow);
  };

  // Navigation handlers
  const handlePrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, -1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  // Generate calendar data
  const calendarMonth = generateCalendarMonth(currentDate, filteredEvents);
  const calendarDays = generateCalendarDays(currentDate, filteredEvents);
  
  // Today's events (for day view)
  const todayWithEvents = calendarDays.find(day => 
    isSameDay(day.date, currentDate)
  ) || {
    date: currentDate,
    events: [],
    isToday: true,
    isCurrentMonth: true
  };

  // Event handlers
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSubmitEvent = (formData: any) => {
    // Convert form data to CalendarEvent format
    const eventData: CalendarEvent = {
      id: selectedEvent?.id || uuidv4(),
      title: formData.title,
      description: formData.description || "",
      category: formData.category,
      start: formData.allDay 
        ? startOfDay(formData.startDate)
        : new Date(`${format(formData.startDate, "yyyy-MM-dd")}T${formData.startTime}`),
      end: formData.allDay
        ? startOfDay(formData.endDate)
        : new Date(`${format(formData.endDate, "yyyy-MM-dd")}T${formData.endTime}`),
      allDay: formData.allDay,
      location: formData.location || "",
      createdBy: "current-user",
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.recurrencePattern,
      attendees: selectedEvent?.attendees || [],
      isApproved: true,
    };

    // If notify attendees is checked, add notification preferences
    if (formData.notifyAttendees) {
      eventData.attendees = eventData.attendees.map(attendee => ({
        ...attendee,
        notificationPreferences: {
          email: true,
          push: true
        }
      }));
    }

    // Save the event
    if (selectedEvent) {
      updateEvent(eventData.id, eventData);
    } else {
      addEvent(eventData);
    }
    
    // Show toast notification
    toast({
      title: selectedEvent ? "Event updated" : "Event created",
      description: "Your calendar has been updated!"
    });
    
    // Close the form and update events
    setShowEventForm(false);
    updateFilteredEvents();
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(false);
    setShowEventForm(true);
  };

  const handleRSVPEvent = (eventId: string, attendeeId: string, attending: boolean) => {
    // Get the event first
    const event = getEventById(eventId);
    if (event) {
      // Find the attendee
      const updatedAttendees = event.attendees.map(attendee => 
        attendee.id === attendeeId
          ? { ...attendee, responded: true, attending }
          : attendee
      );
      
      // Update the event with the new attendees
      updateEvent(eventId, { attendees: updatedAttendees });
      
      // Show toast notification
      toast({
        title: attending ? "You're going!" : "You declined",
        description: attending 
          ? "You've confirmed your attendance" 
          : "You've declined this event"
      });
      
      // Close the details dialog
      setShowEventDetails(false);
      updateFilteredEvents();
    }
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView("day");
  };

  return (
    <MainLayout>
      <div className="calendar-container p-6">
        <CalendarToolbar
          onAddEvent={handleAddEvent}
          onSearch={setSearchQuery}
          onFilterChange={setSelectedFilters}
          selectedFilters={selectedFilters}
        />
        
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          title={calendarTitle}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onViewChange={setView}
        />
        
        <div className="calendar-view-container">
          {view === "month" && (
            <CalendarMonthView
              calendarMonth={calendarMonth}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
          
          {view === "week" && (
            <CalendarWeekView
              days={calendarDays}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
          
          {view === "day" && (
            <CalendarDayView
              day={todayWithEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>
        
        {/* Simple Event Form */}
        <EventForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSubmit={handleSubmitEvent}
          initialEvent={selectedEvent}
        />
        
        {/* Event Details Dialog */}
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          onEdit={handleEditEvent}
          onRSVP={handleRSVPEvent}
        />
      </div>
    </MainLayout>
  );
};

export default EventsPage;
