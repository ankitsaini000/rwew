import React, { useState, useRef } from 'react';
import axios from 'axios';

interface FileUploadProps {
  endpoint: string;
  fieldName: string;
  multiple?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  onUploadSuccess: (fileUrls: string[]) => void;
  onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  endpoint,
  fieldName,
  multiple = false,
  maxFiles = 5,
  acceptedFileTypes = 'image/*,video/*',
  maxFileSize = 50, // default 50MB
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Validate file count
    if (multiple && fileArray.length > maxFiles) {
      onUploadError(`You can only upload up to ${maxFiles} files at once`);
      return;
    }
    
    // Validate file sizes
    const invalidFiles = fileArray.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (invalidFiles.length > 0) {
      onUploadError(`Some files exceed the maximum size of ${maxFileSize}MB`);
      return;
    }
    
    setSelectedFiles(fileArray);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      onUploadError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    
    // Append files to FormData
    if (multiple) {
      selectedFiles.forEach(file => {
        formData.append(fieldName, file);
      });
    } else {
      formData.append(fieldName, selectedFiles[0]);
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        }
      });

      setIsUploading(false);
      
      if (response.data.success) {
        // Extract file URLs based on response structure
        let fileUrls: string[] = [];
        
        if (multiple) {
          if (response.data[fieldName]) {
            fileUrls = response.data[fieldName];
          } else if (response.data.data) {
            fileUrls = response.data.data.map((file: any) => file.fileUrl);
          }
        } else {
          if (response.data.data && response.data.data.fileUrl) {
            fileUrls = [response.data.data.fileUrl];
          }
        }
        
        onUploadSuccess(fileUrls);
        setSelectedFiles([]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        onUploadError('Upload failed');
      }
    } catch (error: any) {
      setIsUploading(false);
      onUploadError(error.response?.data?.message || 'Error uploading files');
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          multiple={multiple}
          ref={fileInputRef}
          className="file-input"
          disabled={isUploading}
        />
        <div className="selected-files">
          {selectedFiles.length > 0 && (
            <div>
              <p>{selectedFiles.length} file(s) selected</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="upload-actions">
        {selectedFiles.length > 0 && (
          <>
            <button
              onClick={uploadFiles}
              disabled={isUploading}
              className="upload-button"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="clear-button"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {isUploading && (
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 