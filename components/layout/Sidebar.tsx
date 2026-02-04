'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Link2,
  CalendarDays,
  Package,
  Menu,
  X,
  Blocks,
} from 'lucide-react';

type View = 'links' | 'schedule';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navigation = [
  { id: 'links' as View, label: 'Links', icon: Link2 },
  { id: 'schedule' as View, label: 'Schedule', icon: CalendarDays },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={`bg-card border-r flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Blocks className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Bundle</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? 'mx-auto' : ''}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              if (collapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="icon"
                        className="w-full"
                        onClick={() => onViewChange(item.id)}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          {!collapsed && (
            <p className="text-xs text-muted-foreground text-center">
              Organize blockchain ecosystems
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
