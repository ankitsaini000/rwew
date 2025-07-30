import React, { useState } from 'react';
import { X, Copy, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
}

export const ShareModal = ({
  isOpen,
  onClose,
  username,
  displayName
}: ShareModalProps) => {
  if (!isOpen) return null;
  
  const [copied, setCopied] = useState(false);
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/creator/${username}`
    : `/creator/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    let shareUrl = '';
    const text = `Check out ${displayName}'s creator profile!`;
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${profileUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Share Profile</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-4 text-gray-600">Share {displayName}'s profile with others</p>
          
          <div className="flex mb-6">
            <Input 
              className="rounded-r-none flex-grow"
              value={profileUrl}
              readOnly
            />
            <Button
              onClick={copyToClipboard}
              className={`rounded-l-none ${copied ? 'bg-green-600' : 'bg-blue-600'}`}
            >
              {copied ? <Copy className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={() => shareOnSocial('facebook')}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100"
            >
              <Facebook className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-xs">Facebook</span>
            </button>
            
            <button 
              onClick={() => shareOnSocial('twitter')}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100"
            >
              <Twitter className="h-8 w-8 text-blue-400 mb-2" />
              <span className="text-xs">Twitter</span>
            </button>
            
            <button 
              onClick={() => shareOnSocial('linkedin')}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100"
            >
              <Linkedin className="h-8 w-8 text-blue-700 mb-2" />
              <span className="text-xs">LinkedIn</span>
            </button>
            
            <button 
              onClick={() => shareOnSocial('email')}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100"
            >
              <Mail className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-xs">Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 