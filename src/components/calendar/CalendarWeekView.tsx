
import React from "react";
import { format, isSameDay, addHours, startOfDay } from "date-fns";
import { CalendarDay, CalendarEvent } from "@/types/calendar";
import EventChip from "./EventChip";

interface CalendarWeekViewProps {
  days: CalendarDay[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  days,
  onEventClick,
  onDateClick,
}) => {
  // Generate time slots for week view (7am to 8pm)
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7);

  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-8 border-b">
        <div className="border-r p-2 text-center text-sm font-medium text-muted-foreground">
          Time
        </div>
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            className={`p-2 text-center ${
              day.isToday ? "bg-secondary/60 font-bold" : ""
            }`}
            onClick={() => onDateClick(day.date)}
          >
            <div className="text-sm font-medium">
              {format(day.date, "EEE")}
            </div>
            <div
              className={`text-sm ${
                day.isToday ? "date-today mx-auto" : ""
              }`}
            >
              {format(day.date, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-8 overflow-y-auto">
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time column */}
            <div className="border-r border-t p-2 text-xs text-muted-foreground">
              {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const startTime = addHours(startOfDay(day.date), hour);
              const endTime = addHours(startTime, 1);
              
              // Filter events that fall within this hour block
              const hourEvents = day.events.filter((event) => {
                if (event.allDay) return false;
                
                const eventStart = new Date(event.start);
                const eventHour = eventStart.getHours();
                
                // Check if event starts during this hour
                return isSameDay(eventStart, day.date) && eventHour === hour;
              });

              return (
                <div
                  key={day.date.toISOString() + hour}
                  className="relative border-t p-1"
                  onClick={() => onDateClick(day.date)}
                >
                  {hourEvents.map((event) => (
                    <EventChip
                      key={event.id}
                      event={event}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarWeekView;
