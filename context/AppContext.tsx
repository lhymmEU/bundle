'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppState,
  Link,
  Category,
  Bundle,
  ScheduledActivity,
} from '@/types';
import {
  loadState,
  saveState,
  getInitialState,
  generateId,
  getTimestamp,
  generateShareCode,
} from '@/lib/storage';

interface AppContextType {
  state: AppState;
  isLoaded: boolean;
  
  // Link actions
  addLink: (link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  toggleHighlight: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Bundle actions
  addBundle: (bundle: Omit<Bundle, 'id' | 'createdAt' | 'updatedAt' | 'shareCode'>) => void;
  updateBundle: (id: string, updates: Partial<Bundle>) => void;
  deleteBundle: (id: string) => void;
  generateBundleShareCode: (id: string) => string | null;
  
  // Activity actions
  addActivity: (activity: Omit<ScheduledActivity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (id: string, updates: Partial<ScheduledActivity>) => void;
  deleteActivity: (id: string) => void;
  toggleActivityComplete: (id: string) => void;
  
  // Data management actions
  importData: (data: AppState) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      setState(savedState);
    }
    setIsLoaded(true);
  }, []);

  // Save state on changes
  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  // Link actions
  const addLink = useCallback((link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = getTimestamp();
    const newLink: Link = {
      ...link,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, links: [...prev.links, newLink] }));
  }, []);

  const updateLink = useCallback((id: string, updates: Partial<Link>) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.map((link) =>
        link.id === id ? { ...link, ...updates, updatedAt: getTimestamp() } : link
      ),
    }));
  }, []);

  const deleteLink = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.filter((link) => link.id !== id),
      // Also remove from bundles and activities
      bundles: prev.bundles.map((bundle) => ({
        ...bundle,
        linkIds: bundle.linkIds.filter((linkId) => linkId !== id),
      })),
      activities: prev.activities.map((activity) => ({
        ...activity,
        linkIds: activity.linkIds.filter((linkId) => linkId !== id),
      })),
    }));
  }, []);

  const toggleHighlight = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.map((link) =>
        link.id === id ? { ...link, isHighlighted: !link.isHighlighted, updatedAt: getTimestamp() } : link
      ),
    }));
  }, []);

  // Category actions
  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: getTimestamp(),
    };
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCategory] }));
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
      // Move links to "Other" category or first available
      links: prev.links.map((link) => {
        if (link.categoryId === id) {
          const otherCategory = prev.categories.find((c) => c.name === 'Other' && c.id !== id);
          const fallbackCategory = prev.categories.find((c) => c.id !== id);
          return { ...link, categoryId: otherCategory?.id || fallbackCategory?.id || '' };
        }
        return link;
      }),
    }));
  }, []);

  // Bundle actions
  const addBundle = useCallback((bundle: Omit<Bundle, 'id' | 'createdAt' | 'updatedAt' | 'shareCode'>) => {
    const now = getTimestamp();
    const newBundle: Bundle = {
      ...bundle,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, bundles: [...prev.bundles, newBundle] }));
  }, []);

  const updateBundle = useCallback((id: string, updates: Partial<Bundle>) => {
    setState((prev) => ({
      ...prev,
      bundles: prev.bundles.map((bundle) =>
        bundle.id === id ? { ...bundle, ...updates, updatedAt: getTimestamp() } : bundle
      ),
    }));
  }, []);

  const deleteBundle = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bundles: prev.bundles.filter((bundle) => bundle.id !== id),
    }));
  }, []);

  const generateBundleShareCode = useCallback((id: string): string | null => {
    const bundle = state.bundles.find((b) => b.id === id);
    if (!bundle) return null;
    
    const links = state.links.filter((l) => bundle.linkIds.includes(l.id));
    const shareData = {
      name: bundle.name,
      description: bundle.description,
      links: links.map((l) => ({
        title: l.title,
        url: l.url,
        description: l.description,
      })),
    };
    
    const code = generateShareCode(shareData);
    setState((prev) => ({
      ...prev,
      bundles: prev.bundles.map((b) =>
        b.id === id ? { ...b, shareCode: code } : b
      ),
    }));
    
    // Return a shareable URL with the full data
    return btoa(encodeURIComponent(JSON.stringify(shareData)));
  }, [state.bundles, state.links]);

  // Activity actions
  const addActivity = useCallback((activity: Omit<ScheduledActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = getTimestamp();
    const newActivity: ScheduledActivity = {
      ...activity,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, activities: [...prev.activities, newActivity] }));
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<ScheduledActivity>) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === id ? { ...activity, ...updates, updatedAt: getTimestamp() } : activity
      ),
    }));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((activity) => activity.id !== id),
    }));
  }, []);

  const toggleActivityComplete = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === id
          ? { ...activity, isCompleted: !activity.isCompleted, updatedAt: getTimestamp() }
          : activity
      ),
    }));
  }, []);

  // Data management actions
  const importData = useCallback((data: AppState) => {
    setState(data);
  }, []);

  const clearAllData = useCallback(() => {
    setState(getInitialState());
  }, []);

  const value: AppContextType = {
    state,
    isLoaded,
    addLink,
    updateLink,
    deleteLink,
    toggleHighlight,
    addCategory,
    updateCategory,
    deleteCategory,
    addBundle,
    updateBundle,
    deleteBundle,
    generateBundleShareCode,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleActivityComplete,
    importData,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
