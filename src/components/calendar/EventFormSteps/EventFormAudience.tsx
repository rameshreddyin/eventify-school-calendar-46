
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, School, BookOpen, Search } from "lucide-react";
import { SchoolClass, SchoolDepartment, SchoolSubject } from "@/types/calendar";

interface EventFormAudienceProps {
  form: UseFormReturn<any>;
  schoolClasses: SchoolClass[];
  departments: SchoolDepartment[];
  subjects: SchoolSubject[];
}

const audienceTypes = [
  { id: "parents", label: "Parents", icon: <Users size={16} /> },
  { id: "teachers", label: "Teachers", icon: <BookOpen size={16} /> },
  { id: "staff", label: "Staff", icon: <Users size={16} /> },
  { id: "students", label: "Students", icon: <School size={16} /> },
  { id: "administration", label: "Administrators", icon: <Users size={16} /> },
  { id: "others", label: "Others", icon: <Users size={16} /> },
];

const EventFormAudience: React.FC<EventFormAudienceProps> = ({ 
  form,
  schoolClasses,
  departments,
  subjects 
}) => {
  // States for search filters
  const [classSearch, setClassSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  
  // Get selected audience types to determine what nested options to show
  const selectedAudienceTypes = form.watch("audienceType") || [];
  
  // Filter classes based on search term
  const filteredClasses = schoolClasses.filter(c => 
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  );
  
  // Filter departments based on search term
  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );
  
  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );
  
  // Handle "select all" for classes
  const handleSelectAllClasses = () => {
    const currentClasses = form.getValues("classes") || [];
    if (currentClasses.length === schoolClasses.length) {
      form.setValue("classes", [], { shouldDirty: true });
    } else {
      form.setValue("classes", schoolClasses.map(c => c.id), { shouldDirty: true });
    }
  };
  
  // Handle "select all" for departments
  const handleSelectAllDepartments = () => {
    const currentDepts = form.getValues("departments") || [];
    if (currentDepts.length === departments.length) {
      form.setValue("departments", [], { shouldDirty: true });
    } else {
      form.setValue("departments", departments.map(d => d.id), { shouldDirty: true });
    }
  };
  
  // Handle "select all" for subjects
  const handleSelectAllSubjects = () => {
    const currentSubjects = form.getValues("subjects") || [];
    if (currentSubjects.length === subjects.length) {
      form.setValue("subjects", [], { shouldDirty: true });
    } else {
      form.setValue("subjects", subjects.map(s => s.id), { shouldDirty: true });
    }
  };
  
  // Handle "select all" audiences
  const handleSelectAllAudiences = () => {
    if (selectedAudienceTypes.length === audienceTypes.length) {
      form.setValue("audienceType", [], { shouldDirty: true });
    } else {
      form.setValue("audienceType", audienceTypes.map(a => a.id), { shouldDirty: true });
    }
  };
  
  // Determine which panels to show based on selected audience types
  const showParentsPanel = selectedAudienceTypes.includes("parents");
  const showTeachersPanel = selectedAudienceTypes.includes("teachers");
  const showStudentsPanel = selectedAudienceTypes.includes("students");
  const showStaffPanel = selectedAudienceTypes.includes("staff");
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="form-section">
        <div className="form-section-title">
          <Users size={18} />
          <span>Who is this event for?</span>
        </div>
        
        <div className="mb-3 flex justify-between">
          <FormLabel className="text-base">Main User Types</FormLabel>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={handleSelectAllAudiences}
          >
            {selectedAudienceTypes.length === audienceTypes.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="audienceType"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {audienceTypes.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="audienceType"
                    render={({ field }) => {
                      const isSelected = field.value?.includes(item.id);
                      return (
                        <div 
                          className={`audience-item ${isSelected ? 'audience-item-selected' : ''}`}
                          onClick={() => {
                            const updatedValues = isSelected
                              ? field.value?.filter((value: string) => value !== item.id) || []
                              : [...(field.value || []), item.id];
                            form.setValue("audienceType", updatedValues, { shouldDirty: true });
                          }}
                        >
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {}}
                                className="data-[state=checked]:bg-gray-900"
                              />
                              <div className="flex items-center space-x-1.5">
                                {item.icon}
                                <span className="text-sm font-medium">{item.label}</span>
                              </div>
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
      </div>

      {/* Conditional panels based on selected audience types */}
      {showParentsPanel && (
        <div className="form-section">
          <div className="form-section-title">
            <Users size={18} />
            <span>Parent Groups</span>
          </div>
          
          <div className="mb-3 flex justify-between items-center">
            <FormLabel className="text-base">Select Class Parents</FormLabel>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search classes..."
                  className="pl-9 h-10 text-sm w-[180px]"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllClasses}
              >
                {form.getValues("classes")?.length === schoolClasses.length ? 
                  "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="classes"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredClasses.map((classItem) => (
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
                                ? field.value?.filter((value: string) => value !== classItem.id) || []
                                : [...(field.value || []), classItem.id];
                              form.setValue("classes", updatedValues, { shouldDirty: true });
                            }}
                          >
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}}
                                  className="data-[state=checked]:bg-gray-900"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{classItem.name}</span>
                                  {classItem.gradeLevel && (
                                    <span className="text-xs text-muted-foreground">
                                      {classItem.gradeLevel}
                                    </span>
                                  )}
                                </div>
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
        </div>
      )}

      {showTeachersPanel && (
        <div className="form-section">
          <div className="form-section-title">
            <BookOpen size={18} />
            <span>Teacher Groups</span>
          </div>
          
          <div className="mb-3 flex justify-between items-center">
            <FormLabel className="text-base">Select Subject Teachers</FormLabel>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search subjects..."
                  className="pl-9 h-10 text-sm w-[180px]"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllSubjects}
              >
                {form.getValues("subjects")?.length === subjects.length ? 
                  "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="subjects"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredSubjects.map((subject) => (
                    <FormField
                      key={subject.id}
                      control={form.control}
                      name="subjects"
                      render={({ field }) => {
                        const isSelected = field.value?.includes(subject.id);
                        return (
                          <div 
                            className={`checkbox-item ${isSelected ? 'checkbox-item-selected' : ''}`}
                            onClick={() => {
                              const updatedValues = isSelected
                                ? field.value?.filter((value: string) => value !== subject.id) || []
                                : [...(field.value || []), subject.id];
                              form.setValue("subjects", updatedValues, { shouldDirty: true });
                            }}
                          >
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}}
                                  className="data-[state=checked]:bg-gray-900"
                                />
                                <span className="text-sm">{subject.name}</span>
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
        </div>
      )}

      {showStaffPanel && (
        <div className="form-section">
          <div className="form-section-title">
            <Users size={18} />
            <span>Staff Departments</span>
          </div>
          
          <div className="mb-3 flex justify-between items-center">
            <FormLabel className="text-base">Select Staff Departments</FormLabel>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search departments..."
                  className="pl-9 h-10 text-sm w-[180px]"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllDepartments}
              >
                {form.getValues("departments")?.length === departments.length ? 
                  "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="departments"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredDepartments.map((dept) => (
                    <FormField
                      key={dept.id}
                      control={form.control}
                      name="departments"
                      render={({ field }) => {
                        const isSelected = field.value?.includes(dept.id);
                        return (
                          <div 
                            className={`checkbox-item ${isSelected ? 'checkbox-item-selected' : ''}`}
                            onClick={() => {
                              const updatedValues = isSelected
                                ? field.value?.filter((value: string) => value !== dept.id) || []
                                : [...(field.value || []), dept.id];
                              form.setValue("departments", updatedValues, { shouldDirty: true });
                            }}
                          >
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}}
                                  className="data-[state=checked]:bg-gray-900"
                                />
                                <span className="text-sm">{dept.name}</span>
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
        </div>
      )}
      
      {/* Mirror the same groups for students like parents */}
      {showStudentsPanel && (
        <div className="form-section">
          <div className="form-section-title">
            <School size={18} />
            <span>Student Classes</span>
          </div>
          
          <div className="mb-3 flex justify-between items-center">
            <FormLabel className="text-base">Select Student Classes</FormLabel>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search classes..."
                  className="pl-9 h-10 text-sm w-[180px]"
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllClasses}
              >
                {form.getValues("classes")?.length === schoolClasses.length ? 
                  "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="classes"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredClasses.map((classItem) => (
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
                                ? field.value?.filter((value: string) => value !== classItem.id) || []
                                : [...(field.value || []), classItem.id];
                              form.setValue("classes", updatedValues, { shouldDirty: true });
                            }}
                          >
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => {}}
                                  className="data-[state=checked]:bg-gray-900"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{classItem.name}</span>
                                  {classItem.gradeLevel && (
                                    <span className="text-xs text-muted-foreground">
                                      {classItem.gradeLevel}
                                    </span>
                                  )}
                                </div>
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
        </div>
      )}
    </div>
  );
};

export default EventFormAudience;
