
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarEvent, EventCategory } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  PlusCircle,
  Users,
  MapPin,
  FileText,
  Bell,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Basic schema for the form
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string(),
  customCategory: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  notifyAttendees: z.boolean().default(false),
  addAttendees: z.boolean().default(false),
  attendeeRoles: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface EventCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initialEvent?: CalendarEvent;
}

const predefinedCategories = ["exam", "holiday", "meeting", "sport", "administrative"];
const attendeeRoles = ["student", "teacher", "admin", "staff", "parent"];

const EventCreationWizard: React.FC<EventCreationWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEvent,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [totalSteps] = useState(4);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialEvent
      ? {
          title: initialEvent.title,
          description: initialEvent.description,
          category: predefinedCategories.includes(initialEvent.category) 
            ? initialEvent.category 
            : "custom",
          customCategory: !predefinedCategories.includes(initialEvent.category) 
            ? initialEvent.category 
            : "",
          startDate: new Date(initialEvent.start),
          endDate: new Date(initialEvent.end),
          startTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.start), "HH:mm"),
          endTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.end), "HH:mm"),
          allDay: initialEvent.allDay,
          location: initialEvent.location,
          isRecurring: initialEvent.isRecurring,
          recurrencePattern: initialEvent.recurrencePattern,
          notifyAttendees: initialEvent.attendees.some(a => a.notificationPreferences !== undefined),
          addAttendees: initialEvent.attendees.length > 0,
          attendeeRoles: Array.from(new Set(initialEvent.attendees.map(a => a.role))),
        }
      : {
          title: "",
          description: "",
          category: "meeting",
          customCategory: "",
          startDate: new Date(),
          endDate: new Date(),
          startTime: "09:00",
          endTime: "10:00",
          allDay: false,
          location: "",
          isRecurring: false,
          recurrencePattern: undefined,
          notifyAttendees: false,
          addAttendees: false,
          attendeeRoles: [],
        },
  });

  const watchAllFields = form.watch();

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info
      const { title, category, customCategory } = form.getValues();
      if (!title) {
        form.setError("title", { message: "Title is required" });
        return;
      }
      
      if (category === "custom" && !customCategory) {
        form.setError("customCategory", { message: "Custom category name is required" });
        return;
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Prepare the values for submission
    const finalValues = { ...values };
    
    // If custom category is selected, use the custom category value
    if (values.category === "custom" && values.customCategory) {
      finalValues.category = values.customCategory;
    }
    
    // Remove the customCategory field before submitting
    delete finalValues.customCategory;
    
    onSubmit(finalValues);
    toast({
      title: initialEvent ? "Event updated" : "Event created",
      description: "Your event has been successfully saved!",
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-muted-foreground">
                Let's start with the essential details of your event.
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on the calendar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="sport">Sports & Cultural</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Custom Category
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Events are color-coded by category on the calendar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchAllFields.category === "custom" && (
              <FormField
                control={form.control}
                name="customCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event description"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide more details about your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Date & Time</h2>
              <p className="text-sm text-muted-foreground">
                When will your event take place?
              </p>
            </div>

            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">All Day Event</FormLabel>
                    <FormDescription>
                      Event will last the entire day
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!watchAllFields.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ""} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="time" {...field} value={field.value || ""} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Enter location" {...field} value={field.value || ""} />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Where will this event take place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Event</FormLabel>
                    <FormDescription>
                      This event repeats on a schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAllFields.isRecurring && (
              <FormField
                control={form.control}
                name="recurrencePattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Attendees</h2>
              <p className="text-sm text-muted-foreground">
                Specify who should attend this event
              </p>
            </div>

            <FormField
              control={form.control}
              name="addAttendees"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Add Attendees</FormLabel>
                    <FormDescription>
                      Invite people to this event
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAllFields.addAttendees && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="attendeeRoles"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Who should attend?</FormLabel>
                        <FormDescription>
                          Select the roles of people who should attend this event
                        </FormDescription>
                      </div>
                      {attendeeRoles.map((role) => (
                        <FormField
                          key={role}
                          control={form.control}
                          name="attendeeRoles"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={role}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={field.value?.includes(role)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, role])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== role
                                              )
                                            );
                                      }}
                                    />
                                    <FormLabel className="capitalize">{role}s</FormLabel>
                                  </div>
                                </FormControl>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyAttendees"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Send Notifications</FormLabel>
                        <FormDescription>
                          Attendees will receive email and app notifications
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {!watchAllFields.addAttendees && (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No attendees needed</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This event will not have specific attendees
                </p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Review & Confirm</h2>
              <p className="text-sm text-muted-foreground">
                Review your event details before saving
              </p>
            </div>
            
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{watchAllFields.title}</h3>
                <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs capitalize">
                  {watchAllFields.category === "custom" 
                    ? watchAllFields.customCategory 
                    : watchAllFields.category}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(watchAllFields.startDate, "MMMM d, yyyy")}
                  {watchAllFields.startDate.toDateString() !== watchAllFields.endDate.toDateString() && 
                    ` - ${format(watchAllFields.endDate, "MMMM d, yyyy")}`}
                </span>
              </div>
              
              {!watchAllFields.allDay && (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {watchAllFields.startTime} - {watchAllFields.endTime}
                  </span>
                </div>
              )}
              
              {watchAllFields.location && (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{watchAllFields.location}</span>
                </div>
              )}
              
              {watchAllFields.description && (
                <div className="flex items-start text-sm gap-2 pt-2">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="flex-1">{watchAllFields.description}</p>
                </div>
              )}
              
              {watchAllFields.isRecurring && watchAllFields.recurrencePattern && (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Repeats {watchAllFields.recurrencePattern}</span>
                </div>
              )}
              
              {watchAllFields.addAttendees && watchAllFields.attendeeRoles.length > 0 && (
                <div className="flex items-start text-sm gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Attendees: </span>
                    <span>{watchAllFields.attendeeRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1) + "s").join(", ")}</span>
                  </div>
                </div>
              )}
              
              {watchAllFields.addAttendees && watchAllFields.notifyAttendees && (
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications enabled</span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            Complete all steps to {initialEvent ? "update your" : "create a new"} event
          </DialogDescription>
        </DialogHeader>

        <div className="relative pb-6">
          <div className="absolute left-0 right-0 top-0 flex justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <React.Fragment key={i}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    i + 1 === step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`h-0.5 flex-1 self-center ${
                      i + 1 < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="mt-6">
              {renderStepContent()}

              <div className="mt-8 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit">
                    {initialEvent ? "Update Event" : "Create Event"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationWizard;
