'use client';

import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { SocialMediaIcon, SOCIAL_MEDIA_CONFIG } from './SocialMediaIcons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableLinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showSelect?: boolean;
}

export function DraggableLinkCard({ link, onEdit, isSelected, onSelect, showSelect }: DraggableLinkCardProps) {
  const { state, toggleHighlight, deleteLink } = useApp();

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

  const category = state.categories.find((c) => c.id === link.categoryId);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(link.url);
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all hover:shadow-md ${
        link.isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''} ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-3 right-12 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity touch-none z-10"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {showSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(link.id)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      )}
      
      <CardHeader className={`pb-2 ${showSelect ? 'pl-10' : ''}`}>
        <div className="flex items-start justify-between gap-2 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {link.socialMediaType && (
                <span
                  className="flex-shrink-0"
                  style={{
                    color: SOCIAL_MEDIA_CONFIG[link.socialMediaType]?.color,
                  }}
                >
                  <SocialMediaIcon type={link.socialMediaType} size={18} />
                </span>
              )}
              {link.isHighlighted && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              )}
              <span className="truncate block">{link.title}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {link.url}
              </a>
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      </CardHeader>
      
      <CardContent className={`pt-0 ${showSelect ? 'pl-10' : ''}`}>
        {link.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {link.description}
          </p>
        )}
        {category && (
          <Badge
            variant="secondary"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.name}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
