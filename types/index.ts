// Link Organizer Types

export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  categoryId: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  linkIds: string[];
  createdAt: string;
  updatedAt: string;
  shareCode?: string;
}

// Schedule Types

export interface ScheduledActivity {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string; // Optional time in HH:MM format
  linkIds: string[]; // Associated links from the organizer
  color?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Storage Types

export interface AppState {
  links: Link[];
  categories: Category[];
  bundles: Bundle[];
  activities: ScheduledActivity[];
}

// Default categories for blockchain ecosystems
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Ethereum', color: '#627EEA', icon: 'ethereum' },
  { name: 'Bitcoin', color: '#F7931A', icon: 'bitcoin' },
  { name: 'Solana', color: '#00FFA3', icon: 'solana' },
  { name: 'Polygon', color: '#8247E5', icon: 'polygon' },
  { name: 'Arbitrum', color: '#28A0F0', icon: 'arbitrum' },
  { name: 'Base', color: '#0052FF', icon: 'base' },
  { name: 'Avalanche', color: '#E84142', icon: 'avalanche' },
  { name: 'Other', color: '#6B7280', icon: 'other' },
];
