import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Phone, Mail } from 'lucide-react';

import { API_URL } from '../config';

export default function Chat({ token, currentUser, initialContact }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch contacts list
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/messages/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        let mergedContacts = [...data];
        if (initialContact) {
          const exists = mergedContacts.some(c => c._id === initialContact._id);
          if (!exists) {
            mergedContacts.unshift(initialContact);
          }
        }
        setContacts(mergedContacts);
        
        if (initialContact) {
          setSelectedContact(initialContact);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch chat history with selected contact
  const fetchMessages = async (contactId) => {
    if (!contactId) return;
    try {
      const response = await fetch(`${API_URL}/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [initialContact]);

  // Poll messages when selectedContact changes
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (selectedContact) {
      fetchMessages(selectedContact._id);
      
      // Setup polling every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedContact._id);
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedContact]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const payload = {
      receiverId: selectedContact._id,
      message: messageText.trim()
    };

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, data]);
        setMessageText('');
        // Refresh contacts to bubble active chats to top
        fetchContacts();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="chat-layout glass animate-fade-in">
      {/* Contacts List Panel */}
      <div className="chat-contacts-pane">
        <div className="chat-pane-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
            <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} /> Messages
          </h3>
        </div>
        
        <div className="chat-contacts-list">
          {loadingContacts ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading chats...
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No active contacts yet. (Contacts appear when you have an active lease agreement).
            </div>
          ) : (
            contacts.map(contact => (
              <div 
                key={contact._id} 
                className={`chat-contact-item ${selectedContact?._id === contact._id ? 'active' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{contact.role}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Area Pane */}
      <div className="chat-screen-pane">
        {selectedContact ? (
          <>
            {/* Active Contact Header */}
            <div className="chat-screen-header">
              <div>
                <h4 style={{ fontWeight: 700 }}>{selectedContact.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {selectedContact.role}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {selectedContact.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={12} /> {selectedContact.phone}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={12} /> {selectedContact.email}
                </span>
              </div>
            </div>

            {/* Scrollable Chat Feed */}
            <div className="chat-messages-area">
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Say hello to initiate your conversation!
                </div>
              ) : (
                messages.map(msg => {
                  const isSentByMe = msg.sender === currentUser.id || msg.sender === currentUser._id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`msg-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      <div className="msg-bubble">
                        {msg.message}
                      </div>
                      <div className="msg-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Submission Footer */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-form">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.25rem' }}>
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
            <p>Select a contact to view and send messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
