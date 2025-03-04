
import React from "react";
import { format, addHours, startOfDay } from "date-fns";
import { CalendarDay, CalendarEvent } from "@/types/calendar";
import EventChip from "./EventChip";

interface CalendarDayViewProps {
  day: CalendarDay;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  day,
  onEventClick,
}) => {
  // Generate time slots for day view (7am to 9pm)
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 7);

  // Filter all-day events
  const allDayEvents = day.events.filter((event) => event.allDay);
  
  return (
    <div className="flex h-full flex-col">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="mb-4 rounded-md border p-3">
          <h3 className="mb-2 font-medium">All-day Events</h3>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <EventChip
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Time-based events */}
      <div className="flex-1 overflow-y-auto rounded-md border">
        {timeSlots.map((hour) => {
          const timeSlot = addHours(startOfDay(day.date), hour);
          
          // Filter events that start in this hour
          const hourEvents = day.events.filter((event) => {
            if (event.allDay) return false;
            
            const eventStart = new Date(event.start);
            const eventHour = eventStart.getHours();
            
            return eventHour === hour;
          });

          return (
            <div
              key={hour}
              className="grid grid-cols-[80px_1fr] border-b last:border-b-0"
            >
              <div className="border-r p-2 text-sm text-muted-foreground">
                {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
              <div className="p-1">
                {hourEvents.map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    showTime
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDayView;
