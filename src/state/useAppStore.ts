import { create } from 'zustand';

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AppState = {
  isBootstrapped: boolean;
  authToken?: string;
  authUser?: AuthUser;
  setBootstrapped: (value: boolean) => void;
  setAuthSession: (input: { token: string; user: AuthUser }) => void;
  clearAuthSession: () => void;
};

export const useAppStore = create<AppState>(set => ({
  isBootstrapped: false,
  setBootstrapped: value => set({ isBootstrapped: value }),
  setAuthSession: ({ token, user }) => set({ authToken: token, authUser: user }),
  clearAuthSession: () => set({ authToken: undefined, authUser: undefined }),
}));
