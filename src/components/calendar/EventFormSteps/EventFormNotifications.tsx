
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, CalendarIcon as CalendarIcon2 } from "lucide-react";

interface EventFormNotificationsProps {
  form: UseFormReturn<any>;
  selectedAudienceTypes: string[];
}

const notificationGroups = [
  { id: "parents", label: "Parents" },
  { id: "teachers", label: "Teachers" },
  { id: "staff", label: "All Staff" },
  { id: "students", label: "Students" },
  { id: "administration", label: "Administrators" },
  { id: "all", label: "Everyone" },
];

const EventFormNotifications: React.FC<EventFormNotificationsProps> = ({ 
  form, 
  selectedAudienceTypes
}) => {
  const sendPushNotification = form.watch("sendPushNotification");
  const sendEmailAlert = form.watch("sendEmailAlert");
  const reminderEnabled = form.watch("reminderEnabled");
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="form-section">
        <div className="form-section-title">
          <Bell size={18} />
          <span>Notification Settings</span>
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="sendPushNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Push Notification</FormLabel>
                  <FormDescription>
                    Send push notification to mobile devices
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
          
          <FormField
            control={form.control}
            name="sendEmailAlert"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Email Alert</FormLabel>
                  <FormDescription>
                    Send email notification about this event
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
          
          <FormField
            control={form.control}
            name="showInCalendar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show in Calendar</FormLabel>
                  <FormDescription>
                    Make this event visible in the calendar
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

        {(sendPushNotification || sendEmailAlert) && (
          <FormField
            control={form.control}
            name="notifyGroups"
            render={() => (
              <FormItem className="mt-4">
                <FormLabel className="text-base">Which groups should be notified?</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {notificationGroups.filter(group => 
                    // Only show groups that are in the selected audience types or "all"
                    group.id === 'all' || selectedAudienceTypes.includes(group.id)
                  ).map((item) => (
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
                                ? field.value?.filter((value: string) => value !== item.id) || []
                                : [...(field.value || []), item.id];
                              field.onChange(updatedValues);
                            }}
                          >
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}}
                                  className="data-[state=checked]:bg-gray-900"
                                />
                                <span className="text-sm font-medium">{item.label}</span>
                              </div>
                            </FormControl>
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

      <div className="form-section">
        <div className="form-section-title">
          <CalendarIcon2 size={18} />
          <span>Additional Options</span>
        </div>
        
        <FormField
          control={form.control}
          name="reminderEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Set Reminder</FormLabel>
                <FormDescription>
                  Send reminder before the event starts
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
        
        {reminderEnabled && (
          <div className="flex items-center mt-4 gap-2">
            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={1}
                      className="h-12"
                      placeholder="30"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderUnit"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <span className="text-sm whitespace-nowrap">before event</span>
          </div>
        )}
        
        <div className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="allowRSVP"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Allow RSVPs</FormLabel>
                  <FormDescription>
                    Let participants confirm attendance
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
          
          <FormField
            control={form.control}
            name="followUpNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Follow-up Notification</FormLabel>
                  <FormDescription>
                    Send a follow-up after the event
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
      </div>
    </div>
  );
};

export default EventFormNotifications;
