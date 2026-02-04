'use client';

import { useState, useMemo } from 'react';
import { ScheduledActivity } from '@/types';
import { useApp } from '@/context/AppContext';
import { ActivityForm } from './ActivityForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  CalendarDays,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Circle,
  Link2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns';

interface ActivityCardProps {
  activity: ScheduledActivity;
  onEdit: (activity: ScheduledActivity) => void;
  compact?: boolean;
}

function ActivityCard({ activity, onEdit, compact }: ActivityCardProps) {
  const { state, deleteActivity, toggleActivityComplete } = useApp();

  const relatedLinks = state.links.filter((link) =>
    activity.linkIds.includes(link.id)
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`text-xs p-1 rounded truncate cursor-pointer ${
                activity.isCompleted ? 'line-through opacity-60' : ''
              }`}
              style={{ backgroundColor: `${activity.color}30`, color: activity.color }}
            >
              {activity.time && <span className="font-medium">{activity.time} </span>}
              {activity.title}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[300px]">
            <div className="space-y-2">
              <p className="font-semibold">{activity.title}</p>
              {activity.description && (
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              )}
              {relatedLinks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {relatedLinks.map((link) => (
                    <Badge key={link.id} variant="outline" className="text-xs">
                      {link.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card
      className={`group transition-all ${
        activity.isCompleted ? 'opacity-60' : ''
      }`}
      style={{ borderLeftColor: activity.color, borderLeftWidth: '4px' }}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              onClick={() => toggleActivityComplete(activity.id)}
              className="mt-0.5 flex-shrink-0"
            >
              {activity.isCompleted ? (
                <Check
                  className="h-5 w-5 text-primary"
                  style={{ color: activity.color }}
                />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`text-base font-semibold ${
                  activity.isCompleted ? 'line-through' : ''
                }`}
              >
                {activity.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{format(new Date(activity.date), 'MMM d, yyyy')}</span>
                {activity.time && (
                  <>
                    <Clock className="h-3.5 w-3.5 ml-2" />
                    <span>{activity.time}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleActivityComplete(activity.id)}>
                <Check className="h-4 w-4 mr-2" />
                {activity.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(activity)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteActivity(activity.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-3">
        {activity.description && (
          <p className="text-sm text-muted-foreground mb-2 ml-7">
            {activity.description}
          </p>
        )}
        {relatedLinks.length > 0 && (
          <div className="ml-7 space-y-1">
            {relatedLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="truncate">{link.title}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Schedule() {
  const { state, isLoaded } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<ScheduledActivity | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);

  const activitiesByDate = useMemo(() => {
    const map: Record<string, ScheduledActivity[]> = {};
    state.activities.forEach((activity) => {
      if (!map[activity.date]) {
        map[activity.date] = [];
      }
      map[activity.date].push(activity);
    });
    // Sort by time
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
    });
    return map;
  }, [state.activities]);

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const selectedActivities = activitiesByDate[selectedDateString] || [];

  const upcomingActivities = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.activities
      .filter((a) => a.date >= today && !a.isCompleted)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      })
      .slice(0, 5);
  }, [state.activities]);

  const handleEdit = (activity: ScheduledActivity) => {
    setEditActivity(activity);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditActivity(null);
      setDefaultDate(undefined);
    }
  };

  const handleAddOnDate = (date?: Date) => {
    setDefaultDate(date || selectedDate);
    setEditActivity(null);
    setFormOpen(true);
  };


  // Generate calendar days for grid view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
          <p className="text-muted-foreground">
            Plan and track your blockchain activities
          </p>
        </div>
        <Button onClick={() => handleAddOnDate()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Calendar Grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayActivities = activitiesByDate[dateStr] || [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    className={`bg-background min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday(day)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayActivities.slice(0, 3).map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onEdit={handleEdit}
                          compact
                        />
                      ))}
                      {dayActivities.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayActivities.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Details */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddOnDate(selectedDate)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedActivities.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No activities scheduled
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleAddOnDate(selectedDate)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Activity
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {selectedActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming activities
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedDate(new Date(activity.date))}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: activity.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.date), 'MMM d')}
                          {activity.time && ` at ${activity.time}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ActivityForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        editActivity={editActivity}
        defaultDate={defaultDate}
      />
    </div>
  );
}
