'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import { LinkCard } from './LinkCard';
import { LinkForm } from './LinkForm';
import { CategoryManager } from './CategoryManager';
import { BundleCreator } from './BundleCreator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Star,
  Link2,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';

export function LinkOrganizer() {
  const { state, isLoaded } = useApp();
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredLinks = useMemo(() => {
    return state.links.filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || link.categoryId === selectedCategory;
      const matchesHighlight = !showHighlightedOnly || link.isHighlighted;
      return matchesSearch && matchesCategory && matchesHighlight;
    });
  }, [state.links, searchQuery, selectedCategory, showHighlightedOnly]);

  const handleEditLink = (link: Link) => {
    setEditLink(link);
    setLinkFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setLinkFormOpen(open);
    if (!open) setEditLink(null);
  };

  const handleSelectLink = (id: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinkIds.length === filteredLinks.length) {
      setSelectedLinkIds([]);
    } else {
      setSelectedLinkIds(filteredLinks.map((l) => l.id));
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedLinkIds([]);
    }
  };

  const clearSelection = () => {
    setSelectedLinkIds([]);
    setIsSelectionMode(false);
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Link Organizer</h2>
          <p className="text-muted-foreground">
            Manage and organize your blockchain ecosystem links
          </p>
        </div>
        <Button onClick={() => setLinkFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Links
          </TabsTrigger>
          <TabsTrigger value="bundles" className="gap-2">
            <Star className="h-4 w-4" />
            Bundles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          {/* Categories */}
          <CategoryManager />

          <Separator />

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

              <Button
                variant={showHighlightedOnly ? 'default' : 'outline'}
                size="icon"
                onClick={() => setShowHighlightedOnly(!showHighlightedOnly)}
                title={showHighlightedOnly ? 'Show all' : 'Show highlighted only'}
              >
                <Star className={`h-4 w-4 ${showHighlightedOnly ? 'fill-current' : ''}`} />
              </Button>

              <Button
                variant={isSelectionMode ? 'default' : 'outline'}
                size="icon"
                onClick={toggleSelectionMode}
                title={isSelectionMode ? 'Exit selection mode' : 'Select links'}
              >
                {isSelectionMode ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Selection toolbar */}
          {isSelectionMode && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedLinkIds.length === filteredLinks.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
              <Badge variant="secondary">
                {selectedLinkIds.length} selected
              </Badge>
              {selectedLinkIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Links grid */}
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-1">No links found</h3>
              <p className="text-muted-foreground">
                {state.links.length === 0
                  ? 'Start by adding your first link.'
                  : 'Try adjusting your filters.'}
              </p>
              {state.links.length === 0 && (
                <Button className="mt-4" onClick={() => setLinkFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Link
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onEdit={handleEditLink}
                  isSelected={selectedLinkIds.includes(link.id)}
                  onSelect={handleSelectLink}
                  showSelect={isSelectionMode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bundles">
          <BundleCreator
            selectedLinkIds={selectedLinkIds}
            onClearSelection={clearSelection}
          />
        </TabsContent>
      </Tabs>

      <LinkForm
        open={linkFormOpen}
        onOpenChange={handleCloseForm}
        editLink={editLink}
      />
    </div>
  );
}
