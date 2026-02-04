'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Pencil } from 'lucide-react';
import {
  TelegramIcon,
  DiscordIcon,
  XIcon,
  SOCIAL_MEDIA_CONFIG,
  detectSocialMediaType,
} from './SocialMediaIcons';

interface SocialMediaImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLink?: Link | null;
}

type SocialPlatform = 'telegram' | 'discord' | 'x';

export function SocialMediaImporter({ open, onOpenChange, editLink }: SocialMediaImporterProps) {
  const { state, addLink, updateLink } = useApp();
  const [platform, setPlatform] = useState<SocialPlatform>('telegram');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const isEditing = !!editLink;

  // Initialize form with edit link data
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editLink) {
      setTitle(editLink.title);
      setUrl(editLink.url);
      setDescription(editLink.description);
      setCategoryId(editLink.categoryId);
      if (editLink.socialMediaType) {
        setPlatform(editLink.socialMediaType as SocialPlatform);
      }
    } else {
      // Reset form when not editing
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryId('');
      setPlatform('telegram');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editLink, open]);

  const platformConfig = SOCIAL_MEDIA_CONFIG[platform];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) return;

    // Auto-detect social media type from URL or use selected platform
    const detectedType = detectSocialMediaType(url) || platform;
    
    if (isEditing && editLink) {
      updateLink(editLink.id, {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        categoryId: categoryId || state.categories[0]?.id || '',
        socialMediaType: detectedType,
      });
    } else {
      addLink({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        categoryId: categoryId || state.categories[0]?.id || '',
        isHighlighted: false,
        socialMediaType: detectedType,
      });
    }

    // Reset form
    setTitle('');
    setUrl('');
    setDescription('');
    setCategoryId('');
    onOpenChange(false);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    // Auto-detect platform from URL
    const detected = detectSocialMediaType(newUrl);
    if (detected) {
      setPlatform(detected as SocialPlatform);
    }
  };

  const renderPlatformIcon = (p: SocialPlatform) => {
    const config = SOCIAL_MEDIA_CONFIG[p];
    switch (p) {
      case 'telegram':
        return <TelegramIcon size={18} className="flex-shrink-0" style={{ color: config.color }} />;
      case 'discord':
        return <DiscordIcon size={18} className="flex-shrink-0" style={{ color: config.color }} />;
      case 'x':
        return <XIcon size={18} className="flex-shrink-0" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <Pencil className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              {isEditing ? 'Edit Social Media Group' : 'Import Social Media Group'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your social media group details.'
                : 'Add links to your Telegram, Discord, or X communities.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Platform Selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(['telegram', 'discord', 'x'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      platform === p
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    {renderPlatformIcon(p)}
                    <span className="text-sm font-medium">
                      {SOCIAL_MEDIA_CONFIG[p].name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Name */}
            <div className="grid gap-2">
              <label htmlFor="social-title" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="social-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${platformConfig.name} group name`}
                required
              />
            </div>

            {/* URL */}
            <div className="grid gap-2">
              <label htmlFor="social-url" className="text-sm font-medium">
                Group Link
              </label>
              <Input
                id="social-url"
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={platformConfig.placeholder}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <label htmlFor="social-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="social-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this community (optional)"
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <label htmlFor="social-category" className="text-sm font-medium">
                Category
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category (optional)" />
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SocialMediaImportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <Users className="h-4 w-4" />
      Import Social Group
    </Button>
  );
}
