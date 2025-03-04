
import React from "react";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

interface EventChipProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  showTime?: boolean;
}

const EventChip: React.FC<EventChipProps> = ({
  event,
  onClick,
  showTime = false,
}) => {
  return (
    <div
      className={`event-chip ${event.category}`}
      onClick={onClick}
    >
      {showTime && !event.allDay && (
        <span className="mr-1 font-medium">
          {format(new Date(event.start), "h:mm a")}
        </span>
      )}
      {event.title}
    </div>
  );
};

export default EventChip;
