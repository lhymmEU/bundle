'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { decodeShareCode } from '@/lib/storage';
import { SharedBundle, SharedLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Import,
  Package,
  Check,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { SocialMediaIcon, SOCIAL_MEDIA_CONFIG } from '@/components/links/SocialMediaIcons';

interface ImportableLinkWithState extends SharedLink {
  index: number;
  isDuplicate: boolean;
  isSelected: boolean;
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharedBundle: SharedBundle;
  onImportComplete: () => void;
}

function ImportDialog({ open, onOpenChange, sharedBundle, onImportComplete }: ImportDialogProps) {
  const { state, addLink } = useApp();
  
  // Get existing URLs for duplicate detection
  const existingUrls = useMemo(() => {
    return new Set(state.links.map((link) => link.url.toLowerCase().trim()));
  }, [state.links]);
  
  // Create importable links with duplicate detection and selection state
  const [linkSelections, setLinkSelections] = useState<Map<number, boolean>>(() => {
    const map = new Map<number, boolean>();
    sharedBundle.links.forEach((link, index) => {
      const isDuplicate = existingUrls.has(link.url.toLowerCase().trim());
      // Default: don't select duplicates, select non-duplicates
      map.set(index, !isDuplicate);
    });
    return map;
  });
  
  const importableLinks: ImportableLinkWithState[] = useMemo(() => {
    return sharedBundle.links
      .map((link, index) => ({
        ...link,
        index,
        isDuplicate: existingUrls.has(link.url.toLowerCase().trim()),
        isSelected: linkSelections.get(index) ?? false,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [sharedBundle.links, existingUrls, linkSelections]);
  
  const selectedCount = importableLinks.filter((l) => l.isSelected).length;
  const duplicateCount = importableLinks.filter((l) => l.isDuplicate).length;
  
  const toggleLink = (index: number) => {
    setLinkSelections((prev) => {
      const next = new Map(prev);
      next.set(index, !prev.get(index));
      return next;
    });
  };
  
  const selectAll = () => {
    setLinkSelections((prev) => {
      const next = new Map(prev);
      importableLinks.forEach((link) => {
        next.set(link.index, true);
      });
      return next;
    });
  };
  
  const deselectAll = () => {
    setLinkSelections((prev) => {
      const next = new Map(prev);
      importableLinks.forEach((link) => {
        next.set(link.index, false);
      });
      return next;
    });
  };
  
  const handleImport = () => {
    // Get the default "Other" category, or use the first available category
    let categoryId = state.categories.find((c) => c.name === 'Other')?.id;
    if (!categoryId && state.categories.length > 0) {
      categoryId = state.categories[0].id;
    }
    
    if (!categoryId) {
      return; // No categories available
    }
    
    // Import selected links
    const linksToImport = importableLinks.filter((link) => link.isSelected);
    
    linksToImport.forEach((link) => {
      addLink({
        title: link.title,
        url: link.url,
        description: link.description,
        categoryId,
        isHighlighted: false,
        socialMediaType: link.socialMediaType || null,
      });
    });
    
    onOpenChange(false);
    onImportComplete();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[calc(100vw-2rem)] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{sharedBundle.name}</DialogTitle>
              {sharedBundle.description && (
                <DialogDescription>{sharedBundle.description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {sharedBundle.links.length} link{sharedBundle.links.length !== 1 ? 's' : ''}
              </Badge>
              {duplicateCount > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {duplicateCount} already in your collection
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[300px] w-full border rounded-md">
            <div className="divide-y">
              {importableLinks.map((link) => (
                <div
                  key={link.index}
                  onClick={() => toggleLink(link.index)}
                  className={`p-3 cursor-pointer transition-colors ${
                    link.isDuplicate
                      ? link.isSelected
                        ? 'bg-muted/30'
                        : 'bg-muted/50 opacity-60'
                      : link.isSelected
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        link.isSelected
                          ? link.isDuplicate
                            ? 'bg-muted-foreground/70 border-muted-foreground/70'
                            : 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {link.isSelected && (
                        <Check className={`h-3 w-3 ${link.isDuplicate ? 'text-background' : 'text-primary-foreground'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {link.socialMediaType ? (
                          <span style={{ color: link.isDuplicate ? '#9CA3AF' : SOCIAL_MEDIA_CONFIG[link.socialMediaType]?.color }}>
                            <SocialMediaIcon type={link.socialMediaType} size={16} />
                          </span>
                        ) : (
                          <LinkIcon className={`h-4 w-4 flex-shrink-0 ${link.isDuplicate ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
                        )}
                        <p className={`font-medium truncate ${link.isDuplicate ? 'text-muted-foreground' : ''}`}>
                          {link.title}
                        </p>
                        {link.isDuplicate && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Duplicate
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm truncate mt-1 ${link.isDuplicate ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        {link.url}
                      </p>
                      {link.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${link.isDuplicate ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                          {link.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(link.url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={selectedCount === 0}>
            <Import className="h-4 w-4 mr-2" />
            Import {selectedCount} Link{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BundleImporter() {
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sharedBundle, setSharedBundle] = useState<SharedBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  
  const parseShareInput = (input: string): string | null => {
    // Try to extract share code from URL or use directly
    const trimmed = input.trim();
    
    // Check if it's a URL with data parameter
    try {
      const url = new URL(trimmed);
      const data = url.searchParams.get('data');
      if (data) return data;
    } catch {
      // Not a valid URL, treat as raw share code
    }
    
    // Return as-is (might be a raw share code)
    return trimmed || null;
  };
  
  const handleImport = () => {
    setError(null);
    setImportSuccess(false);
    
    const shareCode = parseShareInput(inputValue);
    if (!shareCode) {
      setError('Please enter a share URL or code');
      return;
    }
    
    const decoded = decodeShareCode(shareCode);
    if (!decoded) {
      setError('Invalid or corrupted share link. Please check and try again.');
      return;
    }
    
    setSharedBundle(decoded);
    setDialogOpen(true);
  };
  
  const handleImportComplete = () => {
    setInputValue('');
    setSharedBundle(null);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Paste bundle share URL or code..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
              setImportSuccess(false);
            }}
            onKeyDown={handleKeyDown}
            className={error ? 'border-destructive' : ''}
          />
        </div>
        <Button onClick={handleImport} disabled={!inputValue.trim()}>
          <Import className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {importSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Links imported successfully!
        </div>
      )}
      
      {sharedBundle && (
        <ImportDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          sharedBundle={sharedBundle}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
}
