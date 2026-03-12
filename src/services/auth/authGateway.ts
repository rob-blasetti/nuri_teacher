import { AuthCommunity, AuthUser, SignInResponse } from './types';
import { getBackendProfile } from '../backendProfileService';

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
    firstName?: string;
    lastName?: string;
    email?: string;
    community?: {
      _id?: string;
      id?: string;
      name?: string;
    };
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

  return getAuthSessionForToken(token, {
    user: mapFallbackUser(payload?.user, email),
    community: mapFallbackCommunity(payload?.user?.community),
  });
}

export async function getAuthSessionForToken(
  token: string,
  fallback?: Partial<Pick<SignInResponse, 'user' | 'community'>>,
): Promise<SignInResponse> {
  const profile = await getBackendProfile(token).catch(() => undefined);
  if (profile) {
    return {
      token,
      user: profile.user,
      community: profile.community,
    };
  }

  return {
    token,
    user: fallback?.user ?? mapFallbackUser(undefined, 'teacher@nuri.local'),
    community: fallback?.community,
  };
}

function mapFallbackUser(source: GatewayResponse['user'] | undefined, fallbackEmail: string): AuthUser {
  const email = source?.email ?? fallbackEmail;
  const name =
    [source?.firstName, source?.lastName].filter(Boolean).join(' ').trim() ||
    source?.name ||
    source?.fullName ||
    email.split('@')[0] ||
    'Teacher';

  return {
    id: source?.id ?? email,
    name,
    email,
    firstName: source?.firstName,
    lastName: source?.lastName,
    community: mapFallbackCommunity(source?.community),
  };
}

function mapFallbackCommunity(source?: { _id?: string; id?: string; name?: string }): AuthCommunity | undefined {
  if (!source) {
    return undefined;
  }

  const id = source._id ?? source.id;
  if (!id && !source.name) {
    return undefined;
  }

  return {
    id: id ?? source.name ?? 'community',
    name: source.name ?? id ?? 'Community',
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
