'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ExternalLink,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ITEMS_PER_PAGE = 5;

interface DraggableLinkTableProps {
  links: Link[];
  onEdit: (link: Link) => void;
  isSelectionMode: boolean;
  selectedLinkIds: string[];
  onSelect: (id: string) => void;
  onReorder: (linkIds: string[]) => void;
}

interface DraggableRowProps {
  link: Link;
  onEdit: (link: Link) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function DraggableRow({
  link,
  onEdit,
  isSelectionMode,
  isSelected,
  onSelect,
}: DraggableRowProps) {
  const { state, toggleHighlight, deleteLink } = useApp();
  const category = state.categories.find((c) => c.id === link.categoryId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(link.url);
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? 'shadow-lg z-50 bg-background' : ''} ${
        link.isHighlighted ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
      } ${isSelected ? 'bg-primary/5' : ''}`}
    >
      {/* Drag Handle */}
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      {/* Checkbox for selection mode */}
      {isSelectionMode && (
        <TableCell className="w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(link.id)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </TableCell>
      )}

      {/* Title with highlight indicator */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {link.isHighlighted && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          )}
          <span className="truncate max-w-[200px]">{link.title}</span>
        </div>
      </TableCell>

      {/* URL */}
      <TableCell>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary truncate max-w-[250px] block text-sm"
        >
          {link.url}
        </a>
      </TableCell>

      {/* Category */}
      <TableCell>
        {category && (
          <Badge
            variant="secondary"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.name}
          </Badge>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
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
            <DropdownMenuItem onClick={handleOpenLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleHighlight(link.id)}>
              <Star className="h-4 w-4 mr-2" />
              {link.isHighlighted ? 'Remove Highlight' : 'Highlight'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(link)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteLink(link.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function DraggableLinkTable({
  links,
  onEdit,
  isSelectionMode,
  selectedLinkIds,
  onSelect,
  onReorder,
}: DraggableLinkTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(links.length / ITEMS_PER_PAGE);
  // Derive effective current page - reset to 1 if current page becomes invalid after filtering
  const effectiveCurrentPage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;
  
  const startIndex = (effectiveCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLinks = useMemo(() => {
    return links.slice(startIndex, endIndex);
  }, [links, startIndex, endIndex]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Find indices in the full list, not just the paginated view
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedLinks = arrayMove(links, oldIndex, newIndex);
        onReorder(reorderedLinks.map((l) => l.id));
      }
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={paginatedLinks.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  {isSelectionMode && <TableHead className="w-10"></TableHead>}
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLinks.map((link) => (
                  <DraggableRow
                    key={link.id}
                    link={link}
                    onEdit={onEdit}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedLinkIds.includes(link.id)}
                    onSelect={onSelect}
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, links.length)} of{' '}
            {links.length} links
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(effectiveCurrentPage - 1)}
              disabled={effectiveCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={effectiveCurrentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(effectiveCurrentPage + 1)}
              disabled={effectiveCurrentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
