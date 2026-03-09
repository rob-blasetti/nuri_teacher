export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthCommunity = {
  id: string;
  name: string;
};

export type SignInResponse = {
  token: string;
  user: AuthUser;
  community?: AuthCommunity;
};
