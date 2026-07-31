import React, { useState, useEffect } from 'react';
import { X, Mail, UserPlus, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from './toast';

export default function InviteMemberModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTeamData();
    }
  }, [isOpen]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/team/members');
      setMembers(res.data.members || []);
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/team/invite', { email: email.trim(), role });
      toast.add({ title: 'Invite Sent', description: `Invitation sent to ${email}`, type: 'success' });
      setEmail('');
      fetchTeamData();
    } catch (err) {
      toast.add({ title: 'Error', description: err.response?.data?.error || 'Failed to send invite', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (id) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/team/members/${id}`);
      toast.add({ title: 'Member Removed', description: 'Team member removed', type: 'success' });
      fetchTeamData();
    } catch (err) {
      toast.add({ title: 'Error', description: err.response?.data?.error || 'Failed to remove member', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus size={20} strokeWidth={2.25} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Team Management</h3>
              <p className="text-xs text-gray-400">Invite new members or manage team access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-5 border-b border-white/10 bg-white/[0.02]">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">Invite New Member</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com" 
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-sm outline-none cursor-pointer focus:ring-2 focus:ring-primary"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl font-medium bg-primary text-white text-sm hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </form>

        {/* Team Members List */}
        <div className="p-5 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Current Team ({members.length})</label>
          {loading ? (
            <div className="text-center py-6 text-xs text-gray-400">Loading members...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {m.name}
                        {m.role === 'Admin' && <ShieldCheck size={14} className="text-amber-400" />}
                      </span>
                      <span className="text-xs text-gray-400">{m.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {m.role}
                    </span>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      title="Remove member"
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {invites.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      <Mail size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{inv.email}</span>
                      <span className="text-xs text-amber-400/80">Pending Invitation</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {inv.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
