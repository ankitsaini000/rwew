"use client";

import React, { useEffect, useState } from "react";

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
  };
  lastMessage?: {
    content?: string;
    type?: string;
    sentAt?: string;
  };
  lastMessageAt?: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  content?: string;
  type?: string;
  sentAt?: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [errorConvos, setErrorConvos] = useState<string | null>(null);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      setLoadingConvos(true);
      setErrorConvos(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/messages/conversations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedConvo(data[0]);
        }
      } catch (err: any) {
        setErrorConvos(err.message || "Failed to fetch conversations");
      } finally {
        setLoadingConvos(false);
      }
    }
    fetchConversations();
    // Get current user id from token (decode or fetch profile)
    async function fetchUserId() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5001/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentUserId(data._id || data.id || null);
      } catch {}
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedConvo) return;
      setLoadingMessages(true);
      setErrorMessages(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`http://localhost:5001/api/messages/conversation/${selectedConvo._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setErrorMessages(err.message || "Failed to fetch messages");
      } finally {
        setLoadingMessages(false);
      }
    }
    if (selectedConvo) fetchMessages();
  }, [selectedConvo]);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>Messages / Conversations</h1>
      <div style={{ display: 'flex', background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #2563eb11', minHeight: 500, overflow: 'hidden' }}>
        {/* Conversations List */}
        <div style={{ width: 350, borderRight: '1.5px solid #e0e7ef', background: '#f8fafc', display: 'flex', flexDirection: 'column', height: 600 }}>
          <div style={{ fontWeight: 700, fontSize: 20, padding: '24px 24px 12px 24px', borderBottom: '1.5px solid #e0e7ef', background: '#fff' }}>Conversations</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvos ? (
              <div style={{ padding: 24 }}>Loading conversations...</div>
            ) : errorConvos ? (
              <div style={{ color: 'red', padding: 24 }}>{errorConvos}</div>
            ) : conversations.length === 0 ? (
              <div style={{ color: '#888', fontSize: 18, padding: 24 }}>No conversations found.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {conversations.map(convo => {
                  const otherUser = convo.otherUser;
                  return (
                    <li
                      key={convo._id}
                      onClick={() => setSelectedConvo(convo)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        padding: '18px 20px',
                        borderBottom: '1px solid #e0e7ef',
                        background: selectedConvo?._id === convo._id ? '#e0e7ef' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        position: 'relative',
                      }}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLLIElement).style.background = selectedConvo?._id === convo._id ? '#e0e7ef' : '#f3f4f6';
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLLIElement).style.background = selectedConvo?._id === convo._id ? '#e0e7ef' : 'transparent';
                      }}
                    >
                      <img
                        src={otherUser?.avatar || '/avatars/placeholder-1.svg'}
                        alt={otherUser?.fullName || otherUser?.username || otherUser?.email || 'Unknown User'}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6', border: selectedConvo?._id === convo._id ? '2px solid #2563eb' : '2px solid #e0e7ef' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser?.fullName || otherUser?.username || otherUser?.email || 'Unknown User'}</div>
                        <div style={{ color: '#888', fontSize: 15, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                          {convo.lastMessage?.content ? convo.lastMessage.content : <span style={{ color: '#bbb' }}>[No messages yet]</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 60 }}>
                        {convo.lastMessageAt && (
                          <div style={{ color: '#aaa', fontSize: 13 }}>{new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        )}
                        {convo.unreadCount && convo.unreadCount > 0 && (
                          <div style={{ background: '#e00', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                            {convo.unreadCount}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {/* Messages List */}
        <div style={{ flex: 1, minWidth: 0, background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)', display: 'flex', flexDirection: 'column', height: 600, position: 'relative' }}>
          {selectedConvo && (
            <div style={{ padding: '18px 32px', borderBottom: '1.5px solid #e0e7ef', background: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={selectedConvo.otherUser?.avatar || '/avatars/placeholder-1.svg'}
                alt={selectedConvo.otherUser?.fullName || selectedConvo.otherUser?.username || selectedConvo.otherUser?.email || 'Unknown User'}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6', border: '2px solid #2563eb' }}
              />
              <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedConvo.otherUser?.fullName || selectedConvo.otherUser?.username || selectedConvo.otherUser?.email || 'Unknown User'}</div>
            </div>
          )}
          <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {loadingMessages ? (
              <div>Loading messages...</div>
            ) : errorMessages ? (
              <div style={{ color: 'red' }}>{errorMessages}</div>
            ) : messages.length === 0 ? (
              <div style={{ color: '#888', fontSize: 16, textAlign: 'center', marginTop: 60 }}>No messages in this conversation.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(msg => {
                  const isMe = msg.sender._id === currentUserId;
                  return (
                    <li key={msg._id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 12 }}>
                      <img
                        src={msg.sender.avatar || '/avatars/placeholder-1.svg'}
                        alt={msg.sender.fullName}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6', marginBottom: 2, boxShadow: '0 2px 8px #2563eb11' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: 420 }}>
                        <div style={{
                          background: isMe ? 'linear-gradient(135deg, #6366f1 60%, #2563eb 100%)' : '#fff',
                          color: isMe ? '#fff' : '#222',
                          borderRadius: 18,
                          padding: '12px 20px',
                          fontSize: 16,
                          fontWeight: 500,
                          boxShadow: isMe ? '0 2px 12px #6366f122' : '0 2px 12px #2563eb11',
                          marginBottom: 4,
                          borderTopRightRadius: isMe ? 6 : 18,
                          borderTopLeftRadius: isMe ? 18 : 6,
                        }}>{msg.content}</div>
                        {msg.sentAt && (
                          <div style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 