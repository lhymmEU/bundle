import { AppState, Category, DEFAULT_CATEGORIES, SharedBundle } from '@/types';

const STORAGE_KEY = 'bundle-app-state';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp
export function getTimestamp(): string {
  return new Date().toISOString();
}

// Initialize default state with default categories
export function getInitialState(): AppState {
  const now = getTimestamp();
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: generateId(),
    createdAt: now,
  }));

  return {
    links: [],
    categories,
    bundles: [],
    activities: [],
  };
}

// Load state from localStorage
export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppState;
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  return null;
}

// Save state to localStorage
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
}

// Generate share code for bundles (encodes full bundle data including links)
export function generateShareCode(bundle: SharedBundle): string {
  const data = JSON.stringify(bundle);
  return btoa(encodeURIComponent(data));
}

// Decode share code
export function decodeShareCode(code: string): SharedBundle | null {
  try {
    const data = decodeURIComponent(atob(code));
    const parsed = JSON.parse(data);
    // Validate the parsed data has required fields
    if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.links)) {
      return parsed as SharedBundle;
    }
    return null;
  } catch {
    return null;
  }
}
