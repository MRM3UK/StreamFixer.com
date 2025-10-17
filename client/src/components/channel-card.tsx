import { useState } from "react";
import { Play, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Channel } from "@shared/schema";
import { DEFAULT_FALLBACK_LOGO } from "@shared/schema";

interface ChannelCardProps {
  channel: Channel;
  index: number;
  onEdit: (index: number) => void;
  onPlay: (channel: Channel) => void;
  onUpdate: (index: number, updates: Partial<Channel>) => void;
  isEditable?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ChannelCard({ 
  channel, 
  index, 
  onEdit, 
  onPlay, 
  onUpdate, 
  isEditable = true,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect
}: ChannelCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [nameValue, setNameValue] = useState(channel.name);
  const [groupValue, setGroupValue] = useState(channel.group);

  // Use original logo if it exists and is valid, otherwise use fallback
  const logoUrl = channel.logo && channel.logo.trim() !== '' ? channel.logo : DEFAULT_FALLBACK_LOGO;

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameValue.trim() && nameValue !== channel.name) {
      onUpdate(index, { name: nameValue.trim() });
    } else {
      setNameValue(channel.name);
    }
  };

  const handleGroupBlur = () => {
    setIsEditingGroup(false);
    if (groupValue.trim() && groupValue !== channel.group) {
      onUpdate(index, { group: groupValue.trim() });
    } else {
      setGroupValue(channel.group);
    }
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-3 sm:p-4 border transition-all duration-200",
        isSelectionMode ? "cursor-pointer" : "hover-elevate",
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-card-border"
      )}
      onClick={isSelectionMode ? onToggleSelect : undefined}
      data-testid={`card-channel-${index}`}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2 sm:gap-3">
        {isSelectionMode && (
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-5 h-5 rounded border-input cursor-pointer"
              data-testid={`checkbox-select-${index}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md overflow-hidden">
          <img
            src={logoUrl}
            alt={`${channel.name} logo`}
            className="w-full h-full object-contain p-0.5"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_FALLBACK_LOGO;
            }}
            data-testid={`img-logo-${index}`}
          />
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
            <span className="channel-number-badge text-xs font-extrabold text-purple-300 bg-gradient-to-r from-primary to-chart-2 px-1.5 sm:px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
              #{index + 1}
            </span>
            {isEditingName && isEditable && !isSelectionMode ? (
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
                autoFocus
                className="text-sm sm:text-lg font-bold h-6 sm:h-7 px-1 py-0"
                data-testid={`input-name-${index}`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className={cn(
                  "text-sm sm:text-lg font-bold truncate flex-1",
                  !isSelectionMode && "cursor-text",
                  isEditable && !isSelectionMode && "hover:text-primary transition-colors"
                )}
                onClick={(e) => {
                  if (!isSelectionMode && isEditable) {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }
                }}
                title={isEditable && !isSelectionMode ? "Click to edit name" : channel.name}
                data-testid={`text-name-${index}`}
              >
                {channel.name}
              </h3>
            )}
          </div>

          <div className="text-xs text-chart-2 mt-1">
            {isEditingGroup && isEditable && !isSelectionMode ? (
              <Input
                value={groupValue}
                onChange={(e) => setGroupValue(e.target.value)}
                onBlur={handleGroupBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleGroupBlur()}
                autoFocus
                className="h-6 px-1 py-0 text-xs"
                data-testid={`input-group-${index}`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={cn(
                  "font-medium",
                  !isSelectionMode && "cursor-text",
                  isEditable && !isSelectionMode && "hover:text-primary transition-colors"
                )}
                onClick={(e) => {
                  if (!isSelectionMode && isEditable) {
                    e.stopPropagation();
                    setIsEditingGroup(true);
                  }
                }}
                title={isEditable && !isSelectionMode ? "Click to edit group" : channel.group}
                data-testid={`text-group-${index}`}
              >
                {channel.group}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isSelectionMode && (
        <div className="flex gap-2 pt-2 sm:pt-3 border-t border-border">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(channel);
            }}
            className="flex-1 bg-primary hover:bg-primary/90 text-xs sm:text-sm h-8"
            data-testid={`button-play-${index}`}
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Play
          </Button>
          {isEditable && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index);
              }}
              className="flex-1 text-xs sm:text-sm h-8"
              data-testid={`button-edit-${index}`}
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
