import { useState } from "react";
import { useLocation } from "wouter";
import { Upload, Link as LinkIcon, Plus, Wand2, Edit3, FileUp } from "lucide-react";
import { usePlaylist } from "@/lib/playlist-context";
import { ChannelCard } from "@/components/channel-card";
import { LoadingGrid } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Channel } from "@shared/schema";
import { parseM3U, applyAutoLogos } from "@/lib/m3u-utils";

export default function ChannelEditor() {
  const [, navigate] = useLocation();
  const {
    filteredChannels,
    searchQuery,
    setSearchQuery,
    addChannel,
    updateChannel,
    deleteChannel,
    setChannels,
    channels,
    currentPlaylist,
    isLoading,
    setIsLoading,
    saveCurrentPlaylist,
    setCurrentChannel,
    setPlayerMode,
  } = usePlaylist();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showAutoLogoModal, setShowAutoLogoModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Channel>>({});
  const [importUrl, setImportUrl] = useState("");
  const [importError, setImportError] = useState("");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkRenameOptions, setBulkRenameOptions] = useState({
    mode: "modify" as "modify" | "replace",
    baseName: "",
    prefix: "",
    suffix: "",
    findText: "",
    replaceText: "",
    addNumbering: false,
    numberStart: 1,
    numberFormat: "S01E##"
  });

  const isEditable = true; // Always allow editing
  const isNew = editingIndex === null || editingIndex === -1;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm(channels[index]);
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingIndex(-1);
    setEditForm({ name: "", logo: "", group: "General", url: "" });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.url) return;
    
    if (editingIndex === -1) {
      addChannel(editForm as Channel);
    } else if (editingIndex !== null) {
      updateChannel(editingIndex, editForm);
    }
    
    setShowEditModal(false);
    setEditForm({});
    setEditingIndex(null);
  };

  const handleDelete = () => {
    if (editingIndex !== null && editingIndex >= 0) {
      if (confirm("Delete this channel?")) {
        deleteChannel(editingIndex);
        setShowEditModal(false);
      }
    }
  };

  const handlePlay = (channel: Channel) => {
    setCurrentChannel(channel);
    setPlayerMode(1); // Default to HLS.js player
    navigate("/player");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseAndLoadM3U(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    
    setIsLoading(true);
    setImportError("");

    try {
      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch playlist`);
      }
      
      const text = await response.text();
      parseAndLoadM3U(text);
      setShowImportModal(false);
      setImportUrl("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const parseAndLoadM3U = (text: string) => {
    try {
      const parsed = parseM3U(text);
      setChannels(parsed);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to parse M3U file');
    }
  };

  const handleAutoLogos = () => {
    const targetIndices = selectedChannels.length > 0 ? selectedChannels : channels.map((_, i) => i);
    
    if (customLogoUrl.trim()) {
      // Apply custom logo to selected/all channels
      const updated = channels.map((channel, i) => 
        targetIndices.includes(i) ? { ...channel, logo: customLogoUrl.trim() } : channel
      );
      setChannels(updated);
    } else {
      // Auto-generate logos from tv-logos for selected/all channels
      const updated = applyAutoLogos(channels, targetIndices);
      setChannels(updated);
    }
    setShowAutoLogoModal(false);
    setCustomLogoUrl("");
    setSelectedChannels([]);
    setIsSelectionMode(false);
  };

  const handleBulkRename = () => {
    setShowBulkEditModal(true);
  };

  const applyBulkRename = () => {
    const targetIndices = selectedChannels.length > 0 ? selectedChannels : channels.map((_, i) => i);
    const { mode, baseName, prefix, suffix, findText, replaceText, addNumbering, numberStart, numberFormat } = bulkRenameOptions;
    
    let counter = numberStart;
    const updated = channels.map((channel, i) => {
      if (!targetIndices.includes(i)) return channel;
      
      let newName = "";
      
      if (mode === "replace") {
        // Replace mode: Start fresh with baseName or numbering
        if (baseName.trim()) {
          newName = baseName.trim();
        }
        
        // Add numbering
        if (addNumbering) {
          const formattedNumber = numberFormat.replace(/#+/g, (match) => 
            String(counter).padStart(match.length, '0')
          );
          newName = newName ? newName + " " + formattedNumber : formattedNumber;
          counter++;
        }
        
        // If nothing specified, use just the number
        if (!newName && !addNumbering) {
          newName = channel.name; // Fallback to original name
        }
      } else {
        // Modify mode: Work with existing name
        newName = channel.name;
        
        // Find and replace
        if (findText && replaceText !== undefined) {
          newName = newName.replace(new RegExp(findText, 'g'), replaceText);
        }
        
        // Add prefix
        if (prefix) {
          newName = prefix + newName;
        }
        
        // Add suffix
        if (suffix) {
          newName = newName + suffix;
        }
        
        // Add numbering
        if (addNumbering) {
          const formattedNumber = numberFormat.replace(/#+/g, (match) => 
            String(counter).padStart(match.length, '0')
          );
          newName = newName + " " + formattedNumber;
          counter++;
        }
      }
      
      return { ...channel, name: newName };
    });
    
    setChannels(updated);
    setShowBulkEditModal(false);
    setBulkRenameOptions({
      mode: "modify",
      baseName: "",
      prefix: "",
      suffix: "",
      findText: "",
      replaceText: "",
      addNumbering: false,
      numberStart: 1,
      numberFormat: "S01E##"
    });
    setSelectedChannels([]);
    setIsSelectionMode(false);
  };

  const toggleChannelSelection = (index: number) => {
    setSelectedChannels(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    if (selectedChannels.length === filteredChannels.length) {
      setSelectedChannels([]);
    } else {
      const allIndices = filteredChannels.map((channel) => 
        channels.findIndex(c => c === channel)
      );
      setSelectedChannels(allIndices);
    }
  };

  const startSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedChannels([]);
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedChannels([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 sm:mb-2">Channel Editor</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {channels.length} channels {currentPlaylist && `in "${currentPlaylist.name}"`}
        </p>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          data-testid="input-search"
        />

        {isSelectionMode ? (
          <div className="flex flex-wrap gap-2 items-center bg-primary/10 p-3 rounded-lg">
            <span className="text-sm font-medium">
              {selectedChannels.length} selected
            </span>
            <Button size="sm" variant="secondary" onClick={toggleSelectAll} data-testid="button-select-all">
              <span className="text-xs sm:text-sm">
                {selectedChannels.length === filteredChannels.length ? "Deselect All" : "Select All"}
              </span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowAutoLogoModal(true)} disabled={selectedChannels.length === 0} data-testid="button-bulk-logos">
              <Wand2 className="w-4 h-4 mr-1" />
              <span className="text-xs sm:text-sm">Apply Logos</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={handleBulkRename} disabled={selectedChannels.length === 0} data-testid="button-bulk-rename">
              <Edit3 className="w-4 h-4 mr-1" />
              <span className="text-xs sm:text-sm">Rename</span>
            </Button>
            <Button size="sm" variant="outline" onClick={cancelSelectionMode} data-testid="button-cancel-selection">
              <span className="text-xs sm:text-sm">Cancel</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button size="sm" onClick={handleAddNew} className="bg-primary hover:bg-primary/90 w-full sm:w-auto" data-testid="button-add-channel">
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-xs sm:text-sm">Add</span>
            </Button>
            
            <label htmlFor="file-upload" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" asChild className="w-full" data-testid="button-upload">
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Upload</span>
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".m3u"
              className="hidden"
              onChange={handleFileUpload}
            />
            
            <Button variant="secondary" size="sm" onClick={() => setShowImportModal(true)} className="w-full sm:w-auto" data-testid="button-import-url">
              <LinkIcon className="w-4 h-4 mr-1" />
              <span className="text-xs sm:text-sm">URL</span>
            </Button>

            <Button size="sm" variant="secondary" onClick={startSelectionMode} className="w-full sm:w-auto" data-testid="button-select-mode">
              <span className="text-xs sm:text-sm">Select</span>
            </Button>

            <Button onClick={() => saveCurrentPlaylist()} size="sm" variant="outline" className="w-full sm:w-auto col-span-2 sm:col-span-1" data-testid="button-save">
              <span className="text-xs sm:text-sm">Save</span>
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingGrid />
      ) : filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredChannels.map((channel, index) => {
            const originalIndex = channels.findIndex(c => c === channel);
            return (
              <ChannelCard
                key={originalIndex}
                channel={channel}
                index={originalIndex}
                onEdit={handleEdit}
                onPlay={handlePlay}
                onUpdate={updateChannel}
                isEditable={isEditable}
                isSelectionMode={isSelectionMode}
                isSelected={selectedChannels.includes(originalIndex)}
                onToggleSelect={() => toggleChannelSelection(originalIndex)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No channels match your search" : "No channels loaded"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Playlist
            </Button>
          )}
        </div>
      )}

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add New Channel" : "Edit Channel"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Fill in the channel details" : "Update channel information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Channel Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Channel name"
                data-testid="input-edit-name"
              />
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                type="url"
                value={editForm.logo || ""}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                data-testid="input-edit-logo"
              />
            </div>
            <div>
              <Label htmlFor="edit-group">Group</Label>
              <Input
                id="edit-group"
                value={editForm.group || ""}
                onChange={(e) => setEditForm({ ...editForm, group: e.target.value })}
                placeholder="General"
                data-testid="input-edit-group"
              />
            </div>
            <div>
              <Label htmlFor="edit-url">Stream URL *</Label>
              <Textarea
                id="edit-url"
                value={editForm.url || ""}
                onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                placeholder="https://example.com/stream.m3u8"
                rows={3}
                data-testid="input-edit-url"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto" data-testid="button-delete-channel">
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.name || !editForm.url}
              data-testid="button-save-channel"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from URL</DialogTitle>
            <DialogDescription>
              Enter the URL of an M3U playlist file
            </DialogDescription>
          </DialogHeader>
          <Input
            type="url"
            placeholder="https://example.com/playlist.m3u"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
            data-testid="input-import-url"
          />
          {importError && (
            <p className="text-sm text-destructive">{importError}</p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportUrl} disabled={!importUrl.trim() || isLoading} data-testid="button-fetch-url">
              {isLoading ? "Loading..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAutoLogoModal} onOpenChange={setShowAutoLogoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Logos</DialogTitle>
            <DialogDescription>
              {selectedChannels.length > 0 
                ? `Applying to ${selectedChannels.length} selected channel(s)`
                : "Applying to all channels"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-logo">Custom Logo URL (Optional)</Label>
              <Input
                id="custom-logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                data-testid="input-custom-logo"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Option 1: Enter URL to apply custom logo<br/>
                Option 2: Leave blank to auto-generate from tv-logos
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => {
              setShowAutoLogoModal(false);
              setCustomLogoUrl("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleAutoLogos} data-testid="button-apply-logos">
              {customLogoUrl.trim() ? "Apply Custom Logo" : "Auto-Generate Logos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkEditModal} onOpenChange={setShowBulkEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Rename</DialogTitle>
            <DialogDescription>
              {selectedChannels.length > 0 
                ? `Renaming ${selectedChannels.length} selected channel(s)`
                : "Renaming all channels"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-muted rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rename-mode"
                  checked={bulkRenameOptions.mode === "modify"}
                  onChange={() => setBulkRenameOptions({...bulkRenameOptions, mode: "modify"})}
                  className="w-4 h-4"
                  data-testid="radio-modify"
                />
                <span className="text-sm font-medium">Modify Names</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rename-mode"
                  checked={bulkRenameOptions.mode === "replace"}
                  onChange={() => setBulkRenameOptions({...bulkRenameOptions, mode: "replace"})}
                  className="w-4 h-4"
                  data-testid="radio-replace"
                />
                <span className="text-sm font-medium">Replace Names</span>
              </label>
            </div>

            {bulkRenameOptions.mode === "replace" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="base-name">New Base Name (Optional)</Label>
                  <Input
                    id="base-name"
                    placeholder="e.g., Episode"
                    value={bulkRenameOptions.baseName}
                    onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, baseName: e.target.value})}
                    data-testid="input-base-name"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to use only numbering
                  </p>
                </div>
                
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="add-numbering-replace"
                      checked={bulkRenameOptions.addNumbering}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, addNumbering: e.target.checked})}
                      className="w-4 h-4 rounded border-input"
                      data-testid="checkbox-numbering"
                    />
                    <Label htmlFor="add-numbering-replace" className="cursor-pointer">Add Sequential Numbering</Label>
                  </div>
                  
                  {bulkRenameOptions.addNumbering && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="number-start">Start Number</Label>
                        <Input
                          id="number-start"
                          type="number"
                          min="1"
                          value={bulkRenameOptions.numberStart}
                          onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, numberStart: parseInt(e.target.value) || 1})}
                          data-testid="input-number-start"
                        />
                      </div>
                      <div>
                        <Label htmlFor="number-format">Number Format</Label>
                        <Input
                          id="number-format"
                          placeholder="S01E##"
                          value={bulkRenameOptions.numberFormat}
                          onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, numberFormat: e.target.value})}
                          data-testid="input-number-format"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use # for digits (e.g., ## = 01, ### = 001)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rename-prefix">Add Prefix</Label>
                    <Input
                      id="rename-prefix"
                      placeholder="e.g., [HD]"
                      value={bulkRenameOptions.prefix}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, prefix: e.target.value})}
                      data-testid="input-prefix"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rename-suffix">Add Suffix</Label>
                    <Input
                      id="rename-suffix"
                      placeholder="e.g., (US)"
                      value={bulkRenameOptions.suffix}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, suffix: e.target.value})}
                      data-testid="input-suffix"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="find-text">Find Text</Label>
                    <Input
                      id="find-text"
                      placeholder="Text to find"
                      value={bulkRenameOptions.findText}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, findText: e.target.value})}
                      data-testid="input-find"
                    />
                  </div>
                  <div>
                    <Label htmlFor="replace-text">Replace With</Label>
                    <Input
                      id="replace-text"
                      placeholder="Replacement text"
                      value={bulkRenameOptions.replaceText}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, replaceText: e.target.value})}
                      data-testid="input-replace"
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="add-numbering"
                      checked={bulkRenameOptions.addNumbering}
                      onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, addNumbering: e.target.checked})}
                      className="w-4 h-4 rounded border-input"
                      data-testid="checkbox-numbering"
                    />
                    <Label htmlFor="add-numbering" className="cursor-pointer">Add Sequential Numbering</Label>
                  </div>
                  
                  {bulkRenameOptions.addNumbering && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="number-start-modify">Start Number</Label>
                        <Input
                          id="number-start-modify"
                          type="number"
                          min="1"
                          value={bulkRenameOptions.numberStart}
                          onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, numberStart: parseInt(e.target.value) || 1})}
                          data-testid="input-number-start"
                        />
                      </div>
                      <div>
                        <Label htmlFor="number-format-modify">Number Format</Label>
                        <Input
                          id="number-format-modify"
                          placeholder="S01E##"
                          value={bulkRenameOptions.numberFormat}
                          onChange={(e) => setBulkRenameOptions({...bulkRenameOptions, numberFormat: e.target.value})}
                          data-testid="input-number-format"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use # for digits (e.g., ## = 01, ### = 001)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Preview Example:</p>
              <p className="text-sm font-medium">
                {(() => {
                  if (bulkRenameOptions.mode === "replace") {
                    let preview = bulkRenameOptions.baseName.trim();
                    if (bulkRenameOptions.addNumbering) {
                      const formattedNumber = bulkRenameOptions.numberFormat.replace(/#+/g, (match) => 
                        String(bulkRenameOptions.numberStart).padStart(match.length, '0')
                      );
                      preview = preview ? preview + " " + formattedNumber : formattedNumber;
                    }
                    return preview || "S01E01";
                  } else {
                    let preview = "Channel Name";
                    if (bulkRenameOptions.findText && bulkRenameOptions.replaceText !== undefined) {
                      preview = preview.replace(new RegExp(bulkRenameOptions.findText, 'g'), bulkRenameOptions.replaceText);
                    }
                    if (bulkRenameOptions.prefix) preview = bulkRenameOptions.prefix + preview;
                    if (bulkRenameOptions.suffix) preview = preview + bulkRenameOptions.suffix;
                    if (bulkRenameOptions.addNumbering) {
                      const formattedNumber = bulkRenameOptions.numberFormat.replace(/#+/g, (match) => 
                        String(bulkRenameOptions.numberStart).padStart(match.length, '0')
                      );
                      preview = preview + " " + formattedNumber;
                    }
                    return preview;
                  }
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowBulkEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={applyBulkRename} data-testid="button-apply-rename">
              Apply Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
