'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse, sendAIChatFeedback } from '@/api/api';
import { usePathname } from 'next/navigation';

const kittuAvatar = (
  <img
    src="/avatars/kittu.png"
    alt="KITTU avatar"
    style={{
      width: 38,
      height: 38,
      borderRadius: '50%',
      objectFit: 'cover',
      boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
      border: '2px solid #fff',
      background: '#fff',
      display: 'block',
    }}
  />
);

const quickReplies = [
  'How can you help me?',
  'Show me platform features',
  'How do I contact support?',
  'Tell me a fun fact',
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{
    role: 'user' | 'ai',
    text: string
  }[]>([
    { role: 'ai', text: 'Hi! I am KITTU 🤖\nYou can search for a topic or select one from the list below 👇' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showFeedbackInChat, setShowFeedbackInChat] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState<'ask' | 'form' | 'thanks'>('ask');
  const [contact, setContact] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Always reset feedback state when opening chat
  const openChat = () => {
    setOpen(true);
    setShowFeedbackInChat(false);
    setFeedbackStep('ask');
    setContact('');
    setFeedbackMsg('');
  };

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // For fade-in animation
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
  }, [open]);

  const sendMessage = async (msg?: string) => {
    const prompt = msg || input;
    if (!prompt.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', text: prompt }]);
    setShowQuick(false);
    setLoading(true);
    setInput('');
    try {
      const aiReply = await getAIResponse(prompt);
      setMessages(msgs => [...msgs, { role: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { role: 'ai', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  // Keyboard accessibility for modal close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Determine if user is logged in (example: check localStorage for token)
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

  // When user clicks close, show feedback in chat only if logged in
  const handleClose = () => {
    if (isLoggedIn) {
      setShowFeedbackInChat(true);
      setFeedbackStep('ask');
      setContact('');
      setFeedbackMsg('');
    } else {
      setOpen(false);
    }
  };

  // After feedback, actually close the chat
  const closeChatAfterFeedback = () => {
    setShowFeedbackInChat(false);
    setOpen(false);
  };

  // Like/dislike handlers
  const handleLike = async () => {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      await sendAIChatFeedback({ like: true });
      closeChatAfterFeedback();
    } catch (e) {
      setFeedbackError('Failed to send feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };
  const handleDislike = () => {
    setFeedbackStep('form');
  };
  const handleFeedbackForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      await sendAIChatFeedback({ like: false, contact, message: feedbackMsg });
      setFeedbackStep('thanks');
    } catch (e) {
      setFeedbackError('Failed to send feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const pathname = usePathname();
  const isChatOrMessages = pathname?.startsWith('/messages') || pathname?.startsWith('/chat');

  return (
    <>
      {/* Floating Button */}
      {!isChatOrMessages && (
        <button
          onClick={openChat}
          style={{
            position: 'fixed',
            bottom: 80, // was 32
            right: 32,
            zIndex: 1000,
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 60,
            height: 60,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'box-shadow 0.2s',
          }}
          aria-label="Open KITTU Chat"
          tabIndex={0}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openChat()}
        >
          {kittuAvatar}
        </button>
      )}
      {/* Modal Popup */}
      {open && !isChatOrMessages && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            transition: 'background 0.3s',
          }}
          onClick={() => setOpen(false)}
          aria-label="Close KITTU Chat"
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              width: '95vw',
              maxWidth: 380,
              maxHeight: '90vh',
              margin: '0 24px 32px 0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.25s, transform 0.25s',
            }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 20px 10px 20px',
              borderBottom: '1px solid #f0f0f0',
              background: '#fafbfc',
            }}>
              {kittuAvatar}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>KITTU</span>
                <span style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Your AI assistant</span>
              </div>
              <span style={{ flex: 1 }} />
              <button
                onClick={handleClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#888',
                  marginLeft: 8,
                }}
                aria-label="Close KITTU Chat"
              >
                ×
              </button>
            </div>
            {/* Chat Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 16px 0 16px',
              background: '#f7fafd',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minHeight: 360,
            }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    animation: 'fadeIn 0.4s',
                  }}
                >
                  {msg.role === 'ai' && (
                    <div style={{ marginRight: 6 }}>{kittuAvatar}</div>
                  )}
                  <div
                    style={{
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #0070f3 60%, #00c6fb 100%)' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#222',
                      borderRadius: 18,
                      padding: '10px 16px',
                      marginLeft: msg.role === 'user' ? 0 : 0,
                      marginRight: msg.role === 'user' ? 0 : 0,
                      maxWidth: 220,
                      fontSize: 15,
                      boxShadow: msg.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                      whiteSpace: 'pre-line',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    {msg.text}
                    {/* Bubble tail */}
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: msg.role === 'ai' ? -8 : undefined,
                      right: msg.role === 'user' ? -8 : undefined,
                      width: 0,
                      height: 0,
                      borderTop: '8px solid #f7fafd',
                      borderLeft: msg.role === 'ai' ? '8px solid #fff' : undefined,
                      borderRight: msg.role === 'user' ? '8px solid #00c6fb' : undefined,
                      borderBottom: 'none',
                      borderRadius: 2,
                      display: 'block',
                    }} />
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeIn 0.4s' }}>
                  <div style={{ marginRight: 6 }}>{kittuAvatar}</div>
                  <div style={{ background: '#fff', color: '#222', borderRadius: 18, padding: '10px 16px', fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <i>KITTU is typing...</i>
                  </div>
                </div>
              )}
              {/* Quick Replies */}
              {showQuick && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {quickReplies.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: '#f3f8ff',
                        border: '1px solid #b3e0ff',
                        color: '#0070f3',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 14,
                        cursor: 'pointer',
                        marginBottom: 4,
                        transition: 'background 0.2s',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {/* Feedback Section (inline in chat window on close) */}
              {showFeedbackInChat && (
                <div style={{ padding: '0 16px 16px 16px', background: 'transparent', marginTop: 4 }}>
                  {feedbackStep === 'ask' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: 15 }}>Was this answer helpful?</span>
                      <button
                        style={{ fontSize: 22, background: 'none', border: 'none', cursor: feedbackLoading ? 'not-allowed' : 'pointer', opacity: feedbackLoading ? 0.6 : 1 }}
                        onClick={handleLike}
                        aria-label="Like"
                        disabled={feedbackLoading}
                      >👍</button>
                      <button
                        style={{ fontSize: 22, background: 'none', border: 'none', cursor: feedbackLoading ? 'not-allowed' : 'pointer', opacity: feedbackLoading ? 0.6 : 1 }}
                        onClick={handleDislike}
                        aria-label="Dislike"
                        disabled={feedbackLoading}
                      >👎</button>
                    </div>
                  )}
                  {feedbackStep === 'form' && (
                    <form
                      style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}
                      onSubmit={handleFeedbackForm}
                    >
                      <div style={{ fontWeight: 500, fontSize: 14 }}>Sorry! Please share your contact info and feedback. Our team will reach you shortly.</div>
                      <input
                        type="text"
                        placeholder="Your email or phone"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        required
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', fontSize: 15 }}
                        disabled={feedbackLoading}
                      />
                      <textarea
                        placeholder="Your feedback (optional)"
                        value={feedbackMsg}
                        onChange={e => setFeedbackMsg(e.target.value)}
                        rows={2}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', fontSize: 15 }}
                        disabled={feedbackLoading}
                      />
                      <button
                        type="submit"
                        style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 600, fontSize: 15, marginTop: 2, cursor: feedbackLoading ? 'not-allowed' : 'pointer', opacity: feedbackLoading ? 0.6 : 1 }}
                        disabled={feedbackLoading}
                      >{feedbackLoading ? 'Submitting...' : 'Submit'}</button>
                      {feedbackError && <div style={{ color: 'red', fontSize: 13 }}>{feedbackError}</div>}
                    </form>
                  )}
                  {feedbackStep === 'thanks' && (
                    <div style={{ textAlign: 'center', fontWeight: 500, fontSize: 15, color: '#0070f3', marginTop: 6 }}>
                      Thank you! Our team will reach out to you shortly.<br />
                      <button
                        style={{ marginTop: 18, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                        onClick={closeChatAfterFeedback}
                      >Close</button>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input Bar (hide if feedback is showing) */}
            {!showFeedbackInChat && (
              <div style={{
                display: 'flex',
                gap: 8,
                padding: 16,
                borderTop: '1px solid #eee',
                background: '#fafbfc',
                alignItems: 'center',
              }}>
                {/* Paperclip icon (disabled) */}
                <span
                  style={{
                    fontSize: 18,
                    color: '#bbb',
                    marginRight: 4,
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    userSelect: 'none',
                  }}
                  aria-label="Attachment (coming soon)"
                  tabIndex={-1}
                >
                  📎
                </span>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Message..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 20,
                    border: '1px solid #e0e0e0',
                    fontSize: 15,
                    outline: 'none',
                    background: '#fff',
                  }}
                  disabled={loading}
                  autoFocus
                  aria-label="Type your message"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    background: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: loading || !input.trim() ? 0.7 : 1,
                    boxShadow: '0 2px 8px rgba(0,112,243,0.10)',
                    transition: 'background 0.2s',
                  }}
                  aria-label="Send"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17L17 10L3 3V8L13 10L3 12V17Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default AIChat; 