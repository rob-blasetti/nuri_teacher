export type AuthCommunity = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  community?: AuthCommunity;
};

export type SignInResponse = {
  token: string;
  user: AuthUser;
  community?: AuthCommunity;
};
