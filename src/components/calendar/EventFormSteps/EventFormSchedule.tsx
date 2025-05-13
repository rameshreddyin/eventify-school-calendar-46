
import React from "react";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, CalendarIcon as CalendarIcon2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventFormScheduleProps {
  form: UseFormReturn<any>;
}

const EventFormSchedule: React.FC<EventFormScheduleProps> = ({ form }) => {
  // Get allDay value to conditionally render time inputs
  const allDay = form.watch("allDay");
  
  return (
    <div className="space-y-6 animate-fade-in">
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
                <FormLabel className="text-base">All Day Event</FormLabel>
                <FormDescription>
                  Toggle if this event lasts the entire day
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 pl-3 text-left font-normal flex justify-between items-center",
                          !field.value ? "text-muted-foreground" : ""
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="h-5 w-5 opacity-70" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        // Also update end date if it's before the new start date
                        const endDate = form.getValues("endDate");
                        if (date && endDate && date > endDate) {
                          form.setValue("endDate", date);
                        }
                      }}
                      initialFocus
                      className="rounded-md"
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
                <FormLabel className="text-base">End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-12 pl-3 text-left font-normal flex justify-between items-center",
                          !field.value ? "text-muted-foreground" : ""
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="h-5 w-5 opacity-70" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                      }}
                      initialFocus
                      className="rounded-md"
                      disabled={(date) => {
                        // Disable dates before start date
                        const startDate = form.getValues("startDate");
                        return startDate ? date < startDate : false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!allDay && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Start Time</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        value={field.value || ""} 
                        className="bg-background h-12" 
                      />
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
                  <FormLabel className="text-base">End Time</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        value={field.value || ""} 
                        className="bg-background h-12" 
                      />
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
  );
};

export default EventFormSchedule;
