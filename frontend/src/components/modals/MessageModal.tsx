import React from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageType: 'contact' | 'custom';
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export const MessageModal = ({
  isOpen,
  onClose,
  messageType,
  subject,
  setSubject,
  message,
  setMessage,
  onSend,
  isSending
}: MessageModalProps) => {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {messageType === 'contact' ? 'Contact Creator' : 'Custom Request'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-1 block">
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full"
                disabled={isSending}
              />
            </div>
            
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-1 block">
                Message
              </Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border rounded-md min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSending}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                variant="outline"
                onClick={onClose}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button 
                onClick={onSend}
                disabled={isSending || !subject.trim() || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 