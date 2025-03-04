
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface CalendarToolbarProps {
  onAddEvent: () => void;
  onSearch: (query: string) => void;
  onFilterChange: (categories: string[]) => void;
  selectedFilters: string[];
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  onAddEvent,
  onSearch,
  onFilterChange,
  selectedFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleFilter = (category: string) => {
    if (selectedFilters.includes(category)) {
      onFilterChange(selectedFilters.filter((c) => c !== category));
    } else {
      onFilterChange([...selectedFilters, category]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const categories = [
    { id: "exam", label: "Exams & Assessments" },
    { id: "holiday", label: "Holidays & Breaks" },
    { id: "meeting", label: "Meetings" },
    { id: "sport", label: "Sports & Cultural Events" },
    { id: "administrative", label: "Administrative" },
  ];

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

  return (
    <div className="mb-6 flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-1 items-center space-x-2">
          {isSearchOpen ? (
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pr-8"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => {
                  setSearchQuery("");
                  onSearch("");
                  setIsSearchOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {selectedFilters.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-full px-1"
                  >
                    {selectedFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Event Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={selectedFilters.includes(category.id)}
                  onCheckedChange={() => toggleFilter(category.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-2 h-3 w-3 rounded-full ${getCategoryColor(
                        category.id
                      )}`}
                    />
                    {category.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              {selectedFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={onAddEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => {
            const category = categories.find((c) => c.id === filter);
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <div
                  className={`h-2 w-2 rounded-full ${getCategoryColor(filter)}`}
                />
                {category?.label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleFilter(filter)}
                />
              </Badge>
            );
          })}
          {selectedFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarToolbar;
