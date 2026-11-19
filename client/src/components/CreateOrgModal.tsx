import React, { useState } from 'react';
import { useCreateOrgMutation } from '../services/api';
import { Modal } from './Modal';
import { Building2, Sparkles, ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveOrgId } from '../features/authSlice';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orgId: string) => void;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createOrg, { isLoading }] = useCreateOrgMutation();
  const dispatch = useDispatch();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Organisation name is required.');
      return;
    }

    try {
      const res = await createOrg({ name: name.trim(), slug: slug.trim() }).unwrap();
      if (res.data) {
        dispatch(setActiveOrgId(res.data.id));
        if (onSuccess) onSuccess(res.data.id);
        setName('');
        setSlug('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to create organisation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Workspace"
      description="Create a new isolated tenant workspace for your engineering team and pipelines."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Organisation Name
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Acme Cloud Corp"
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Workspace URL Slug
          </label>
          <div className="flex items-center text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden px-3.5 py-2.5 font-mono">
            <span className="text-slate-400 select-none mr-1">deployflow.io/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="acme-cloud"
              className="bg-transparent text-slate-900 flex-1 focus:outline-none"
              required
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Unique slug used to enforce tenant data isolation across API requests.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            <span>{isLoading ? 'Creating Workspace...' : 'Create Organisation'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
