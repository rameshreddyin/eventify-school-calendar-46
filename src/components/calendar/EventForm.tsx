
import React, { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, Clock, Users, Bell, Bookmark, Tag, BookOpen, School, Calendar as CalendarIcon2 } from "lucide-react";
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
  { id: "parents", label: "Parents", icon: <Users size={16} /> },
  { id: "teachers", label: "Teachers", icon: <BookOpen size={16} /> },
  { id: "staff", label: "Staff", icon: <Users size={16} /> },
  { id: "students", label: "Students", icon: <School size={16} /> },
  { id: "administration", label: "Administration", icon: <Users size={16} /> },
];

const notificationGroups = [
  { id: "parents", label: "Parents", icon: <Users size={16} /> },
  { id: "teachers", label: "Teachers", icon: <BookOpen size={16} /> },
  { id: "staff", label: "All Staff", icon: <Users size={16} /> },
  { id: "administration", label: "Administration", icon: <Users size={16} /> },
  { id: "all", label: "Everyone", icon: <Users size={16} /> },
];

const categoryColors: Record<string, string> = {
  exam: "bg-red-500",
  holiday: "bg-green-500",
  meeting: "bg-blue-500",
  sport: "bg-orange-500",
  administrative: "bg-purple-500",
};

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
  const selectedCategory = form.watch("category");
  
  // Progress calculation for step indicator
  const progressPercentage = useMemo(() => {
    return ((currentStep - 1) / (totalSteps - 1)) * 100;
  }, [currentStep, totalSteps]);
  
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {initialEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
          <DialogDescription>
            Complete all details to create your event
          </DialogDescription>
          
          <div className="step-indicator mt-6">
            <div className="step-progress" style={{ width: `${progressPercentage}%` }}></div>
            
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className={`relative ${index+1 === currentStep ? "step-active" : ""}`}>
                <div className={`step-dot ${index + 1 === currentStep ? "active" : ""} ${index + 1 < currentStep ? "completed" : ""}`}>
                  {index + 1 < currentStep ? "" : index + 1}
                </div>
                <span className="step-label">
                  {index === 0 ? "Details" : index === 1 ? "Schedule" : "Audience"}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 h-[60vh] py-4">
          <Form {...form}>
            <form className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="form-section">
                    <div className="form-section-title">
                      <Bookmark size={18} />
                      <span>Basic Information</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter event description"
                              className="resize-none bg-background min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="form-section">
                    <div className="form-section-title">
                      <Tag size={18} />
                      <span>Event Category</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries({
                              exam: { label: "Exam", color: "bg-red-500" },
                              holiday: { label: "Holiday", color: "bg-green-500" },
                              meeting: { label: "Meeting", color: "bg-blue-500" },
                              sport: { label: "Sports & Cultural", color: "bg-orange-500" },
                              administrative: { label: "Administrative", color: "bg-purple-500" }
                            }).map(([value, { label, color }]) => (
                              <FormItem key={value} className="flex flex-col items-center space-x-0 space-y-0">
                                <FormControl>
                                  <div
                                    className={`
                                      relative h-full w-full rounded-md p-4 text-center cursor-pointer transition-all
                                      border-2 flex flex-col items-center justify-center gap-2
                                      ${field.value === value ? 'border-primary bg-primary/10' : 'border-muted bg-background hover:bg-accent'}
                                    `}
                                    onClick={() => field.onChange(value)}
                                  >
                                    <div className={`w-4 h-4 rounded-full ${color}`}></div>
                                    <span className="text-sm font-medium">{label}</span>
                                  </div>
                                </FormControl>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="form-section">
                    <div className="form-section-title">
                      <CalendarIcon2 size={18} />
                      <span>Event Timing</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="allDay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
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
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                  <Input type="time" {...field} value={field.value || ""} className="bg-background" />
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
                                  <Input type="time" {...field} value={field.value || ""} className="bg-background" />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="form-section">
                    <div className="form-section-title">
                      <Users size={18} />
                      <span>Event Audience</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="audienceType"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base mb-3 block">Who is this event for?</FormLabel>
                          <div className="checkbox-grid">
                            {audienceTypes.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="audienceType"
                                render={({ field }) => {
                                  const isSelected = field.value?.includes(item.id);
                                  return (
                                    <div 
                                      className={`checkbox-item ${isSelected ? 'checkbox-item-selected' : ''}`}
                                      onClick={() => {
                                        const updatedValues = isSelected
                                          ? field.value?.filter((value) => value !== item.id) || []
                                          : [...(field.value || []), item.id];
                                        field.onChange(updatedValues);
                                      }}
                                    >
                                      <label className="checkbox-label w-full cursor-pointer">
                                        <FormControl>
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => {}}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                        </FormControl>
                                        <div className="flex items-center gap-1.5">
                                          {item.icon}
                                          <span>{item.label}</span>
                                        </div>
                                      </label>
                                    </div>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {shouldShowClassOptions && (
                    <div className="form-section">
                      <div className="form-section-title">
                        <School size={18} />
                        <span>Class Selection</span>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="classes"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base mb-3 block">
                              Select specific classes to include
                            </FormLabel>
                            <div className="checkbox-grid">
                              {schoolClasses.map((classItem) => (
                                <FormField
                                  key={classItem.id}
                                  control={form.control}
                                  name="classes"
                                  render={({ field }) => {
                                    const isSelected = field.value?.includes(classItem.id);
                                    return (
                                      <div 
                                        className={`checkbox-item ${isSelected ? 'checkbox-item-selected' : ''}`}
                                        onClick={() => {
                                          const updatedValues = isSelected
                                            ? field.value?.filter((value) => value !== classItem.id) || []
                                            : [...(field.value || []), classItem.id];
                                          field.onChange(updatedValues);
                                        }}
                                      >
                                        <label className="checkbox-label w-full cursor-pointer">
                                          <FormControl>
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={() => {}}
                                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                          </FormControl>
                                          <span>{classItem.label}</span>
                                        </label>
                                      </div>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="form-section">
                    <div className="form-section-title">
                      <Bell size={18} />
                      <span>Notifications</span>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notify"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
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
                            <FormLabel className="text-base mb-3 block">Who should be notified?</FormLabel>
                            <div className="checkbox-grid">
                              {notificationGroups.map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="notifyGroups"
                                  render={({ field }) => {
                                    const isSelected = field.value?.includes(item.id);
                                    return (
                                      <div 
                                        className={`checkbox-item ${isSelected ? 'checkbox-item-selected' : ''}`}
                                        onClick={() => {
                                          const updatedValues = isSelected
                                            ? field.value?.filter((value) => value !== item.id) || []
                                            : [...(field.value || []), item.id];
                                          field.onChange(updatedValues);
                                        }}
                                      >
                                        <label className="checkbox-label w-full cursor-pointer">
                                          <FormControl>
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={() => {}}
                                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                          </FormControl>
                                          <div className="flex items-center gap-1.5">
                                            {item.icon}
                                            <span>{item.label}</span>
                                          </div>
                                        </label>
                                      </div>
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
                </div>
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="mt-6 pt-4 border-t flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
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
                className={`${selectedCategory ? categoryColors[selectedCategory] : 'bg-primary'} text-white hover:opacity-90`}
              >
                Save Event
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
