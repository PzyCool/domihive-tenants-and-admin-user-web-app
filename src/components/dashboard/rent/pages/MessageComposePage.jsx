import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Plus, Send } from 'lucide-react';
import { useMessages } from '../contexts/MessagesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { formatDateDDMMYY } from '../../../shared/utils/dateFormat';
import StatusBadge from '../components/common/StatusBadge';
import { MESSAGE_THREAD_STATUS_FILTER_OPTIONS } from '../components/common/tenantFilters';

const getStatusLabel = (status) => {
  const normalized = String(status || 'PENDING_CHAT').toUpperCase();
  if (normalized === 'ENDED_CHAT') return 'Ended Chat';
  if (normalized === 'PENDING_CHAT') return 'Pending Chat';
  if (normalized === 'RESOLVED') return 'Resolved';
  return 'Open';
};

const getStatusTone = (status) => {
  const normalized = String(status || 'PENDING_CHAT').toUpperCase();
  if (normalized === 'ENDED_CHAT') return 'danger';
  if (normalized === 'PENDING_CHAT') return 'warning';
  return 'success';
};

const ISSUE_OPTIONS = [
  'Payment issue',
  'Maintenance issue',
  'General issues',
  'Report an issue',
  'General',
  'Others'
];

const MessageComposePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { threads, addThread, addMessage } = useMessages();
  const { properties } = useProperties();

  const propertyIdFromQuery = params.get('propertyId') || '';
  const team = params.get('team') || '';

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [startNewChat, setStartNewChat] = useState(false);
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [otherIssueText, setOtherIssueText] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [pendingNewThreadId, setPendingNewThreadId] = useState('');

  const teamLabel =
    team === 'support-team'
      ? 'Support Team'
      : team === 'customer-service'
        ? 'Customer Service'
        : 'Customer Service';

  const propertyFromQuery = useMemo(
    () => properties.find((item) => String(item.propertyId) === String(propertyIdFromQuery)),
    [properties, propertyIdFromQuery]
  );

  const filteredThreads = useMemo(() => {
    let list = [...threads];
    if (statusFilter !== 'all') {
      list = list.filter((thread) => {
        const s = String(thread.status || '').toUpperCase();
        if (statusFilter === 'open') return s === 'OPEN';
        if (statusFilter === 'pending') return s === 'PENDING_CHAT';
        if (statusFilter === 'ended') return s === 'ENDED_CHAT';
        if (statusFilter === 'resolved') return s === 'RESOLVED';
        return true;
      });
    }
    return list.sort((a, b) => new Date(b.lastUpdatedAt || 0) - new Date(a.lastUpdatedAt || 0));
  }, [threads, statusFilter]);

  const selectedThread = useMemo(
    () => filteredThreads.find((thread) => thread.threadId === selectedId) || threads.find((thread) => thread.threadId === selectedId) || null,
    [filteredThreads, threads, selectedId]
  );

  useEffect(() => {
    if (!selectedId && filteredThreads.length > 0) {
      setSelectedId(filteredThreads[0].threadId);
    }
  }, [selectedId, filteredThreads]);

  useEffect(() => {
    if (!propertyIdFromQuery && !team) return;

    const matched = threads.find(
      (thread) =>
        String(thread.propertyId || '') === String(propertyIdFromQuery || '') &&
        String(thread.subject || '').toLowerCase().includes(teamLabel.toLowerCase())
    );

    if (matched) {
      setSelectedId(matched.threadId);
      return;
    }

    setStartNewChat(true);
    setIssueDrawerOpen(true);
  }, [propertyIdFromQuery, team, teamLabel, propertyFromQuery, threads]);

  useEffect(() => {
    if (!pendingNewThreadId) return;
    const found = threads.find((thread) => thread.threadId === pendingNewThreadId);
    if (found) {
      setSelectedId(pendingNewThreadId);
      setPendingNewThreadId('');
    }
  }, [pendingNewThreadId, threads]);

  const beginConnection = () => {
    const issue = selectedIssue === 'Others' ? otherIssueText.trim() : selectedIssue;
    if (!issue) return;
    setConnecting(true);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      const subject = `${teamLabel} • ${issue}${propertyFromQuery?.name ? ` • ${propertyFromQuery.name}` : ''}`;
      const threadId = `MSG-${Date.now()}`;
      const supportIntro = `You are now connected to ${teamLabel}. How may we help you today?`;
      addThread({
        threadId,
        subject,
        propertyId: propertyIdFromQuery || '',
        propertyName: propertyFromQuery?.name || '',
        status: 'OPEN',
        lastMessage: supportIntro,
        lastUpdatedAt: now,
        messages: [
          { id: `msg-${Date.now()}-support`, sender: 'SUPPORT', text: supportIntro, createdAt: now },
          { id: `msg-${Date.now()}-issue`, sender: 'USER', text: `Issue selected: ${issue}`, createdAt: now }
        ]
      });
      setPendingNewThreadId(threadId);
      setIssueDrawerOpen(false);
      setStartNewChat(false);
      setSelectedIssue('');
      setOtherIssueText('');
      setConnecting(false);
    }, 1200);
  };

  const handleSend = () => {
    if (!selectedThread || !newMessage.trim()) return;
    const now = new Date().toISOString();
    addMessage(selectedThread.threadId, {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: newMessage.trim(),
      createdAt: new Date().toISOString()
    });
    setNewMessage('');
  };

  return (
    <div className="rent-overview-container min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/dashboard/rent/messages')}
            className="p-2 hover:bg-gray-100 rounded-xl status-accent transition-all mt-0.5"
            aria-label="Back to Messages"
          >
            <ArrowLeft size={22} className="return-icon-accent" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color,#0e1f42)]">Messages</h1>
            <p className="text-sm text-[var(--text-muted,#6c757d)]">Simple support inbox.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
          <aside
            className="lg:col-span-4 rounded-3xl border shadow-sm p-4 md:p-5 h-[460px] lg:h-[500px] flex flex-col gap-4"
            style={{ backgroundColor: 'var(--card-bg,#fff)', borderColor: 'var(--border-color,#e2e8f0)' }}
          >
              <button
                onClick={() => {
                  setStartNewChat(true);
                  setIssueDrawerOpen(true);
                  setSelectedId(null);
                  setSelectedIssue('');
                  setOtherIssueText('');
                  setConnecting(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
              >
                <Plus size={16} />
                New Message
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border text-sm"
                style={{
                  borderColor: 'var(--border-color,#e2e8f0)',
                  color: 'var(--text-color,#0e1f42)',
                  backgroundColor: 'transparent'
                }}
              >
                {MESSAGE_THREAD_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="space-y-2 flex-1 min-h-0 overflow-auto pr-1">
                {filteredThreads.length === 0 ? (
                  <div className="rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
                    <p className="font-semibold text-[var(--text-color,#0e1f42)]">No threads found.</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <button
                      key={thread.threadId}
                      onClick={() => setSelectedId(thread.threadId)}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                        selectedId === thread.threadId
                          ? 'border-[var(--accent-color,#9F7539)] bg-[color:rgba(159,117,57,0.12)]'
                          : 'hover:bg-[var(--surface-2,#f8fafc)]'
                      }`}
                      style={{ borderColor: selectedId === thread.threadId ? 'var(--accent-color,#9F7539)' : 'var(--border-color,#e2e8f0)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-[var(--text-color,#0e1f42)] line-clamp-1">{thread.subject}</p>
                        <StatusBadge
                          status={thread.status}
                          label={getStatusLabel(thread.status)}
                          tone={getStatusTone(thread.status)}
                          className="text-[10px] px-2 py-0.5"
                        />
                      </div>
                      <p className="text-xs text-[var(--text-muted,#6c757d)] line-clamp-1 mt-1">{thread.lastMessage || 'No message yet'}</p>
                      <p className="text-[11px] text-[var(--text-muted,#6c757d)] mt-1">
                        {thread.lastUpdatedAt ? formatDateDDMMYY(thread.lastUpdatedAt) : '--'}
                      </p>
                    </button>
                  ))
                )}
              </div>
          </aside>

          <section
            className="lg:col-span-8 rounded-3xl border shadow-sm overflow-hidden flex flex-col min-h-[640px]"
            style={{ backgroundColor: 'var(--card-bg,#fff)', borderColor: 'var(--border-color,#e2e8f0)' }}
          >
              {!selectedThread && !startNewChat ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <MessageCircle size={28} className="mx-auto text-[var(--text-muted,#64748b)]" />
                    <p className="font-semibold text-[var(--text-color,#0e1f42)]">No conversation selected</p>
                    <p className="text-sm text-[var(--text-muted,#6c757d)]">Choose a thread from the left to continue.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="px-5 py-4 border-b flex items-center justify-between gap-3"
                    style={{ borderColor: 'var(--border-color,#e2e8f0)' }}
                  >
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-color,#0e1f42)]">
                        {selectedThread?.subject || `New Chat • ${teamLabel}`}
                      </h3>
                      <p className="text-xs text-[var(--text-muted,#6c757d)]">
                        {selectedThread?.propertyName || propertyFromQuery?.name || 'General'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={selectedThread?.status || 'PENDING_CHAT'}
                        label={getStatusLabel(selectedThread?.status || 'PENDING_CHAT')}
                        tone={getStatusTone(selectedThread?.status || 'PENDING_CHAT')}
                        className="text-xs px-3 py-1"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
                    {!selectedThread && startNewChat ? (
                      <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border-color,#e2e8f0)' }}>
                        <p className="font-semibold text-[var(--text-color,#0e1f42)]">Start a new conversation</p>
                        <p className="text-[var(--text-muted,#6c757d)] mt-1">
                          Use the chat input below. We will ask for your issue type first.
                        </p>
                      </div>
                    ) : (selectedThread?.messages || []).map((message) => {
                      const isUser = message.sender === 'USER';
                      return (
                        <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[76%] rounded-2xl px-3 py-2.5 text-sm ${
                              isUser
                                ? 'text-white'
                                : 'border'
                            }`}
                            style={
                              isUser
                                ? { backgroundColor: 'var(--accent-color,#9F7539)' }
                                : {
                                    color: 'var(--text-color,#0e1f42)',
                                    borderColor: 'var(--border-color,#e2e8f0)',
                                    backgroundColor: 'var(--surface-2,#f8fafc)'
                                  }
                            }
                          >
                            <p>{message.text}</p>
                            <p className={`text-[10px] mt-1 ${isUser ? 'text-white/80' : 'text-[var(--text-muted,#6c757d)]'}`}>
                              {formatDateDDMMYY(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="relative px-5 py-3 border-t flex items-center gap-2"
                    style={{ borderColor: 'var(--border-color,#e2e8f0)' }}
                  >
                    {issueDrawerOpen && (
                      <div
                        className="absolute left-5 right-5 bottom-[64px] rounded-xl border shadow-lg p-4 space-y-3 z-20"
                        style={{ backgroundColor: 'var(--card-bg,#fff)', borderColor: 'var(--border-color,#e2e8f0)' }}
                      >
                        {!connecting ? (
                          <>
                            <p className="text-sm font-semibold text-[var(--text-color,#0e1f42)]">How may we help you today?</p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {ISSUE_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => setSelectedIssue(opt)}
                                  className={`text-left px-3 py-2 rounded-lg border text-sm ${
                                    selectedIssue === opt ? 'border-[var(--accent-color,#9F7539)]' : ''
                                  }`}
                                  style={{
                                    borderColor: selectedIssue === opt ? 'var(--accent-color,#9F7539)' : 'var(--border-color,#e2e8f0)',
                                    color: 'var(--text-color,#0e1f42)'
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            {selectedIssue === 'Others' && (
                              <input
                                value={otherIssueText}
                                onChange={(e) => setOtherIssueText(e.target.value)}
                                placeholder="Please specify"
                                className="w-full h-10 px-3 rounded-lg border text-sm bg-transparent"
                                style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-color,#0e1f42)' }}
                              />
                            )}
                            <div className="flex justify-end">
                              <button
                                onClick={beginConnection}
                                disabled={!selectedIssue || (selectedIssue === 'Others' && !otherIssueText.trim())}
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
                              >
                                Continue
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-[var(--text-color,#0e1f42)]">
                            Please hold on while we connect you to {teamLabel}...
                          </p>
                        )}
                      </div>
                    )}
                    <label
                      className="px-3 py-2 rounded-lg border cursor-pointer text-[var(--text-muted,#6c757d)] hover:text-[var(--text-color,#0e1f42)]"
                      style={{ borderColor: 'var(--border-color,#e2e8f0)' }}
                    >
                      <i className="fas fa-paperclip"></i>
                      <input type="file" className="hidden" />
                    </label>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-3 rounded-lg border text-sm bg-transparent"
                      style={{ borderColor: 'var(--border-color,#e2e8f0)', color: 'var(--text-color,#0e1f42)' }}
                      disabled={!selectedThread}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || !selectedThread}
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent-color,#9F7539)' }}
                    >
                      <Send size={14} />
                      Send
                    </button>
                  </div>
                </>
              )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessageComposePage;

