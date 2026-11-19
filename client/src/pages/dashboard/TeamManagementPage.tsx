import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../features/store';
import { setActiveOrgId } from '../../features/authSlice';
import {
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetOrgQuery,
  useGetOrgsQuery,
} from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  UserPlus,
  Trash2,
  Shield,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  CheckCircle2,
  Search,
  Users,
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { activeOrgId, user: currentUser } = useSelector((state: RootState) => state.auth);

  const { data: orgsData } = useGetOrgsQuery();
  const orgs = orgsData?.data || [];
  const currentOrgFallback = orgs.find((o) => o.id === activeOrgId) || orgs[0];
  const effectiveOrgId = currentOrgFallback?.id || activeOrgId || '';

  useEffect(() => {
    if (currentOrgFallback && currentOrgFallback.id !== activeOrgId) {
      dispatch(setActiveOrgId(currentOrgFallback.id));
    }
  }, [currentOrgFallback, activeOrgId, dispatch]);

  const { data: orgData } = useGetOrgQuery(effectiveOrgId, { skip: !effectiveOrgId });
  const { data: membersData, isLoading } = useGetMembersQuery(effectiveOrgId, {
    skip: !effectiveOrgId,
  });

  const [inviteMemberTrigger, { isLoading: isInviting }] = useInviteMemberMutation();
  const [updateRoleTrigger] = useUpdateMemberRoleMutation();
  const [removeMemberTrigger] = useRemoveMemberMutation();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (isLoading || !membersData) {
    return <LoadingSpinner text="Loading team members..." />;
  }

  const members = membersData.data || [];
  const currentOrg = orgData?.data;
  const isOwner = currentOrg?.currentUserRole === 'owner';
  const isOwnerOrAdmin = isOwner || currentOrg?.currentUserRole === 'admin';

  const filteredMembers = members.filter((m) => {
    const name = m.user?.name || '';
    const email = m.user?.email || '';
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveOrgId || !inviteEmail.trim()) return;
    setFeedback(null);

    try {
      const res = await inviteMemberTrigger({
        orgId: effectiveOrgId,
        email: inviteEmail.trim(),
        role: inviteRole,
      }).unwrap();

      setFeedback({
        msg: res.message || `Invitation sent to ${inviteEmail}`,
        type: 'success',
      });
      setInviteEmail('');
      setIsInviteModalOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to send invitation. Check seat quota.',
        type: 'error',
      });
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'member') => {
    if (!effectiveOrgId) return;
    setFeedback(null);
    try {
      await updateRoleTrigger({
        orgId: effectiveOrgId,
        userId: targetUserId,
        role: newRole,
      }).unwrap();
      setFeedback({ msg: 'Member role updated successfully', type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to update member role.',
        type: 'error',
      });
    }
  };

  const handleRemove = async (targetUserId: string, name: string) => {
    if (!effectiveOrgId) return;
    if (!window.confirm(`Are you sure you want to remove ${name} from this organisation?`)) return;

    setFeedback(null);
    try {
      await removeMemberTrigger({
        orgId: effectiveOrgId,
        userId: targetUserId,
      }).unwrap();
      setFeedback({ msg: `Member removed from organisation`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        msg: err?.data?.message || 'Failed to remove member.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Team & Access Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage member invitations, assign RBAC permissions, and oversee team seat quotas.
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Members Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header with Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold text-slate-900">Active Members</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors placeholder:text-slate-400"
              />
            </div>
            <span className="hidden md:inline-block text-[11px] font-mono text-slate-400 whitespace-nowrap">
              Tier: {currentOrg?.plan?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Table of Members */}
        {filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Member</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Invited / Joined</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const displayName = m.user?.name || m.user?.email?.split('@')[0] || 'Invited User';
                  const displayEmail = m.user?.email || 'Pending Email';
                  const isItemOwner = m.role === 'owner';
                  const isSelf = m.user?.id === currentUser?.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-emerald-100">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 flex items-center space-x-1.5">
                              <span>{displayName}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">{displayEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isOwner && !isItemOwner ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              handleRoleChange(m.user?.id || m.id, e.target.value as 'admin' | 'member')
                            }
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <Badge
                            variant={
                              m.role === 'owner'
                                ? 'purple'
                                : m.role === 'admin'
                                ? 'primary'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {m.role === 'owner' && <Crown className="w-3 h-3 mr-1 inline" />}
                            {m.role.toUpperCase()}
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant={m.status === 'active' ? 'success' : 'warning'}
                          size="sm"
                          dot
                        >
                          {m.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                        {new Date(m.invitedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!isItemOwner && (isOwner || isSelf) && (
                          <button
                            onClick={() => handleRemove(m.user?.id || m.id, displayName)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title={isSelf ? 'Leave Organisation' : 'Remove Member'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No members match your search</p>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different name or email.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Clear search filter
            </button>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Generate an invitation link and assign role permissions."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Colleague's Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            >
              <option value="member">Member - Can execute pipelines and view usage</option>
              <option value="admin">Admin - Can manage members and configure settings</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm disabled:opacity-50 transition-all"
            >
              {isInviting ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
