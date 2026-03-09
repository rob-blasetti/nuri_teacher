import { AuthCommunity, AuthUser, SignInResponse } from './types';

const AUTH_LOGIN_URL = 'https://liquid-spirit-auth.vercel.app/api/auth/login';
const BACKEND_BASE_URL = 'https://liquid-spirit-backend-prod-34ac4484898d.herokuapp.com';
const AUTH_ME_URL = `${BACKEND_BASE_URL}/api/auth/me`;

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

type UserDetailsResponse = {
  message?: string;
  user?: Record<string, unknown>;
  data?: Record<string, unknown>;
  community?: Record<string, unknown>;
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

  return getAuthSessionForToken(token, {
    user: mapAuthUser(payload?.user, email),
  });
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

export async function getAuthSessionForToken(
  token: string,
  fallback?: Partial<Pick<SignInResponse, 'user' | 'community'>>,
): Promise<SignInResponse> {
  const fallbackUser = fallback?.user ?? mapAuthUser(undefined, 'teacher@nuri.local');
  const userDetails = await getUserDetails(token, fallbackUser, fallback?.community);

  return {
    token,
    user: userDetails.user,
    community: userDetails.community,
  };
}

async function getUserDetails(
  token: string,
  fallbackUser: AuthUser,
  fallbackCommunity?: AuthCommunity,
): Promise<Pick<SignInResponse, 'user' | 'community'>> {
  const response = await fetch(AUTH_ME_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await readJson(response)) as UserDetailsResponse | undefined;

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Unable to load your account details.';
    throw new Error(message);
  }

  const userSource = pickObject(payload?.user) ?? pickObject(payload?.data) ?? payload;
  const communitySource = pickObject(userSource?.community) ?? pickObject(payload?.community);

  return {
    user: mapAuthUser(userSource, fallbackUser.email, fallbackUser),
    community: mapAuthCommunity(communitySource) ?? fallbackCommunity,
  };
}

function mapAuthUser(source: unknown, fallbackEmail: string, fallbackUser?: AuthUser): AuthUser {
  const user = pickObject(source);
  const email = pickString(user?.email) ?? fallbackUser?.email ?? fallbackEmail;
  const derivedName = email.split('@')[0] ?? 'Teacher';

  return {
    id: pickString(user?.id) ?? fallbackUser?.id ?? email,
    name: pickString(user?.name) ?? pickString(user?.fullName) ?? fallbackUser?.name ?? derivedName,
    email,
  };
}

function mapAuthCommunity(source: unknown): AuthCommunity | undefined {
  const community = pickObject(source);
  if (!community) {
    return undefined;
  }

  const id = pickString(community.id) ?? pickString(community._id);
  const name = pickString(community.name) ?? pickString(community.title);

  if (!id && !name) {
    return undefined;
  }

  return {
    id: id ?? name ?? 'community',
    name: name ?? id ?? 'Community',
  };
}

function pickObject(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return undefined;
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
