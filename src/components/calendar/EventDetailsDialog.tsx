
import React from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";

export interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onRSVP: (eventId: string, attendeeId: string, attending: boolean) => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onRSVP,
}) => {
  if (!event) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exam":
        return "bg-event-exam";
      case "holiday":
        return "bg-event-holiday";
      case "meeting":
        return "bg-event-meeting";
      case "sport":
        return "bg-event-sport";
      case "administrative":
        return "bg-event-administrative";
      default:
        return "bg-gray-500";
    }
  };

  // Current user ID (in a real app, this would come from auth)
  const currentUserId = "student1";

  // Find the current user in the attendees list
  const currentUserAttendee = event.attendees.find(
    (attendee) => attendee.id === currentUserId
  );

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${getCategoryColor(
                event.category
              )}`}
            />
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {format(new Date(event.start), "EEEE, MMMM d, yyyy")}
                </div>
                {!event.allDay && (
                  <div className="text-sm text-muted-foreground">
                    {formatTime(new Date(event.start))} -{" "}
                    {formatTime(new Date(event.end))}
                  </div>
                )}
                {event.allDay && (
                  <Badge variant="outline" className="mt-1">
                    All day
                  </Badge>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="font-medium">{event.location}</div>
              </div>
            )}

            {event.isRecurring && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Recurring Event</div>
                  <div className="text-sm capitalize text-muted-foreground">
                    Repeats {event.recurrencePattern}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Description
            </h3>
            <p className="text-sm">
              {event.description || "No description provided"}
            </p>
          </div>

          {event.attendees.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Attendees
                </h3>
                <Badge variant="outline">
                  {event.attendees.filter((a) => a.attending).length}/
                  {event.attendees.length} confirmed
                </Badge>
              </div>
              <div className="space-y-2 rounded-lg border p-2">
                {event.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{attendee.name}</div>
                        <div className="text-xs capitalize text-muted-foreground">
                          {attendee.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {attendee.notificationPreferences && (
                        <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      {attendee.responded ? (
                        attendee.attending ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentUserAttendee && !currentUserAttendee.responded && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Will you attend?</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onRSVP(event.id, currentUserId, false)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onRSVP(event.id, currentUserId, true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(event)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
