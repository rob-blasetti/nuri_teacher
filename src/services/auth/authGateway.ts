import { SignInResponse } from './types';

const AUTH_LOGIN_URL = 'https://liquid-spirit-auth.vercel.app/api/auth/login';

type GatewayResponse = {
  message?: string;
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
};

export async function signInWithAuthGateway(email: string, password: string): Promise<SignInResponse> {
  const response = await fetch(AUTH_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await readJson(response)) as GatewayResponse | undefined;

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Unable to sign in.';
    throw new Error(message);
  }

  const token = payload?.token ?? payload?.accessToken ?? payload?.jwt;
  if (!token) {
    throw new Error('Auth gateway response did not include a token.');
  }

  const user = payload?.user;
  return {
    token,
    user: {
      id: user?.id ?? email,
      name: user?.name ?? user?.fullName ?? email.split('@')[0] ?? 'Teacher',
      email: user?.email ?? email,
    },
  };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
