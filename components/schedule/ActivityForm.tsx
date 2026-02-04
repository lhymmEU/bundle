'use client';

import { useState, useEffect } from 'react';
import { ScheduledActivity } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Check, Clock, Link2 } from 'lucide-react';
import { format } from 'date-fns';

const ACTIVITY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editActivity?: ScheduledActivity | null;
  defaultDate?: Date;
}

export function ActivityForm({
  open,
  onOpenChange,
  editActivity,
  defaultDate,
}: ActivityFormProps) {
  const { state, addActivity, updateActivity } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(defaultDate || new Date());
  const [time, setTime] = useState('');
  const [color, setColor] = useState(ACTIVITY_COLORS[0]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);

  // Reset form state when editActivity or dialog open state changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editActivity) {
      setTitle(editActivity.title);
      setDescription(editActivity.description);
      setDate(new Date(editActivity.date));
      setTime(editActivity.time || '');
      setColor(editActivity.color || ACTIVITY_COLORS[0]);
      setSelectedLinkIds(editActivity.linkIds);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || new Date());
      setTime('');
      setColor(ACTIVITY_COLORS[0]);
      setSelectedLinkIds([]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editActivity, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const dateString = format(date, 'yyyy-MM-dd');

    if (editActivity) {
      updateActivity(editActivity.id, {
        title: title.trim(),
        description: description.trim(),
        date: dateString,
        time: time || undefined,
        color,
        linkIds: selectedLinkIds,
      });
    } else {
      addActivity({
        title: title.trim(),
        description: description.trim(),
        date: dateString,
        time: time || undefined,
        color,
        linkIds: selectedLinkIds,
        isCompleted: false,
      });
    }

    onOpenChange(false);
  };

  const toggleLink = (linkId: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editActivity ? 'Edit Activity' : 'Schedule Activity'}
            </DialogTitle>
            <DialogDescription>
              {editActivity
                ? 'Update the details of your scheduled activity.'
                : 'Add a new activity to your schedule.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="activity-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="activity-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity title"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="activity-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Activity description (optional)"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <label htmlFor="activity-time" className="text-sm font-medium">
                  Time (optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="activity-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {ACTIVITY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Related Links ({selectedLinkIds.length})
              </label>
              <ScrollArea className="h-[150px] border rounded-md p-2">
                {state.links.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No links available.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {state.links.map((link) => {
                      const category = state.categories.find(
                        (c) => c.id === link.categoryId
                      );
                      const isSelected = selectedLinkIds.includes(link.id);

                      return (
                        <div
                          key={link.id}
                          onClick={() => toggleLink(link.id)}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{link.title}</p>
                          </div>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                              }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editActivity ? 'Save Changes' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
