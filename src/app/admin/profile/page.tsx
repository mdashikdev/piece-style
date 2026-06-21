'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi as api } from '@/lib/adminApi';
import { useAdminAuth } from '@/store/adminAuth';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function AdminProfilePage() {
  const { user, setAuth } = useAdminAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data } = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => api.get('/admin/profile').then(r => r.data.data),
  });

  useEffect(() => {
    if (data) {
      setName((data as any).name || '');
      setEmail((data as any).email || '');
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.put('/admin/profile', payload),
    onSuccess: (res) => {
      const updated = res.data.data;
      setAuth(updated, localStorage.getItem('admin_token') || '');
      localStorage.setItem('admin_user', JSON.stringify(updated));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      toast.success('Profile updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const current = data as any || {};
    const payload: any = {};
    if (name && name !== current.name) payload.name = name;
    if (email && email !== current.email) payload.email = email;
    if (newPassword) {
      if (!currentPassword) return toast.error('Current password is required');
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }
    if (Object.keys(payload).length === 0) return toast.error('No changes to save');
    updateMutation.mutate(payload);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-lg font-bold text-white">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">{user?.name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <hr className="border-gray-200" />
          <p className="text-xs font-medium text-gray-500">Change Password (optional)</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
