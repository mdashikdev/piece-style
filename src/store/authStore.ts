import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const createStorage = () => {
  if (typeof window !== 'undefined') {
    return createJSONStorage(() => localStorage);
  }
  return undefined;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('token', token);
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
    }),
    { name: 'auth-storage', storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined, skipHydration: true }
  )
);
