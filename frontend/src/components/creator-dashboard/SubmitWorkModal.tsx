import React, { useState } from 'react';
import { X, UploadCloud, FileText, Image as ImageIcon, Video } from 'lucide-react';
import api from '../../services/api';

interface SubmitWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, description: string, files: File[]) => void;
  orderId: string;
  isSubmitting: boolean;
  onSuccess: (data: any) => void;
}

export default function SubmitWorkModal({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  isSubmitting,
  onSuccess
}: SubmitWorkModalProps) {
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && selectedFiles.length === 0) {
      alert('Please provide either a description or upload files');
      return;
    }
    onSubmit(orderId, description, selectedFiles);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-0">
      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-6 w-full max-w-xs sm:max-w-md shadow-lg">
        {/* Accent header */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-lg -mx-2 sm:-mx-6 px-2 sm:px-6 py-3 mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">Submit Work for <span className="text-blue-600">Order #{orderId.slice(-6)}</span></h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-2"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Project Description / Notes
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-xs sm:text-sm"
              rows={4}
              placeholder="Describe the completed work, provide instructions for the client, etc."
            />
          </div>
          <div>
            <label htmlFor="files" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Upload Files (Images, Videos, Documents)
            </label>
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-2 text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Selected files:</span> {selectedFiles.map(file => file.name).join(', ')}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!description.trim() && selectedFiles.length === 0)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Submit for Approval'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 