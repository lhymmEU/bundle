'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLink?: Link | null;
}

export function LinkForm({ open, onOpenChange, editLink }: LinkFormProps) {
  const { state, addLink, updateLink } = useApp();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Reset form state when editLink or dialog open state changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editLink) {
      setTitle(editLink.title);
      setUrl(editLink.url);
      setDescription(editLink.description);
      setCategoryId(editLink.categoryId);
      setIsHighlighted(editLink.isHighlighted);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryId(state.categories[0]?.id || '');
      setIsHighlighted(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editLink, state.categories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim() || !categoryId) return;

    if (editLink) {
      updateLink(editLink.id, {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        categoryId,
        isHighlighted,
      });
    } else {
      addLink({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        categoryId,
        isHighlighted,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editLink ? 'Edit Link' : 'Add New Link'}</DialogTitle>
            <DialogDescription>
              {editLink
                ? 'Update the details of your link.'
                : 'Add a new link to your organizer.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter link title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description (optional)"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {state.categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="highlighted"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this link
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editLink ? 'Save Changes' : 'Add Link'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
