import React from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { isValidAttachmentUrl, sanitizeFilename } from '../lib/urlValidation';

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
  const safeUrl = isValidAttachmentUrl(url) ? url : null;
  const safeName = sanitizeFilename(name);

  // If URL is not valid, show a warning instead of the file
  if (!safeUrl) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
        isOwnMessage ? 'bg-red-500/20' : 'bg-red-100'
      }`}>
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-600">Invalid attachment</span>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="mb-2">
        <a 
          href={safeUrl} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img
            src={safeUrl}
            alt={safeName}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            // Prevent loading errors from breaking the UI
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </a>
      </div>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 rounded-lg mb-2 transition-colors ${
        isOwnMessage
          ? 'bg-white/10 hover:bg-white/20'
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <FileText className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm truncate flex-1 max-w-[150px]">{safeName}</span>
      <Download className="h-4 w-4 flex-shrink-0" />
    </a>
  );
};
