'use client';

import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppState } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Trash2,
} from 'lucide-react';

export function DataManagement() {
  const { state, importData, clearAllData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');
  const [pendingImportData, setPendingImportData] = useState<AppState | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bundle-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as AppState;
        
        // Validate the data structure
        if (!data.links || !data.categories || !data.bundles || !data.activities) {
          throw new Error('Invalid data structure. Missing required fields.');
        }
        
        if (!Array.isArray(data.links) || !Array.isArray(data.categories) || 
            !Array.isArray(data.bundles) || !Array.isArray(data.activities)) {
          throw new Error('Invalid data structure. Fields must be arrays.');
        }

        setPendingImportData(data);
        setImportStatus('idle');
        setImportError('');
        setImportDialogOpen(true);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Failed to parse file');
        setImportStatus('error');
        setImportDialogOpen(true);
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const confirmImport = () => {
    if (pendingImportData) {
      importData(pendingImportData);
      setImportStatus('success');
      setPendingImportData(null);
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportStatus('idle');
      }, 1500);
    }
  };

  const handleClearData = () => {
    clearAllData();
    setClearDialogOpen(false);
  };

  const stats = {
    links: state.links.length,
    categories: state.categories.length,
    bundles: state.bundles.length,
    activities: state.activities.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
        <p className="text-muted-foreground">
          Export your data to backup or transfer to another device
        </p>
      </div>

      {/* Current Data Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Data</CardTitle>
          <CardDescription>Overview of your stored data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.links}</p>
              <p className="text-sm text-muted-foreground">Links</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.bundles}</p>
              <p className="text-sm text-muted-foreground">Bundles</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.activities}</p>
              <p className="text-sm text-muted-foreground">Activities</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export/Import Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download all your data as a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              <FileJson className="h-4 w-4 mr-2" />
              Export to JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import from JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importStatus === 'error' ? 'Import Failed' : 
               importStatus === 'success' ? 'Import Successful' : 
               'Confirm Import'}
            </DialogTitle>
            <DialogDescription>
              {importStatus === 'error' ? (
                <span className="text-destructive">{importError}</span>
              ) : importStatus === 'success' ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Your data has been imported successfully.
                </span>
              ) : (
                <>
                  This will replace all your current data with the imported data.
                  {pendingImportData && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <p><strong>Importing:</strong></p>
                      <ul className="mt-2 space-y-1">
                        <li>{pendingImportData.links.length} links</li>
                        <li>{pendingImportData.categories.length} categories</li>
                        <li>{pendingImportData.bundles.length} bundles</li>
                        <li>{pendingImportData.activities.length} activities</li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {importStatus === 'idle' && pendingImportData && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmImport}>
                Confirm Import
              </Button>
            </DialogFooter>
          )}
          {importStatus === 'error' && (
            <DialogFooter>
              <Button onClick={() => setImportDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all your data? This action cannot be undone.
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                <p>This will permanently delete:</p>
                <ul className="mt-2 space-y-1">
                  <li>{stats.links} links</li>
                  <li>{stats.categories} categories</li>
                  <li>{stats.bundles} bundles</li>
                  <li>{stats.activities} activities</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
