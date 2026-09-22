import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Building2, 
  Phone, 
  User, 
  Calendar,
  MessageSquare,
  Send,
  ExternalLink,
  Inbox,
  Sparkles,
  Check,
  Copy,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { emailService, EmailMessageRecord } from '../../services/emailService';
import { ContactMessage, CompanyInfo } from '../../types';
import { StatusBadge } from '../components/StatusBadge';
import { updatePageSeo } from '../../services/seoService';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

export const MessagesAdminPage: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailMessageRecord[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => storageService.getCompanyInfo());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'inquiries' | 'email_logs'>('inquiries');
  const [selectedEmail, setSelectedEmail] = useState<EmailMessageRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; senderName: string; subject: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setMessages(storageService.getContactMessages());
    setEmailLogs(emailService.getEmailLogs());
    setCompanyInfo(storageService.getCompanyInfo());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Customer Transmissions & Email Dispatch Center | NEXORA Admin',
      description: 'Review communications, customer inquiries, and enterprise email dispatch logs.',
    });
    loadData();

    // Subscribe to real-time Firestore database updates
    const unsubscribeMessages = storageService.subscribeToMessages((liveMessages) => {
      setMessages(liveMessages);
    });

    const unsubscribeCompany = storageService.subscribeToCompanyInfo((updated) => {
      setCompanyInfo(updated);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeCompany();
    };
  }, []);

  const handleStatusChange = (id: string, newStatus: ContactMessage['status']) => {
    storageService.updateMessageStatus(id, newStatus);
    loadData();
    toast.success(`Message ticket marked as "${newStatus}".`, 'Status Updated');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await storageService.deleteMessage(deleteTarget.id);
      loadData();
      toast.success(`Inquiry from ${deleteTarget.senderName} deleted.`, 'Message Deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message record.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info('Copied to clipboard: ' + text, 'Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDepartmentEmail = (dept: string) => {
    if (dept === 'Sales & Rates' && companyInfo.quotesEmail) return companyInfo.quotesEmail;
    if (dept === 'Customer Support' && companyInfo.supportEmail) return companyInfo.supportEmail;
    if (dept === 'Customs Brokerage' && (companyInfo.customsEmail || companyInfo.supportEmail)) return companyInfo.customsEmail || companyInfo.supportEmail;
    if (dept === 'Press & Media') return companyInfo.mediaEmail || companyInfo.pressEmail || companyInfo.primaryEmail;
    return companyInfo.primaryEmail;
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.company && m.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmailLogs = emailLogs.filter((log) => {
    return (
      log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.quoteRef && log.quoteRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.trackingNumber && log.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Communications &amp; Email Dispatch Tower
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Incoming transmissions from public desks &amp; outgoing transactional notifications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-lg text-xs font-mono-tech uppercase font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-[#0066FF] text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Customer Inquiries ({messages.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email_logs');
              setEmailLogs(emailService.getEmailLogs());
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono-tech uppercase font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'email_logs'
                ? 'bg-[#0066FF] text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Audit Trail ({emailLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 font-mono-tech text-xs">
        <div className={activeTab === 'inquiries' ? 'md:col-span-8 relative' : 'md:col-span-12 relative'}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'inquiries'
                ? 'Search by sender, email, company, subject, or message content...'
                : 'Search sent email logs by recipient, subject, quote reference, or tracking waybill...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
          />
        </div>
        
        {activeTab === 'inquiries' && (
          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
            >
              <option value="ALL">All Statuses ({messages.length})</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Customer Inquiries */}
      {activeTab === 'inquiries' && (
        <>
          {filteredMessages.length === 0 ? (
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
                No Inquiries Found
              </h3>
              <p className="text-slate-500 text-xs font-mono-tech mt-1">
                No customer transmissions match your active search filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => {
                const targetDeptEmail = getDepartmentEmail(msg.department);
                const replyMailto = `mailto:${msg.email}?subject=${encodeURIComponent(
                  `Re: [Ticket #${msg.id}] ${msg.subject} - ${companyInfo.tradeName}`
                )}&body=${encodeURIComponent(
                  `Dear ${msg.name},\n\nThank you for reaching out to NEXORA Operations regarding "${msg.subject}".\n\n[Write response here]\n\n---\nBest regards,\n${companyInfo.companyName} Operations Desk\n${companyInfo.primaryPhone} | ${targetDeptEmail}`
                )}`;

                return (
                  <div
                    key={msg.id}
                    className={`bg-white dark:bg-[#070D1D] border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 transition-all ${
                      msg.status === 'Unread'
                        ? 'border-[#0066FF]/40 shadow-blue-500/5'
                        : 'border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading font-black text-base text-slate-950 dark:text-white uppercase">
                              {msg.name}
                            </span>
                            {msg.company && (
                              <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400">
                                • {msg.company}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 font-mono-tech text-[10px] uppercase font-semibold">
                              {msg.department}
                            </span>
                          </div>
                          
                          <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                            <span className="text-slate-900 dark:text-gray-200 font-medium">{msg.email}</span>
                            {msg.phone && <span>• Tel: {msg.phone}</span>}
                            <span>• {msg.createdAt}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              • Routed to: {targetDeptEmail}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={msg.status} />

                        <a
                          href={replyMailto}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-mono-tech font-bold uppercase transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply by Email</span>
                        </a>

                        <button
                          onClick={() => handleStatusChange(msg.id, msg.status === 'Unread' ? 'Read' : 'Unread')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-mono-tech text-slate-700 dark:text-gray-300 transition-colors"
                        >
                          {msg.status === 'Unread' ? 'Mark Read' : 'Mark Unread'}
                        </button>

                        <button
                          onClick={() => setDeleteTarget({ id: msg.id, senderName: msg.name, subject: msg.subject })}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase mb-1.5 flex items-center gap-2">
                        <span>Subject: {msg.subject}</span>
                        <span className="text-[10px] font-mono-tech text-slate-400">#{msg.id}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: System Email Audit Trail */}
      {activeTab === 'email_logs' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono-tech text-xs">
            <div>
              <div className="text-[#38bdf8] font-bold text-sm">TRANSACTIONAL EMAIL DISPATCH ENGINE (ACTIVE)</div>
              <p className="text-gray-400 text-xs mt-0.5">
                Every customer quote, acceptance contract, contact inquiry, shipment waybill, and tracking update is recorded in the operational audit trail.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                ● 100% OPERATIONAL
              </span>
            </div>
          </div>

          {filteredEmailLogs.length === 0 ? (
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
                No Email Logs Found
              </h3>
              <p className="text-slate-500 text-xs font-mono-tech mt-1">
                No sent transactional emails match your query.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmailLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center font-bold shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-950 dark:text-white">
                          {log.subject}
                        </div>
                        <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>To: <strong className="text-slate-800 dark:text-gray-200">{log.recipientName}</strong> &lt;{log.recipientEmail}&gt;</span>
                          {log.fromEmail && <span>• From: &lt;{log.fromEmail}&gt;</span>}
                          <span>• {new Date(log.sentAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono-tech font-bold uppercase text-slate-700 dark:text-gray-300">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                      {log.gmailComposeUrl && (
                        <a
                          href={log.gmailComposeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#EA4335] hover:bg-[#d93025] text-white text-[11px] font-mono-tech font-bold transition-colors inline-flex items-center gap-1"
                          title="Open and send directly via Gmail"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Gmail</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedEmail(log)}
                        className="px-3 py-1 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-mono-tech font-bold transition-colors"
                      >
                        Inspect HTML
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-gray-400 font-mono-tech line-clamp-2 bg-slate-50 dark:bg-[#0D1527] p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                    {log.bodyText || 'HTML content available.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email Inspection Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-950 dark:text-white uppercase">
                  Transactional Email Inspector
                </h3>
                <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 mt-0.5">
                  ID: {selectedEmail.id} • Sent: {new Date(selectedEmail.sentAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* Modal Metadata */}
            <div className="p-4 bg-slate-50 dark:bg-[#0D1527] border-b border-slate-200 dark:border-white/5 font-mono-tech text-xs space-y-1.5">
              <div><strong>Recipient:</strong> {selectedEmail.recipientName} ({selectedEmail.recipientEmail})</div>
              {selectedEmail.fromEmail && <div><strong>From:</strong> {selectedEmail.fromName || 'NEXORA Desk'} ({selectedEmail.fromEmail})</div>}
              <div><strong>Subject:</strong> {selectedEmail.subject}</div>
              <div><strong>Category:</strong> {selectedEmail.type}</div>
            </div>

            {/* Email HTML Frame / Render */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950">
              <div 
                className="bg-white rounded-xl shadow p-2"
                dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedEmail.bodyHtml, 'html-copy')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white rounded-lg cursor-pointer"
                >
                  {copiedId === 'html-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'html-copy' ? 'Copied HTML!' : 'Copy Raw HTML'}</span>
                </button>

                {selectedEmail.gmailComposeUrl && (
                  <a
                    href={selectedEmail.gmailComposeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA4335] hover:bg-[#d93025] text-white rounded-lg font-bold shadow-sm"
                    title="Launch Gmail Composer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open &amp; Send in Gmail</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-lg font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent In-App Confirmation Modal for Message Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Customer Transmission"
        description="Are you sure you want to delete this customer message transmission? This record will be permanently removed."
        itemName={deleteTarget ? `${deleteTarget.senderName} — "${deleteTarget.subject}"` : undefined}
        itemBadge="Customer Inquiry"
        confirmText="Delete Message"
      />
    </div>
  );
};
