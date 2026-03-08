export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type SignInResponse = {
  token: string;
  user: AuthUser;
};
