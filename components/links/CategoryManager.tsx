'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react';

const PRESET_COLORS = [
  '#627EEA', '#F7931A', '#00FFA3', '#8247E5', '#28A0F0',
  '#0052FF', '#E84142', '#6B7280', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: Category | null;
}

function CategoryForm({ open, onOpenChange, editCategory }: CategoryFormProps) {
  const { addCategory, updateCategory } = useApp();
  const [name, setName] = useState(editCategory?.name || '');
  const [color, setColor] = useState(editCategory?.color || PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editCategory) {
      updateCategory(editCategory.id, { name: name.trim(), color });
    } else {
      addCategory({ name: name.trim(), color });
    }

    setName('');
    setColor(PRESET_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {editCategory
                ? 'Update the category details.'
                : 'Create a new category to organize your links.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === presetColor ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 p-0 border-0 cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editCategory ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryManager() {
  const { state, deleteCategory } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setFormOpen(true);
  };

  const handleClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditCategory(null);
  };

  const getLinkCount = (categoryId: string) => {
    return state.links.filter((link) => link.categoryId === categoryId).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Categories</h3>
        </div>
        <Dialog open={formOpen && !editCategory} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {state.categories.map((category) => (
          <div key={category.id} className="group relative">
            <Badge
              variant="secondary"
              className="pr-8 cursor-default"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-70">({getLinkCount(category.id)})</span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteCategory(category.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <CategoryForm open={formOpen} onOpenChange={handleClose} editCategory={editCategory} />
    </div>
  );
}
