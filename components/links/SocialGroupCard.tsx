'use client';

import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
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
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
} from 'lucide-react';
import { SocialMediaIcon, SOCIAL_MEDIA_CONFIG } from './SocialMediaIcons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SocialGroupCardProps {
  link: Link;
  onEdit: (link: Link) => void;
}

export function SocialGroupCard({ link, onEdit }: SocialGroupCardProps) {
  const { state, deleteLink } = useApp();
  
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
  const socialConfig = link.socialMediaType ? SOCIAL_MEDIA_CONFIG[link.socialMediaType] : null;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(link.url);
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-3 p-3 bg-card border rounded-lg transition-all hover:shadow-md ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Social Media Icon */}
      {socialConfig && (
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${socialConfig.color}15` }}
        >
          <SocialMediaIcon
            type={link.socialMediaType!}
            size={22}
            className="flex-shrink-0"
            style={{ color: socialConfig.color }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{link.title}</h4>
          {category && (
            <Badge
              variant="secondary"
              className="text-xs flex-shrink-0"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
            </Badge>
          )}
        </div>
        {link.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {link.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
          {link.url}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleOpenLink}
          title="Open link"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        
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
    </div>
  );
}
