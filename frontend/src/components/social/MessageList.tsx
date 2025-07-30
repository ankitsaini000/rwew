import React from 'react';

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  sender: {
    name: string;
    avatar?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  className = ''
}) => {
  if (messages.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-8 ${className}`}>
        <p className="text-gray-500 text-center italic">No messages yet. Be the first to send a message!</p>
      </div>
    );
  }
  
  // Format the date to a readable string
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 3600 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-5">Messages</h2>
      
      <div className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="border-b pb-6 last:border-0 last:pb-0">
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="w-10 h-10 bg-purple-100 rounded-full overflow-hidden flex-shrink-0">
                {message.sender.avatar ? (
                  <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-lg">
                    {message.sender.name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{message.sender.name}</h3>
                  <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                </div>
                
                <p className="mt-1 text-gray-700">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList; 