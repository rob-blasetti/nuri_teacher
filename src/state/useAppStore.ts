import { create } from 'zustand';
import { AuthCommunity, AuthUser } from '../services/auth/types';

type AppState = {
  isBootstrapped: boolean;
  authToken?: string;
  authUser?: AuthUser;
  authCommunity?: AuthCommunity;
  setBootstrapped: (value: boolean) => void;
  setAuthSession: (input: { token: string; user: AuthUser; community?: AuthCommunity }) => void;
  clearAuthSession: () => void;
};

export const useAppStore = create<AppState>(set => ({
  isBootstrapped: false,
  setBootstrapped: value => set({ isBootstrapped: value }),
  setAuthSession: ({ token, user, community }) => set({ authToken: token, authUser: user, authCommunity: community }),
  clearAuthSession: () => set({ authToken: undefined, authUser: undefined, authCommunity: undefined }),
}));
