import React from 'react';
import { FileText, Image as ImageIcon, Download } from 'lucide-react';

interface FileAttachmentProps {
  url: string;
  type: string;
  name: string;
  isOwnMessage: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  url,
  type,
  name,
  isOwnMessage
}) => {
  const isImage = type?.startsWith('image/');

  if (isImage) {
    return (
      <div className="mb-2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={name}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 rounded-lg mb-2 transition-colors ${
        isOwnMessage
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <FileText className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm truncate flex-1 max-w-[150px]">{name}</span>
      <Download className="h-4 w-4 flex-shrink-0" />
    </a>
  );
};
