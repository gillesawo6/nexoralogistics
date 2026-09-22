import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key, 
  User, 
  Mail, 
  Clock, 
  Lock, 
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthorizedUserRecord, ROOT_ADMIN_EMAIL } from '../../services/firebase';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

export const UsersAdminPage: React.FC = () => {
  const toast = useToast();
  const { 
    user, 
    authorization, 
    getAuthorizedUsers, 
    addAuthorizedUser, 
    deleteAuthorizedUser, 
    toggleAuthorization 
  } = useAuth();

  const [users, setUsers] = useState<AuthorizedUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'authorized' | 'unauthorized'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthorizedUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State for Add / Edit User
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthorizedUserRecord | null>(null);
  const [formUid, setFormUid] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDepartment, setFormDepartment] = useState('Operations Dispatch');
  const [formRole, setFormRole] = useState<'admin' | 'operations_manager' | 'dispatcher' | 'analyst' | 'operator' | 'user'>('operator');
  const [formAuthorized, setFormAuthorized] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAuthorizedUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load authorized users:', err);
      toast.error('Failed to load authorized users from database.', 'Database Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    toast.info('Copied UID: ' + uid, 'Copied');
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormUid('');
    setFormEmail('');
    setFormDisplayName('');
    setFormDepartment('Operations Dispatch');
    setFormRole('operator');
    setFormAuthorized(true);
    setFormNotes('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (target: AuthorizedUserRecord) => {
    setEditingUser(target);
    setFormUid(target.uid);
    setFormEmail(target.email);
    setFormDisplayName(target.displayName || '');
    setFormDepartment(target.department || 'Operations Dispatch');
    setFormRole(target.role || 'operator');
    setFormAuthorized(target.authorized);
    setFormNotes(target.notes || '');
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) {
      toast.warning('User email address is required.', 'Missing Email');
      return;
    }

    const trimmedEmail = formEmail.trim().toLowerCase();
    const finalUid = formUid.trim() || `auth_user_${Date.now()}`;
    const now = new Date().toISOString();

    setSaving(true);
    try {
      const record: AuthorizedUserRecord = {
        uid: finalUid,
        email: trimmedEmail,
        authorized: formAuthorized,
        role: formRole,
        displayName: formDisplayName.trim() || trimmedEmail.split('@')[0],
        department: formDepartment.trim(),
        notes: formNotes.trim(),
        createdAt: editingUser?.createdAt || now,
        updatedAt: now,
        approvedAt: formAuthorized ? (editingUser?.approvedAt || now) : undefined,
        approvedBy: user?.email || 'Administrator',
      };

      await addAuthorizedUser(record);
      toast.success(editingUser ? `User ${trimmedEmail} updated successfully.` : `User ${trimmedEmail} authorized and recorded.`, 'User Saved');
      setModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to save user:', err);
      toast.error(err.message || 'Error saving user authorization.', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAuth = async (target: AuthorizedUserRecord) => {
    if (target.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      toast.error('The Master Root Administrator cannot be revoked.', 'Protected Account');
      return;
    }

    const nextState = !target.authorized;
    try {
      await toggleAuthorization(target.uid, nextState);
      setUsers(prev => prev.map(u => u.uid === target.uid ? { ...u, authorized: nextState } : u));
      toast.success(`Access for ${target.email} set to ${nextState ? 'AUTHORIZED' : 'REVOKED'}.`, 'Status Updated');
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      toast.error(err.message || 'Failed to update authorization status.', 'Update Error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      toast.error('The Master Root Administrator cannot be removed.', 'Protected Account');
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAuthorizedUser(deleteTarget.uid);
      setUsers(prev => prev.filter(u => u.uid !== deleteTarget.uid));
      toast.success(`Authorization record for ${deleteTarget.email} removed.`, 'User Removed');
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Failed to remove authorization record.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'authorized' ? u.authorized === true :
      u.authorized === false;

    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalCount = users.length;
  const authorizedCount = users.filter(u => u.authorized).length;
  const unauthorizedCount = users.filter(u => !u.authorized).length;
  const adminCount = users.filter(u => u.role === 'admin' && u.authorized).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>CLOSED ACCESS SYSTEM &amp; RBAC</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Authorized Users Allowlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-sans mt-1">
            Explicit whitelist enforcement. Only pre-approved accounts can access the application after Firebase authentication.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Allowlist"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0066FF]' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0066FF]/25 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Authorize New User</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Info Callout */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#0066FF]/10 border border-blue-200 dark:border-[#0066FF]/20 flex items-start gap-3 text-xs font-mono-tech">
        <Info className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-950 dark:text-white font-bold">Closed Security Policy Active:</strong> Public registration is permanently disabled. Even if a user successfully passes Google SSO or Firebase Auth, they are rejected with <span className="text-rose-600 dark:text-rose-400 font-bold">Unauthorized Access</span> unless their Firebase UID or email is explicitly present and <span className="text-emerald-600 dark:text-emerald-400 font-bold">authorized: true</span> in this allowlist.
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase font-bold">
            Total Allowlist
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] font-mono-tech text-slate-400 mt-1">
            Pre-registered identities
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs font-mono-tech text-emerald-600 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Active</span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {authorizedCount}
          </div>
          <div className="text-[11px] font-mono-tech text-slate-400 mt-1">
            Granted full application access
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs font-mono-tech text-rose-500 uppercase font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Revoked / Blocked</span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-rose-500 mt-1">
            {unauthorizedCount}
          </div>
          <div className="text-[11px] font-mono-tech text-slate-400 mt-1">
            Immediate access denied
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Admin Clearance</span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#0066FF] dark:text-[#38bdf8] mt-1">
            {adminCount}
          </div>
          <div className="text-[11px] font-mono-tech text-slate-400 mt-1">
            Level 4 system controllers
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY EMAIL, UID, OPERATOR NAME, OR DEPARTMENT..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF] uppercase tracking-wider"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">Status: All Records</option>
            <option value="authorized">Status: Authorized Only</option>
            <option value="unauthorized">Status: Revoked / Inactive</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">Role: All Roles</option>
            <option value="admin">Admin</option>
            <option value="operations_manager">Operations Manager</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="analyst">Analyst</option>
            <option value="operator">Operator</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 font-mono-tech text-xs">
            <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
            <span>QUERYING FIRESTORE AUTHORIZATION STORE...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono-tech text-xs space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-bold uppercase">No matching authorized users found</p>
            <p className="text-slate-500">Click &quot;Authorize New User&quot; above to pre-approve an operator account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="py-3.5 px-4">Operator / Identity</th>
                  <th className="py-3.5 px-4">Firebase UID</th>
                  <th className="py-3.5 px-4">Role &amp; Clearance</th>
                  <th className="py-3.5 px-4">Authorization State</th>
                  <th className="py-3.5 px-4">Approved Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredUsers.map((u) => {
                  const isRoot = u.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#38bdf8] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 shadow-xs">
                            {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.displayName || u.email.split('@')[0]}</span>
                              {isRoot && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                                  MASTER
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-gray-400 text-[11px]">
                              {u.email}
                            </div>
                            {u.department && (
                              <div className="text-[10px] text-slate-400 dark:text-gray-500">
                                {u.department}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* UID */}
                      <td className="py-3.5 px-4 font-mono-tech text-[11px] text-slate-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px] font-semibold" title={u.uid}>
                            {u.uid}
                          </span>
                          <button
                            onClick={() => handleCopyUid(u.uid)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy UID"
                          >
                            {copiedUid === u.uid ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0066FF] dark:text-[#38bdf8] border-blue-200 dark:border-blue-800'
                            : u.role === 'operations_manager'
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status & Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleAuth(u)}
                          disabled={isRoot}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            u.authorized
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          } ${isRoot ? 'opacity-80 cursor-not-allowed' : ''}`}
                          title={isRoot ? 'Master Root Account cannot be revoked' : 'Click to Toggle Status'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.authorized ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{u.authorized ? 'Authorized' : 'Revoked'}</span>
                        </button>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-gray-400 text-[11px]">
                        <div>{u.approvedAt ? u.approvedAt.slice(0, 10) : u.createdAt.slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-gray-500">
                          By: {u.approvedBy || 'Admin'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit Role & Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {!isRoot && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0066FF]" />
                  <h3 className="font-heading font-bold text-lg uppercase">
                    {editingUser ? 'Edit Authorization Record' : 'Authorize New Operator'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="operator@company.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <p className="text-[10px] font-mono-tech text-slate-400 mt-1">
                    Matching email used during Google SSO or Firebase login.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Firebase UID (Optional for pre-approval)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formUid}
                      onChange={(e) => setFormUid(e.target.value)}
                      placeholder="e.g. abc123xyz (Auto-bound upon first login if blank)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      placeholder="Operations Dispatch"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Role &amp; Permissions
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    >
                      <option value="admin">Admin (Level 4)</option>
                      <option value="operations_manager">Operations Manager</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="analyst">Analyst</option>
                      <option value="operator">Operator</option>
                      <option value="user">User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                      Authorization Status
                    </label>
                    <select
                      value={formAuthorized ? 'true' : 'false'}
                      onChange={(e) => setFormAuthorized(e.target.value === 'true')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                    >
                      <option value="true">Authorized (Access Granted)</option>
                      <option value="false">Revoked / Pending Approval</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1">
                    Administrative Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Reason for clearance, authorized by board, internal ticket ID, etc."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-mono-tech text-slate-700 dark:text-gray-300 uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{editingUser ? 'Update Record' : 'Authorize User'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent In-App Confirmation Modal for User Authorization Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Remove Operator Authorization"
        description="Are you sure you want to permanently revoke and remove this authorized operator account? They will lose access to the administrative control systems."
        itemName={deleteTarget ? `${deleteTarget.displayName || deleteTarget.email.split('@')[0]} (${deleteTarget.email})` : undefined}
        itemBadge="Operator Authorization"
        confirmText="Remove Operator"
      />
    </div>
  );
};

export default UsersAdminPage;
