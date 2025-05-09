
import React from "react";
import { Button } from "@/components/ui/button";
import { getDayNames } from "@/utils/calendar";
import { CalendarViewType } from "@/types/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarViewType) => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  title,
  onPrevious,
  onNext,
  onViewChange,
  onToday,
}) => {
  return (
    <div className="mb-4 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="calendar-title">{title}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="calendar-nav-button"
            onClick={onPrevious}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="calendar-nav-button"
            onClick={onNext}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center space-x-2 rounded-lg border p-1">
          <button
            className={`calendar-view-button ${
              view === "month" ? "active" : ""
            }`}
            onClick={() => onViewChange("month")}
          >
            Month
          </button>
          <button
            className={`calendar-view-button ${view === "week" ? "active" : ""}`}
            onClick={() => onViewChange("week")}
          >
            Week
          </button>
          <button
            className={`calendar-view-button ${view === "day" ? "active" : ""}`}
            onClick={() => onViewChange("day")}
          >
            Day
          </button>
        </div>
      </div>

      {view === "month" && (
        <div className="calendar-header">
          {getDayNames().map((day, index) => (
            <div
              key={day}
              className="flex h-10 items-center justify-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;
