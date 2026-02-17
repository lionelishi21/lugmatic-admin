import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Music2 } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentFile?: string | null; // URL or base64 string
  label?: string;
  error?: string;
  fileType?: 'image' | 'audio'; // Type of file being uploaded
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 5,
  onFileSelect,
  onFileRemove,
  currentFile,
  label = 'Upload File',
  error,
  fileType = 'image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Set default accept based on fileType
  const defaultAccept = accept || (fileType === 'audio' ? 'audio/*' : 'image/*');
  const defaultMaxSize = fileType === 'audio' ? 50 : 5; // 50MB for audio, 5MB for images
  const actualMaxSize = maxSize || defaultMaxSize;

  const handleFileChange = (file: File) => {
    // Validate file type
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (fileType === 'audio' && !file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > actualMaxSize) {
      alert(`File size must be less than ${actualMaxSize}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview (only for images)
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      // For audio files, just show the file name
      setPreview(null);
    }

    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-green-500 bg-green-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={defaultAccept}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview && fileType === 'image' ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : selectedFile ? (
          <div className="relative p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {fileType === 'audio' ? (
                    <Music2 className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-200 rounded-full">
                {fileType === 'audio' ? (
                  <Music2 className="w-8 h-8 text-gray-500" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop {fileType === 'audio' ? 'an audio file' : 'an image'} here, or click to select
            </p>
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select {fileType === 'audio' ? 'Audio File' : 'Image'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: {actualMaxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;

