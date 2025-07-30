import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  creatorName?: string;
}

const ContactPopup: React.FC<ContactPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  creatorName = 'Creator'
}) => {
  const [message, setMessage] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage('');
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 flex justify-between items-center">
          <h3 className="text-xl font-bold">Contact {creatorName}</h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              rows={5}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder={`What would you like to discuss with ${creatorName}?`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPopup;

// Add this to your global CSS for the animation
// @keyframes scale-in {
//   from { transform: scale(0.95); opacity: 0; }
//   to { transform: scale(1); opacity: 1; }
// }
// .animate-scale-in {
//   animation: scale-in 0.2s ease-out forwards;
// } 