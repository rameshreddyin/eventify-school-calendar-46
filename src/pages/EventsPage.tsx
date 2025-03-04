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
import { mockEvents, filterEventsByCategory, searchEvents } from "@/data/events";
import MainLayout from "@/components/layout/MainLayout";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarMonthView from "@/components/calendar/CalendarMonthView";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import CalendarDayView from "@/components/calendar/CalendarDayView";
import EventDetailsDialog from "@/components/calendar/EventDetailsDialog";
import EventForm from "@/components/calendar/EventForm";
import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import { toast } from "@/hooks/use-toast";

const EventsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(
    createCalendarMonth(currentDate)
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [weekDays, setWeekDays] = useState<CalendarDay[]>([]);
  const [dayView, setDayView] = useState<CalendarDay | null>(null);

  useEffect(() => {
    updateCalendarData();
  }, [currentDate, view, filteredEvents]);

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
      
      // Populate days with events
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
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setIsEventFormOpen(true);
    setIsEventDetailsOpen(false);
  };

  const handleEventFormSubmit = async (values: any) => {
    try {
      // In a real application, this would update the backend
      const updatedEvent = {
        ...(isEditMode ? selectedEvent : {}),
        ...values,
        id: isEditMode ? selectedEvent?.id : crypto.randomUUID(),
        isApproved: true,
      };
      
      toast({
        title: isEditMode ? "Event updated successfully" : "Event created successfully",
      });
      
      // Close the form dialog
      setIsEventFormOpen(false);
      setIsEditMode(false);
      
      // In a real application, you would refresh your events here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      // If search is cleared, apply only category filters
      setFilteredEvents(
        selectedFilters.length > 0
          ? filterEventsByCategory(selectedFilters)
          : mockEvents
      );
    } else {
      // Apply both search and category filters
      let results = searchEvents(query);
      
      if (selectedFilters.length > 0) {
        results = results.filter(event => selectedFilters.includes(event.category));
      }
      
      setFilteredEvents(results);
    }
  };

  const handleFilterChange = (categories: string[]) => {
    setSelectedFilters(categories);
    
    // Apply filters to events
    setFilteredEvents(
      categories.length > 0 ? filterEventsByCategory(categories) : mockEvents
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

  return (
    <MainLayout>
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Calendar & Events</h1>
          <p className="text-muted-foreground">
            Manage school events and schedules in one place
          </p>
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
        />

        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => {
            setIsEventFormOpen(false);
            setIsEditMode(false);
          }}
          onSubmit={handleEventFormSubmit}
          initialEvent={isEditMode ? selectedEvent : undefined}
        />
      </div>
    </MainLayout>
  );
};

export default EventsPage;
