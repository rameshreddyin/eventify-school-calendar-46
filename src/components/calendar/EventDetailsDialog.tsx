
import React from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  const formatEventTime = (start: Date, end: Date, allDay: boolean) => {
    if (allDay) {
      return "All day";
    }
    
    const startTime = format(new Date(start), "h:mm a");
    const endTime = format(new Date(end), "h:mm a");
    return `${startTime} - ${endTime}`;
  };

  const formatEventDate = (start: Date, end: Date, allDay: boolean) => {
    const startDate = format(new Date(start), "MMMM d, yyyy");
    const endDate = format(new Date(end), "MMMM d, yyyy");
    
    if (startDate === endDate) {
      return startDate;
    }
    
    return `${startDate} - ${endDate}`;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      exam: "Exam",
      holiday: "Holiday",
      meeting: "Meeting",
      sport: "Sports & Cultural",
      administrative: "Administrative",
    };
    
    return categories[category] || category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {event.title}
            </DialogTitle>
            <Badge 
              className={`bg-event-${event.category} hover:bg-event-${event.category}/80`}
            >
              {getCategoryLabel(event.category)}
            </Badge>
          </div>
          <DialogDescription className="mt-2 text-base text-foreground">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          <div className="flex items-start space-x-3">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Date</div>
              <div>{formatEventDate(event.start, event.end, event.allDay)}</div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Time</div>
              <div>{formatEventTime(event.start, event.end, event.allDay)}</div>
              {event.isRecurring && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Recurring {event.recurrencePattern}
                </div>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Location</div>
                <div>{event.location}</div>
              </div>
            </div>
          )}

          {event.attendees.length > 0 && (
            <div className="flex items-start space-x-3">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Attendees</div>
                <div className="mt-1 space-y-1">
                  {event.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <span>{attendee.name}</span>
                      <Badge variant={attendee.attending ? "default" : "outline"}>
                        {attendee.attending ? "Attending" : "Not responded"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Edit</Button>
            <Button>RSVP</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
