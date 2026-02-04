'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { decodeShareCode } from '@/lib/storage';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ExternalLink,
  Import,
  Check,
  AlertCircle,
  ArrowLeft,
  Link as LinkIcon,
} from 'lucide-react';
import { SocialMediaIcon, SOCIAL_MEDIA_CONFIG } from '@/components/links/SocialMediaIcons';

function SharePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, addLink } = useApp();
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Parse share data synchronously - this doesn't need to be in an effect
  const { sharedBundle, parseError } = (() => {
    const data = searchParams.get('data');
    if (!data) {
      return { sharedBundle: null, parseError: 'No share data found in the URL.' };
    }

    const decoded = decodeShareCode(data);
    if (!decoded) {
      return { sharedBundle: null, parseError: 'Invalid or corrupted share link. Please check the URL and try again.' };
    }

    return { sharedBundle: decoded, parseError: null };
  })();

  const error = parseError || importError;

  const handleImport = () => {
    if (!sharedBundle) return;

    // Get the default "Other" category, or use the first available category
    let categoryId = state.categories.find((c) => c.name === 'Other')?.id;
    if (!categoryId && state.categories.length > 0) {
      categoryId = state.categories[0].id;
    }

    if (!categoryId) {
      setImportError('No categories available. Please create a category first.');
      return;
    }

    // Import all links into the user's collection, sorted by order if available
    const sortedLinks = [...sharedBundle.links].sort((a, b) => 
      (a.order ?? 0) - (b.order ?? 0)
    );
    
    sortedLinks.forEach((link) => {
      addLink({
        title: link.title,
        url: link.url,
        description: link.description,
        categoryId,
        isHighlighted: false,
        socialMediaType: link.socialMediaType || null,
      });
    });
    
    setImported(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Unable to Load Bundle</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (imported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Bundle Imported!</CardTitle>
            <CardDescription>
              {sharedBundle?.links.length} link{sharedBundle?.links.length !== 1 ? 's' : ''} from &quot;{sharedBundle?.name}&quot; have been added to your collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to My Links
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{sharedBundle?.name}</CardTitle>
              {sharedBundle?.description && (
                <CardDescription>{sharedBundle.description}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="w-fit">
            {sharedBundle?.links.length} link{sharedBundle?.links.length !== 1 ? 's' : ''}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {sharedBundle?.links
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((link, index) => (
              <div key={index} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {link.socialMediaType ? (
                        <span style={{ color: SOCIAL_MEDIA_CONFIG[link.socialMediaType]?.color }}>
                          <SocialMediaIcon type={link.socialMediaType} size={16} />
                        </span>
                      ) : (
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <p className="font-medium truncate">{link.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {link.url}
                    </p>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button onClick={handleImport} className="flex-1">
              <Import className="h-4 w-4 mr-2" />
              Import All Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SharePageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading shared bundle...</p>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<SharePageLoading />}>
      <SharePageContent />
    </Suspense>
  );
}
