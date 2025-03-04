import React, { useState } from "react";
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
import { Calendar, Clock, MapPin, Users, Bell, Check, X as XIcon, PenSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  if (!event) return null;

  const handleRSVP = (attending: boolean) => {
    // In a real app, this would update the backend
    toast({
      title: attending ? "RSVP Confirmed" : "RSVP Declined",
      description: attending 
        ? "You have been added to the attendee list" 
        : "You have declined this event",
    });
  };

  const handleNotificationToggle = (type: 'email' | 'push') => {
    if (type === 'email') {
      setNotifyEmail(!notifyEmail);
      toast({
        title: !notifyEmail ? "Email notifications enabled" : "Email notifications disabled",
      });
    } else {
      setNotifyPush(!notifyPush);
      toast({
        title: !notifyPush ? "Push notifications enabled" : "Push notifications disabled",
      });
    }
  };

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

          <div className="space-y-2">
            <div className="font-medium">Notifications</div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Email notifications</span>
              </div>
              <Switch
                checked={notifyEmail}
                onCheckedChange={() => handleNotificationToggle('email')}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>Push notifications</span>
              </div>
              <Switch
                checked={notifyPush}
                onCheckedChange={() => handleNotificationToggle('push')}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="outline" onClick={() => onEdit(event)}>
                <PenSquare className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleRSVP(false)}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                onClick={() => handleRSVP(true)}
              >
                <Check className="mr-2 h-4 w-4" />
                RSVP
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
