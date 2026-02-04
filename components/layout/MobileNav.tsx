'use client';

import { Button } from '@/components/ui/button';
import { Link2, CalendarDays, Blocks } from 'lucide-react';

type View = 'links' | 'schedule';

interface MobileNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navigation = [
  { id: 'links' as View, label: 'Links', icon: Link2 },
  { id: 'schedule' as View, label: 'Schedule', icon: CalendarDays },
];

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  return (
    <>
      {/* Top Header */}
      <div className="lg:hidden h-14 bg-card border-b flex items-center justify-center px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <Blocks className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">Bundle</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`flex-col h-auto py-2 px-4 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
