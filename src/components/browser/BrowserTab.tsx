import { X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrowserTabProps {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function BrowserTab({
  id,
  title,
  url,
  favicon,
  isActive,
  onSelect,
  onClose,
}: BrowserTabProps) {
  const displayTitle = title || url || "New Tab";
  const shortTitle = displayTitle.length > 20 
    ? displayTitle.slice(0, 20) + "..." 
    : displayTitle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative flex items-center gap-2 px-4 py-2.5 min-w-[140px] max-w-[200px]",
        "border-r border-border/50 cursor-pointer transition-all duration-200",
        isActive 
          ? "bg-browser-tab-active text-foreground" 
          : "bg-browser-tab-inactive text-muted-foreground hover:bg-browser-tab-hover"
      )}
      onClick={onSelect}
    >
      {/* Favicon */}
      {favicon ? (
        <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 flex-shrink-0 rounded bg-primary/20" />
      )}

      {/* Title */}
      <span className="flex-1 truncate text-sm">{shortTitle}</span>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={cn(
          "flex-shrink-0 p-0.5 rounded hover:bg-muted transition-colors",
          "opacity-0 group-hover:opacity-100"
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      )}
    </motion.div>
  );
}
