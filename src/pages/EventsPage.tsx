
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
import { createAttendeesFromNotificationGroups } from "@/utils/eventHelpers";
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
  }, [currentDate, view]);

  useEffect(() => {
    updateFilteredEvents();
  }, [selectedFilters, searchQuery]);

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
    let eventsToShow = events;
    
    if (selectedFilters.length > 0) {
      eventsToShow = eventsToShow.filter(event => 
        selectedFilters.includes(event.category)
      );
    }
    
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

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarMonth = generateCalendarMonth(currentDate, filteredEvents);
  const calendarDays = generateCalendarDays(currentDate, filteredEvents);
  
  const todayWithEvents = calendarDays.find(day => 
    isSameDay(day.date, currentDate)
  ) || {
    date: currentDate,
    events: [],
    isToday: true,
    isCurrentMonth: true
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSubmitEvent = (formData: any) => {
    // Create attendees based on audience type and notification settings
    let attendees: any[] = [];
    
    if ((formData.sendPushNotification || formData.sendEmailAlert) && formData.notifyGroups?.length > 0) {
      attendees = createAttendeesFromNotificationGroups(formData.notifyGroups);
      
      // Add notification preferences
      attendees = attendees.map(attendee => ({
        ...attendee,
        notificationPreferences: {
          email: formData.sendEmailAlert,
          push: formData.sendPushNotification
        }
      }));
      
      // Add class information to attendees if classes were selected
      if (formData.classes && formData.classes.length > 0 && 
          (formData.audienceType.includes("parents") || formData.audienceType.includes("students"))) {
        attendees = attendees.filter(a => a.role === "parent" || a.role === "student").map(attendee => ({
          ...attendee,
          // Assign the first class for simplicity
          classId: formData.classes[0]
        }));
      }
    }
    
    // Convert form start/end times into Date objects if not an all-day event
    let startDateTime = formData.startDate;
    let endDateTime = formData.endDate;
    
    if (!formData.allDay && formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      startDateTime = new Date(formData.startDate);
      startDateTime.setHours(startHours, startMinutes, 0);
      
      endDateTime = new Date(formData.endDate);
      endDateTime.setHours(endHours, endMinutes, 0);
    }
    
    // Build reminder object if enabled
    const reminder = formData.reminderEnabled ? {
      time: formData.reminderTime,
      unit: formData.reminderUnit
    } : undefined;
    
    const eventData: CalendarEvent = {
      id: selectedEvent?.id || uuidv4(),
      title: formData.title,
      description: formData.description || "",
      category: formData.category,
      start: startDateTime,
      end: endDateTime,
      allDay: formData.allDay,
      createdBy: "current-user",
      isRecurring: false,
      attendees: attendees,
      isApproved: true,
      audienceType: formData.audienceType,
      classIds: formData.classes,
      showInCalendar: formData.showInCalendar,
      sendPushNotification: formData.sendPushNotification,
      sendEmailAlert: formData.sendEmailAlert,
      reminder: reminder,
      allowRSVP: formData.allowRSVP,
      followUpNotification: formData.followUpNotification,
    };

    if (selectedEvent) {
      updateEvent(eventData.id, eventData);
    } else {
      addEvent(eventData);
    }
    
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
    const event = getEventById(eventId);
    if (event) {
      const updatedAttendees = event.attendees.map(attendee => 
        attendee.id === attendeeId
          ? { ...attendee, responded: true, attending }
          : attendee
      );
      
      updateEvent(eventId, { attendees: updatedAttendees });
      
      toast({
        title: attending ? "You're going!" : "You declined",
        description: attending 
          ? "You've confirmed your attendance" 
          : "You've declined this event"
      });
      
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
      <div className="calendar-container p-4 h-full">
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
          onToday={handleToday}
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
        
        <EventForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSubmit={handleSubmitEvent}
          initialEvent={selectedEvent}
        />
        
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
