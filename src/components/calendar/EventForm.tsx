
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarEvent } from "@/types/calendar";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Available school classes
const schoolClasses = [
  { id: "class-1", label: "Class 1" },
  { id: "class-2", label: "Class 2" },
  { id: "class-3", label: "Class 3" },
  { id: "class-4", label: "Class 4" },
  { id: "class-5", label: "Class 5" },
  { id: "class-6", label: "Class 6" },
];

// Form schema with audience types and class selection
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  audienceType: z.array(z.string()).min(1, {
    message: "Please select at least one audience type",
  }),
  classes: z.array(z.string()).optional(),
  notify: z.boolean().default(false),
  notifyGroups: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initialEvent?: CalendarEvent;
}

const audienceTypes = [
  { id: "parents", label: "Parents" },
  { id: "teachers", label: "Teachers" },
  { id: "staff", label: "Staff" },
  { id: "students", label: "Students" },
  { id: "administration", label: "Administration" },
];

const notificationGroups = [
  { id: "parents", label: "Parents" },
  { id: "teachers", label: "Teachers" },
  { id: "staff", label: "All Staff" },
  { id: "administration", label: "Administration" },
  { id: "all", label: "Everyone" },
];

const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEvent,
}) => {
  const { toast } = useToast();
  
  // Track steps in the form wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialEvent
      ? {
          title: initialEvent.title,
          description: initialEvent.description,
          category: initialEvent.category,
          startDate: new Date(initialEvent.start),
          endDate: new Date(initialEvent.end),
          startTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.start), "HH:mm"),
          endTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.end), "HH:mm"),
          allDay: initialEvent.allDay,
          audienceType: initialEvent.audienceType || ["teachers"],
          classes: initialEvent.classIds || [],
          notify: initialEvent.attendees.some(a => a.notificationPreferences !== undefined),
          notifyGroups: initialEvent.attendees.some(a => a.notificationPreferences !== undefined) ? 
            ["all"] : [],
        }
      : {
          title: "",
          description: "",
          category: "meeting",
          startDate: new Date(),
          endDate: new Date(),
          startTime: "09:00",
          endTime: "10:00",
          allDay: false,
          audienceType: ["teachers"],
          classes: [],
          notify: true,
          notifyGroups: ["teachers"],
        },
  });

  const allDay = form.watch("allDay");
  const notify = form.watch("notify");
  const selectedAudienceTypes = form.watch("audienceType") || [];
  
  // Update notification groups when audience type changes
  useEffect(() => {
    if (selectedAudienceTypes.length > 0) {
      form.setValue("notifyGroups", [...selectedAudienceTypes]);
    }
  }, [selectedAudienceTypes, form]);

  const handleNext = async () => {
    let valid = false;
    
    if (currentStep === 1) {
      const result = await form.trigger(["title", "description", "category"]);
      valid = result;
    } else if (currentStep === 2) {
      const result = await form.trigger(["startDate", "endDate", "startTime", "endTime", "allDay"]);
      valid = result;
    }
    
    if (valid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
    setCurrentStep(1);
  };
  
  // Check if parents are selected as audience to show class options
  const shouldShowClassOptions = selectedAudienceTypes.includes("parents") || 
                                 selectedAudienceTypes.includes("students");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {initialEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {currentStep === 1 ? "Basic Details" : 
                                                currentStep === 2 ? "Schedule" : "Audience & Notifications"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 h-[60vh]">
          <Form {...form}>
            <form className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="allDay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">All Day</FormLabel>
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

                  {!allDay && (
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
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="audienceType"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Who is this event for?</FormLabel>
                          <FormDescription>
                            Select the audience groups for this event
                          </FormDescription>
                        </div>
                        <div className="space-y-2">
                          {audienceTypes.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="audienceType"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedValues = checked
                                            ? [...(field.value || []), item.id]
                                            : field.value?.filter((value) => value !== item.id) || [];
                                          field.onChange(updatedValues);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {shouldShowClassOptions && (
                    <FormField
                      control={form.control}
                      name="classes"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Which classes?</FormLabel>
                            <FormDescription>
                              Select specific classes for this event
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            {schoolClasses.map((classItem) => (
                              <FormField
                                key={classItem.id}
                                control={form.control}
                                name="classes"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={classItem.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(classItem.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValues = checked
                                              ? [...(field.value || []), classItem.id]
                                              : field.value?.filter((value) => value !== classItem.id) || [];
                                            field.onChange(updatedValues);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {classItem.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="notify"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Send Notifications</FormLabel>
                          <FormDescription>
                            Notify stakeholders about this event
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

                  {notify && (
                    <FormField
                      control={form.control}
                      name="notifyGroups"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Who to Notify</FormLabel>
                            <FormDescription>
                              Select which groups should be notified about this event
                            </FormDescription>
                          </div>
                          <div className="space-y-2">
                            {notificationGroups.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="notifyGroups"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValues = checked
                                              ? [...(field.value || []), item.id]
                                              : field.value?.filter((value) => value !== item.id) || [];
                                            field.onChange(updatedValues);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="mt-6 pt-2 border-t space-x-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          
          {currentStep < totalSteps && (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          )}
          
          {currentStep === totalSteps && (
            <Button type="button" onClick={form.handleSubmit(handleSubmit)}>
              Save Event
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
