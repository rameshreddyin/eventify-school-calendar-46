
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
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
import { Bookmark, Tag } from "lucide-react";

interface EventTypeOption {
  value: string;
  label: string;
}

interface EventFormBasicsProps {
  form: UseFormReturn<any>;
  eventTypes: EventTypeOption[];
}

const EventFormBasics: React.FC<EventFormBasicsProps> = ({ form, eventTypes }) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
              <FormLabel className="text-base">Event Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter event title" 
                  {...field} 
                  className="bg-background h-12 text-base" 
                />
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
              <FormLabel className="text-base">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  className="resize-none bg-background min-h-[120px] text-base"
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
          <span>Event Type</span>
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Select Event Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EventFormBasics;
