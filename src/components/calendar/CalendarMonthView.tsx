
import React from "react";
import { CalendarMonth, CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import EventChip from "./EventChip";

interface CalendarMonthViewProps {
  calendarMonth: CalendarMonth;
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  calendarMonth,
  onEventClick,
  onDateClick,
}) => {
  const renderDay = (
    date: Date,
    isCurrentMonth: boolean,
    isToday: boolean,
    events: CalendarEvent[]
  ) => {
    const maxVisibleEvents = 3;
    const visibleEvents = events.slice(0, maxVisibleEvents);
    const hasMoreEvents = events.length > maxVisibleEvents;

    return (
      <div
        key={date.toISOString()}
        className={`calendar-cell ${isToday ? "today" : ""} ${
          !isCurrentMonth ? "calendar-day-outside" : ""
        } cursor-pointer hover:bg-muted/50`}
        onClick={() => onDateClick(date)}
      >
        <div className="flex justify-end">
          <div
            className={isToday ? "date-today" : "text-sm font-medium"}
          >
            {format(date, "d")}
          </div>
        </div>

        <div className="mt-1 space-y-1">
          {visibleEvents.map((event) => (
            <EventChip
              key={event.id}
              event={event}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            />
          ))}

          {hasMoreEvents && (
            <div
              className="event-chip mt-1 text-center"
              style={{ backgroundColor: "#64748b" }}
              onClick={(e) => {
                e.stopPropagation();
                onDateClick(date);
              }}
            >
              +{events.length - maxVisibleEvents} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-grid">
      {calendarMonth.weeks.flatMap((week) =>
        week.days.map((day) =>
          renderDay(day.date, day.isCurrentMonth, day.isToday, day.events)
        )
      )}
    </div>
  );
};

export default CalendarMonthView;
