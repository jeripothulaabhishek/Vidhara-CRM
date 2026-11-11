import React from "react";
import { FileText, Image as ImageIcon, Film, Box, ExternalLink, Download } from "lucide-react";
import { TaskAttachment } from "@/types/database";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  attachment: TaskAttachment;
  onPreview?: () => void;
  className?: string;
}

export function FilePreview({ attachment, onPreview, className }: FilePreviewProps) {
  const getIcon = () => {
    switch (attachment.type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-[#6F00FF]" />;
      case "video":
        return <Film className="w-4 h-4 text-[#D99516]" />;
      case "figma":
        return <Box className="w-4 h-4 text-[#3B0270]" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-[#D84B66]" />;
      default:
        return <FileText className="w-4 h-4 text-[#837C8D]" />;
    }
  };

  return (
    <div
      onClick={onPreview}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF7FC] border border-[#F0E6F3] hover:border-[#E9B3FB] hover:bg-white transition-all cursor-pointer group",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white border border-[#F0E6F3] flex items-center justify-center shrink-0 shadow-xs">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#241A33] truncate group-hover:text-[#6F00FF] transition-colors">
            {attachment.name}
          </p>
          <span className="text-[10px] text-[#837C8D] uppercase font-mono">
            {attachment.type} • {attachment.size}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={attachment.url}
          onClick={(e) => e.stopPropagation()}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg text-[#837C8D] hover:text-[#6F00FF] hover:bg-[#FAF7FC]"
          title="Open file"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

