'use client';

import { useState } from 'react';
import { Bundle } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface BundleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBundle?: Bundle | null;
  selectedLinkIds?: string[];
}

function BundleForm({ open, onOpenChange, editBundle, selectedLinkIds = [] }: BundleFormProps) {
  const { state, addBundle, updateBundle } = useApp();
  const [name, setName] = useState(editBundle?.name || '');
  const [description, setDescription] = useState(editBundle?.description || '');
  const [linkIds, setLinkIds] = useState<string[]>(
    editBundle?.linkIds || selectedLinkIds
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editBundle) {
      updateBundle(editBundle.id, {
        name: name.trim(),
        description: description.trim(),
        linkIds,
      });
    } else {
      addBundle({
        name: name.trim(),
        description: description.trim(),
        linkIds,
      });
    }

    onOpenChange(false);
  };

  const toggleLink = (linkId: string) => {
    setLinkIds((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[calc(100vw-2rem)] overflow-hidden">
        <form onSubmit={handleSubmit} className="w-full overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {editBundle ? 'Edit Bundle' : 'Create Bundle'}
            </DialogTitle>
            <DialogDescription>
              {editBundle
                ? 'Update your bundle details and links.'
                : 'Create a bundle of links to share.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 w-full overflow-hidden">
            <div className="grid gap-2 w-full overflow-hidden">
              <label htmlFor="bundle-name" className="text-sm font-medium">
                Bundle Name
              </label>
              <Input
                id="bundle-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter bundle name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="bundle-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="bundle-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this bundle (optional)"
                rows={2}
              />
            </div>
            
            <div className="grid gap-2 w-full overflow-hidden">
              <label className="text-sm font-medium">
                Select Links ({linkIds.length} selected)
              </label>
              <ScrollArea className="h-[200px] w-full border rounded-md p-2">
                {state.links.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No links available. Add some links first.
                  </p>
                ) : (
                  <div className="space-y-2 overflow-hidden">
                    {state.links.map((link) => {
                      const category = state.categories.find(
                        (c) => c.id === link.categoryId
                      );
                      const isSelected = linkIds.includes(link.id);
                      
                      return (
                        <div
                          key={link.id}
                          onClick={() => toggleLink(link.id)}
                          className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors overflow-hidden ${
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
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium truncate">{link.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.url}
                            </p>
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
            <Button type="submit" disabled={linkIds.length === 0}>
              {editBundle ? 'Save' : 'Create Bundle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface BundleCardProps {
  bundle: Bundle;
  onEdit: (bundle: Bundle) => void;
}

function BundleCard({ bundle, onEdit }: BundleCardProps) {
  const { state, deleteBundle, generateBundleShareCode } = useApp();
  const [copied, setCopied] = useState(false);

  const bundleLinks = state.links.filter((link) =>
    bundle.linkIds.includes(link.id)
  );

  const handleShare = async () => {
    const shareCode = generateBundleShareCode(bundle.id);
    if (shareCode) {
      const shareUrl = `${window.location.origin}/share?data=${shareCode}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {bundle.name}
            </CardTitle>
            {bundle.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {bundle.description}
              </p>
            )}
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
              <DropdownMenuItem onClick={handleShare}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Bundle
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(bundle)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteBundle(bundle.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-1">
          {bundleLinks.slice(0, 5).map((link) => (
            <Badge key={link.id} variant="outline" className="text-xs">
              {link.title}
            </Badge>
          ))}
          {bundleLinks.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{bundleLinks.length - 5} more
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {bundleLinks.length} link{bundleLinks.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
}

interface BundleCreatorProps {
  selectedLinkIds?: string[];
  onClearSelection?: () => void;
}

export function BundleCreator({ selectedLinkIds = [], onClearSelection }: BundleCreatorProps) {
  const { state } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);

  const handleEdit = (bundle: Bundle) => {
    setEditBundle(bundle);
    setFormOpen(true);
  };

  const handleClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditBundle(null);
      onClearSelection?.();
    }
  };

  const handleCreateFromSelection = () => {
    setEditBundle(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Bundles</h3>
        </div>
        <div className="flex gap-2">
          {selectedLinkIds.length > 0 && (
            <Button variant="default" size="sm" onClick={handleCreateFromSelection}>
              <Plus className="h-4 w-4 mr-1" />
              Bundle {selectedLinkIds.length} Selected
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Bundle
          </Button>
        </div>
      </div>

      {state.bundles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No bundles yet. Create one to share multiple links at once.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {state.bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <BundleForm
        open={formOpen}
        onOpenChange={handleClose}
        editBundle={editBundle}
        selectedLinkIds={selectedLinkIds}
      />
    </div>
  );
}
