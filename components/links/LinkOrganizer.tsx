'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import { LinkForm } from './LinkForm';
import { CategoryManager } from './CategoryManager';
import { BundleCreator } from './BundleCreator';
import { SocialMediaImporter, SocialMediaImportButton } from './SocialMediaImporter';
import { SocialGroupCard } from './SocialGroupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableLinkTable } from './DraggableLinkTable';

export function LinkOrganizer() {
  const { state, isLoaded, reorderLinks } = useApp();
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [socialMediaImporterOpen, setSocialMediaImporterOpen] = useState(false);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHighlightedOnly, setShowHighlightedOnly] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Drag and drop sensors (used only for social links now)
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

  // Handle reorder for regular links (used by table)
  const handleRegularLinksReorder = (linkIds: string[]) => {
    reorderLinks(linkIds);
  };

  // Separate regular links from social group links
  const regularLinks = useMemo(() => {
    return state.links
      .filter((link) => !link.socialMediaType)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [state.links]);

  const socialLinks = useMemo(() => {
    return state.links
      .filter((link) => !!link.socialMediaType)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [state.links]);

  // Filtered regular links
  const filteredRegularLinks = useMemo(() => {
    return regularLinks.filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || link.categoryId === selectedCategory;
      const matchesHighlight = !showHighlightedOnly || link.isHighlighted;
      return matchesSearch && matchesCategory && matchesHighlight;
    });
  }, [regularLinks, searchQuery, selectedCategory, showHighlightedOnly]);

  // Filtered social links
  const filteredSocialLinks = useMemo(() => {
    return socialLinks.filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || link.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [socialLinks, searchQuery, selectedCategory]);

  const handleEditLink = (link: Link) => {
    setEditLink(link);
    if (link.socialMediaType) {
      setSocialMediaImporterOpen(true);
    } else {
      setLinkFormOpen(true);
    }
  };

  const handleCloseForm = (open: boolean) => {
    setLinkFormOpen(open);
    if (!open) setEditLink(null);
  };

  const handleCloseSocialImporter = (open: boolean) => {
    setSocialMediaImporterOpen(open);
    if (!open) setEditLink(null);
  };

  const handleSelectLink = (id: string) => {
    setSelectedLinkIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = [...filteredRegularLinks, ...filteredSocialLinks].map((l) => l.id);
    if (selectedLinkIds.length === allFilteredIds.length) {
      setSelectedLinkIds([]);
    } else {
      setSelectedLinkIds(allFilteredIds);
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

  // Handle drag end for social links
  const handleSocialLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = filteredSocialLinks.findIndex((l) => l.id === active.id);
      const newIndex = filteredSocialLinks.findIndex((l) => l.id === over.id);
      const reorderedLinks = arrayMove(filteredSocialLinks, oldIndex, newIndex);
      reorderLinks(reorderedLinks.map((l) => l.id));
    }
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
        <div className="flex gap-2">
          <SocialMediaImportButton onClick={() => setSocialMediaImporterOpen(true)} />
          <Button onClick={() => setLinkFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links" className="gap-2">
            <Link2 className="h-4 w-4" />
            Links
            {regularLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {regularLinks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Social Groups
            {socialLinks.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {socialLinks.length}
              </Badge>
            )}
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
                {selectedLinkIds.length === filteredRegularLinks.length
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

          {/* Links table with drag and drop */}
          {filteredRegularLinks.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-1">No links found</h3>
              <p className="text-muted-foreground">
                {regularLinks.length === 0
                  ? 'Start by adding your first link.'
                  : 'Try adjusting your filters.'}
              </p>
              {regularLinks.length === 0 && (
                <Button className="mt-4" onClick={() => setLinkFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Link
                </Button>
              )}
            </div>
          ) : (
            <DraggableLinkTable
              links={filteredRegularLinks}
              onEdit={handleEditLink}
              isSelectionMode={isSelectionMode}
              selectedLinkIds={selectedLinkIds}
              onSelect={handleSelectLink}
              onReorder={handleRegularLinksReorder}
            />
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          {/* Social Groups Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search social groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setSocialMediaImporterOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Social Group
            </Button>
          </div>

          {/* Social Groups list with drag and drop */}
          {filteredSocialLinks.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-1">No social groups found</h3>
              <p className="text-muted-foreground">
                {socialLinks.length === 0
                  ? 'Add your Telegram, Discord, or X communities.'
                  : 'Try adjusting your search.'}
              </p>
              {socialLinks.length === 0 && (
                <Button className="mt-4" onClick={() => setSocialMediaImporterOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Social Group
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSocialLinkDragEnd}
            >
              <SortableContext
                items={filteredSocialLinks.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-w-2xl">
                  {filteredSocialLinks.map((link) => (
                    <SocialGroupCard
                      key={link.id}
                      link={link}
                      onEdit={handleEditLink}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

      <SocialMediaImporter
        open={socialMediaImporterOpen}
        onOpenChange={handleCloseSocialImporter}
        editLink={editLink}
      />
    </div>
  );
}
