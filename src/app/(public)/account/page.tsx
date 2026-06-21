'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, ShoppingBag, MapPin, Phone, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, token, setAuth, logout } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token && parsed?.state?.user && !token) {
          setAuth(parsed.state.user, parsed.state.token);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (token && user) {
    const dashboardLinks = [
      { href: '/account/orders', icon: ShoppingBag, label: 'My Orders', desc: 'View and track your orders', color: 'bg-blue-50 text-blue-600' },
      { href: '/account/addresses', icon: MapPin, label: 'Address Book', desc: 'Manage your shipping addresses', color: 'bg-green-50 text-green-600' },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="container-main py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold">{user.name}</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => { logout(); setAuthToken(null); router.push('/'); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors sm:self-center">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="container-main py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {dashboardLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.color}`}>
                      <link.icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{link.label}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0">
                    <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { phone: form.phone, password: form.password } : { name: form.name, phone: form.phone, password: form.password };
      const res = await api.post(endpoint, payload);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      setAuthToken(accessToken);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <User size={24} className="text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Sign in to access your account' : 'Register for a new account'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required placeholder="John Doe" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="tel" placeholder="+880 1XXXXXXXXX" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 sm:py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 hover:shadow-lg hover:shadow-primary/25 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Please wait...
                </span>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                {isLogin ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
