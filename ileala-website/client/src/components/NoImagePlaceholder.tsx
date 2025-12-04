interface NoImagePlaceholderProps {
  className?: string;
  showUploadHint?: boolean;
}

export default function NoImagePlaceholder({ 
  className = '', 
  showUploadHint = true 
}: NoImagePlaceholderProps) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
      <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm font-medium">No image</span>
      {showUploadHint && (
        <span className="text-xs text-gray-500 mt-1">Upload in admin panel</span>
      )}
    </div>
  );
}

