import React, { useMemo, useState } from 'react';
import { useMessages } from '../contexts/MessagesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { formatDateDDMMYY } from '../../../shared/utils/dateFormat';

const statusClasses = {
  OPEN: 'bg-[var(--accent-color,#9F7539)] text-white border border-[var(--accent-color,#9F7539)]',
  RESOLVED: 'bg-transparent text-[var(--text-muted,#6c757d)] border border-[var(--text-muted,#6c757d)]'
};

const formatDate = (iso) => {
  return formatDateDDMMYY(iso);
};

const MessagesPage = () => {
  const { threads, addThread, addMessage, setStatus } = useMessages();
  const { properties } = useProperties();

  const [selectedId, setSelectedId] = useState(threads[0]?.threadId || null);
  const [newMessage, setNewMessage] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ subject: '', propertyId: '', message: '' });

  const simpleThreads = useMemo(() => threads, [threads]);
  const selectedThread = simpleThreads.find((t) => t.threadId === selectedId);

  React.useEffect(() => {
    if (!selectedId && simpleThreads.length) {
      setSelectedId(simpleThreads[0].threadId);
    }
  }, [selectedId, simpleThreads]);

  const handleSend = () => {
    if (!newMessage || !selectedThread) return;
    addMessage(selectedThread.threadId, {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: newMessage,
      createdAt: new Date().toISOString()
    });
    setNewMessage('');
  };

  const handleCompose = () => {
    if (!compose.subject || !compose.message) return;
    const property = properties.find((p) => p.propertyId === compose.propertyId);
    const now = new Date().toISOString();
    const thread = {
      threadId: `MSG-${Date.now()}`,
      subject: compose.subject,
      propertyId: compose.propertyId,
      propertyName: property?.name || '',
      status: 'OPEN',
      lastMessage: compose.message,
      lastUpdatedAt: now,
      messages: [
        { id: `msg-${Date.now()}`, sender: 'USER', text: compose.message, createdAt: now }
      ]
    };
    addThread(thread);
    setSelectedId(thread.threadId);
    setCompose({ subject: '', propertyId: '', message: '' });
    setComposeOpen(false);
  };

  return (
    <div className="p-4 md:p-6 bg-[var(--page-bg,#f8f9fa)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[var(--card-bg,#ffffff)] rounded-lg shadow-md border border-[var(--gray-light,#e2e8f0)] p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-color,#0e1f42)]">Messages</h1>
              <p className="text-sm text-[var(--text-muted,#6c757d)]">Simple support inbox.</p>
            </div>
            <button
              onClick={() => setComposeOpen(true)}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
            >
              New Message
            </button>
          </div>

          {composeOpen && (
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--gray-light,#e2e8f0)] rounded-lg shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-color,#0e1f42)]">New Message</h3>
                <button
                  onClick={() => setComposeOpen(false)}
                  className="text-[var(--text-muted,#6c757d)] hover:text-[var(--text-color,#0e1f42)]"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-3 text-sm text-[var(--text-color,#0e1f42)]">
                <label className="flex flex-col gap-1">
                  Subject *
                  <input
                    value={compose.subject}
                    onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                    className="border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
                    placeholder="Subject"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Select Property (optional)
                  <select
                    value={compose.propertyId}
                    onChange={(e) => setCompose((p) => ({ ...p, propertyId: e.target.value }))}
                    className="border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
                  >
                    <option value="">General</option>
                    {properties.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Message *
                  <textarea
                    value={compose.message}
                    onChange={(e) => setCompose((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2"
                    placeholder="Type your message"
                  />
                </label>
                <button className="px-3 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--gray,#6c757d)] w-fit">
                  <i className="fas fa-paperclip mr-1"></i> Attach file
                </button>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setComposeOpen(false)}
                    className="px-4 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)] text-[var(--gray,#6c757d)] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompose}
                    className="px-4 py-2 rounded-md text-white font-semibold"
                    style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
                    disabled={!compose.subject || !compose.message}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--gray-light,#e2e8f0)] rounded-lg shadow-sm p-4 space-y-3">
            {simpleThreads.length === 0 ? (
              <p className="text-sm text-[var(--text-muted,#6c757d)]">No messages yet. Start a new one.</p>
            ) : (
              simpleThreads.map((t) => (
                <button
                  key={t.threadId}
                  onClick={() => setSelectedId(t.threadId)}
                  className={`w-full text-left rounded-md border px-4 py-3 transition-colors ${
                    selectedId === t.threadId
                      ? 'border-[var(--accent-color,#9F7539)] bg-[color:rgba(159,117,57,0.12)]'
                      : 'border-[var(--gray-light,#e2e8f0)] bg-[var(--card-bg,#ffffff)] hover:bg-[var(--page-bg,#f8f9fa)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-[var(--text-color,#0e1f42)]">{t.subject}</p>
                      <p className="text-sm text-[var(--text-muted,#6c757d)] line-clamp-1">{t.lastMessage}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${statusClasses[t.status] || statusClasses.OPEN}`}>
                        {t.status}
                      </span>
                      <p className="text-xs text-[var(--text-muted,#6c757d)]">{formatDate(t.lastUpdatedAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--gray-light,#e2e8f0)] rounded-lg shadow-sm p-4 space-y-3 min-h-[320px]">
            {!selectedThread ? (
              <p className="text-sm text-[var(--text-muted,#6c757d)]">Select a message to view conversation.</p>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[var(--text-color,#0e1f42)]">{selectedThread.subject}</p>
                    <p className="text-xs text-[var(--text-muted,#6c757d)]">{selectedThread.propertyName || 'General'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${statusClasses[selectedThread.status] || statusClasses.OPEN}`}>
                      {selectedThread.status}
                    </span>
                    <select
                      value={selectedThread.status}
                      onChange={(e) => setStatus(selectedThread.threadId, e.target.value)}
                      className="border border-[var(--gray-light,#e2e8f0)] rounded-md px-2 py-1 text-xs bg-[var(--card-bg,#ffffff)] text-[var(--text-color,#0e1f42)]"
                    >
                      <option value="OPEN">Open</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {selectedThread.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          m.sender === 'USER'
                            ? 'bg-[var(--primary-color,#0e1f42)] text-white'
                            : 'bg-[var(--card-bg,#ffffff)] text-[var(--text-color,#0e1f42)] border border-[var(--gray-light,#e2e8f0)]'
                        }`}
                      >
                        <p>{m.text}</p>
                        <p className="text-[10px] mt-1 opacity-70">{formatDate(m.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--gray-light,#e2e8f0)] pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--gray,#6c757d)]">
                    <button className="px-3 py-2 rounded-md border border-[var(--gray-light,#e2e8f0)]">
                      <i className="fas fa-paperclip mr-1"></i> Attach
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="flex-1 border border-[var(--gray-light,#e2e8f0)] rounded-md px-3 py-2 text-sm"
                      placeholder="Type a message"
                    />
                    <button
                      onClick={handleSend}
                      className="px-4 py-2 rounded-md text-sm font-semibold text-white"
                      style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
                      disabled={!newMessage}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
