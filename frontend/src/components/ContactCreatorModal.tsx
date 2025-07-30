import { useState } from "react";
import { useMessageStore } from "../store/messageStore";
import { Creator } from "../store/creatorStore";
import { useNavigate } from "react-router-dom";

interface ContactCreatorModalProps {
  creator: Creator;
  onClose: () => void;
  isOpen: boolean;
}

export const ContactCreatorModal = ({
  creator,
  onClose,
  isOpen,
}: ContactCreatorModalProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { addMessage } = useMessageStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addMessage({
      creatorId: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      subject: subject,
      content: message,
      senderType: "user",
    });

    setSubject("");
    setMessage("");
    onClose();
    navigate("/messages"); // Redirect to messages after sending
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Contact {creator.name}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
