'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { LinkOrganizer } from '@/components/links/LinkOrganizer';
import { Schedule } from '@/components/schedule/Schedule';
import { DataManagement } from '@/components/settings/DataManagement';
import { ScrollArea } from '@/components/ui/scroll-area';

type View = 'links' | 'schedule' | 'settings';

export function AppShell() {
  const [currentView, setCurrentView] = useState<View>('links');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 lg:h-screen pt-14 pb-16 lg:pt-0 lg:pb-0">
        <ScrollArea className="h-full">
          <div className="container max-w-6xl mx-auto p-6">
            {currentView === 'links' && <LinkOrganizer />}
            {currentView === 'schedule' && <Schedule />}
            {currentView === 'settings' && <DataManagement />}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
