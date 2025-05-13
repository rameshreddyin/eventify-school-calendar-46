
import React, { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import {
  Dialog,
  DialogContent,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventFormBasics from "./EventFormSteps/EventFormBasics";
import EventFormSchedule from "./EventFormSteps/EventFormSchedule";
import EventFormAudience from "./EventFormSteps/EventFormAudience";
import EventFormNotifications from "./EventFormSteps/EventFormNotifications";

// Mock data that would typically come from an API
const schoolClasses = [
  { id: "class-1", name: "Class 1", gradeLevel: "1st Grade" },
  { id: "class-2", name: "Class 2", gradeLevel: "1st Grade" },
  { id: "class-3", name: "Class 3", gradeLevel: "2nd Grade" },
  { id: "class-4", name: "Class 4", gradeLevel: "2nd Grade" },
  { id: "class-5", name: "Class 5", gradeLevel: "3rd Grade" },
  { id: "class-6", name: "Class 6", gradeLevel: "3rd Grade" },
];

const departments = [
  { id: "dept-1", name: "Administration" },
  { id: "dept-2", name: "Teaching Faculty" },
  { id: "dept-3", name: "Support Staff" },
  { id: "dept-4", name: "Maintenance" },
  { id: "dept-5", name: "IT Department" },
];

const subjects = [
  { id: "subj-1", name: "Mathematics" },
  { id: "subj-2", name: "Science" },
  { id: "subj-3", name: "English" },
  { id: "subj-4", name: "History" },
  { id: "subj-5", name: "Geography" },
  { id: "subj-6", name: "Art" },
  { id: "subj-7", name: "Music" },
  { id: "subj-8", name: "Physical Education" },
];

// Form schema with all required fields and validations
const formSchema = z.object({
  // Step 1: Basics
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  category: z.string({
    required_error: "Please select an event type.",
  }),

  // Step 2: Schedule
  allDay: z.boolean().default(false),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),

  // Step 3: Audience
  audienceType: z.array(z.string()).min(1, {
    message: "Please select at least one audience type",
  }),
  classes: z.array(z.string()).optional(),
  departments: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),

  // Step 4: Notifications
  sendPushNotification: z.boolean().default(false),
  sendEmailAlert: z.boolean().default(false),
  showInCalendar: z.boolean().default(true),
  notifyGroups: z.array(z.string()).optional(),
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.number().optional(),
  reminderUnit: z.enum(["minutes", "hours", "days"]).optional(),
  followUpNotification: z.boolean().default(false),
  allowRSVP: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initialEvent?: CalendarEvent;
}

const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialEvent,
}) => {
  const { toast } = useToast();
  
  // Track steps in the form wizard
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialEvent
      ? {
          // Map initial event values if editing
          title: initialEvent.title,
          description: initialEvent.description,
          category: initialEvent.category,
          allDay: initialEvent.allDay,
          startDate: new Date(initialEvent.start),
          endDate: new Date(initialEvent.end),
          startTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.start), "HH:mm"),
          endTime: initialEvent.allDay ? undefined : format(new Date(initialEvent.end), "HH:mm"),
          audienceType: initialEvent.audienceType || ["teachers"],
          classes: initialEvent.classIds || [],
          departments: [],
          subjects: [],
          sendPushNotification: initialEvent.sendPushNotification || false,
          sendEmailAlert: initialEvent.sendEmailAlert || false,
          showInCalendar: initialEvent.showInCalendar !== false,
          notifyGroups: initialEvent.audienceType || [],
          reminderEnabled: !!initialEvent.reminder,
          reminderTime: initialEvent.reminder?.time,
          reminderUnit: initialEvent.reminder?.unit,
          followUpNotification: initialEvent.followUpNotification || false,
          allowRSVP: initialEvent.allowRSVP || false,
        }
      : {
          // Default values for a new event
          title: "",
          description: "",
          category: "meeting",
          allDay: false,
          startDate: new Date(),
          endDate: new Date(),
          startTime: "09:00",
          endTime: "10:00",
          audienceType: ["teachers"],
          classes: [],
          departments: [],
          subjects: [],
          sendPushNotification: false,
          sendEmailAlert: true,
          showInCalendar: true,
          notifyGroups: ["teachers"],
          reminderEnabled: false,
          reminderTime: 30,
          reminderUnit: "minutes",
          followUpNotification: false,
          allowRSVP: true,
        },
  });

  // Watch values for conditional logic
  const allDay = form.watch("allDay");
  const selectedAudienceTypes = form.watch("audienceType") || [];
  const selectedCategory = form.watch("category");
  const reminderEnabled = form.watch("reminderEnabled");

  // Progress calculation for step indicator
  const progressPercentage = useMemo(() => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  }, [currentStep, totalSteps]);
  
  // Calculate if we should show various audience selection panels
  const showParentsPanel = selectedAudienceTypes.includes("parents");
  const showTeachersPanel = selectedAudienceTypes.includes("teachers");
  const showStudentsPanel = selectedAudienceTypes.includes("students");
  const showStaffPanel = selectedAudienceTypes.includes("staff");
  
  // Update notification groups when audience type changes
  useEffect(() => {
    // Only update if we have audience types selected
    if (selectedAudienceTypes && selectedAudienceTypes.length > 0) {
      // Skip the update if the values are already equal
      const currentNotifyGroups = form.getValues("notifyGroups") || [];
      const setsAreEqual = 
        currentNotifyGroups.length === selectedAudienceTypes.length &&
        selectedAudienceTypes.every(type => currentNotifyGroups.includes(type));
      
      if (!setsAreEqual) {
        form.setValue("notifyGroups", [...selectedAudienceTypes]);
      }
    }
  }, [selectedAudienceTypes]);

  // Set up automatic end time suggestion based on start time
  useEffect(() => {
    const startTime = form.watch("startTime");
    // Only update if startTime exists and endTime is not set or empty
    const endTime = form.getValues("endTime");
    if (startTime && (!endTime || endTime === "")) {
      // Parse start time to suggest end time (1 hour later)
      const [hours, minutes] = startTime.split(":").map(Number);
      const newHours = hours + 1 > 23 ? 23 : hours + 1;
      form.setValue("endTime", `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`);
    }
  }, [form.watch("startTime")]);

  // Early return if the form is not open to prevent unnecessary renders
  if (!isOpen) return null;

  const handleNext = async () => {
    let valid = false;
    
    if (currentStep === 1) {
      const result = await form.trigger(["title", "description", "category"]);
      valid = result;
    } else if (currentStep === 2) {
      const result = await form.trigger(["startDate", "endDate", "startTime", "endTime", "allDay"]);
      valid = result;
    } else if (currentStep === 3) {
      const result = await form.trigger(["audienceType"]);
      valid = result;
    } else {
      valid = true;
    }
    
    if (valid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Smooth scroll to top when changing steps
      document.querySelector('.dialog-content')?.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Smooth scroll to top when changing steps
      document.querySelector('.dialog-content')?.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = (values: FormValues) => {
    // Validate time inputs if not an all-day event
    if (!values.allDay) {
      if (!values.startTime || !values.endTime) {
        toast({
          title: "Missing time information",
          description: "Please specify both start and end times for this event.",
          variant: "destructive"
        });
        return;
      }
    }

    onSubmit(values);
    form.reset();
    setCurrentStep(1);
    
    toast({
      title: initialEvent ? "Event updated" : "Event created",
      description: initialEvent 
        ? "Your event has been successfully updated." 
        : "Your event has been successfully created.",
    });
  };

  // Step titles and descriptions
  const stepInfo = [
    {
      title: "Create New Event",
      description: "Start by giving your event a name and description."
    },
    {
      title: "When is this event happening?",
      description: "Set the date, time and duration for your event."
    },
    {
      title: "Who is this event for?",
      description: "Select the target audience for this event."
    },
    {
      title: "Notify your audience",
      description: "Configure notifications and visibility settings."
    },
  ];

  // Event type options
  const eventTypes = [
    { value: "meeting", label: "Meeting" },
    { value: "holiday", label: "Holiday" },
    { value: "exam", label: "Exam" },
    { value: "cultural", label: "Cultural Program" },
    { value: "pta", label: "PTA Meeting" },
    { value: "announcement", label: "Announcement" },
    { value: "sport", label: "Sports Event" },
    { value: "administrative", label: "Administrative" },
  ];
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col dialog-content">
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold">
            {stepInfo[currentStep-1].title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {stepInfo[currentStep-1].description}
          </DialogDescription>
          
          <div className="step-indicator mt-6">
            <div className="step-progress" style={{ width: `${progressPercentage}%` }}></div>
            
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="relative">
                <div className={`step-dot ${index + 1 === currentStep ? "active" : ""} ${index + 1 < currentStep ? "completed" : ""}`}>
                  {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="step-label">
                  {index === 0 ? "Basics" : index === 1 ? "Schedule" : index === 2 ? "Audience" : "Notifications"}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-0 flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-0 h-full overflow-auto">
              <div className="p-6 space-y-6">
                {currentStep === 1 && (
                  <EventFormBasics 
                    form={form} 
                    eventTypes={eventTypes}
                  />
                )}
                
                {currentStep === 2 && (
                  <EventFormSchedule 
                    form={form}
                  />
                )}

                {currentStep === 3 && (
                  <EventFormAudience
                    form={form}
                    schoolClasses={schoolClasses}
                    departments={departments}
                    subjects={subjects}
                  />
                )}

                {currentStep === 4 && (
                  <EventFormNotifications
                    form={form}
                    selectedAudienceTypes={selectedAudienceTypes}
                  />
                )}
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10 flex justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                
                {currentStep < totalSteps && (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                )}
                
                {currentStep === totalSteps && (
                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(handleSubmit)}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Create Event
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

export default EventForm;
