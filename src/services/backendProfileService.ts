import { getJson } from './apiClient';
import { AuthCommunity, AuthUser } from './auth/types';

type BackendMeResponse = {
  id?: string;
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  community?: {
    _id?: string;
    id?: string;
    name?: string;
    title?: string;
  };
};

export async function getBackendProfile(token: string): Promise<{ user: AuthUser; community?: AuthCommunity }> {
  const payload = await getJson<BackendMeResponse>('/api/auth/me', token);
  const community = mapCommunity(payload.community);
  const email = payload.email ?? 'teacher@nuri.local';
  const name =
    [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() ||
    payload.name ||
    payload.fullName ||
    email.split('@')[0] ||
    'Teacher';

  return {
    user: {
      id: payload.id ?? payload._id ?? email,
      name,
      email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      community,
    },
    community,
  };
}

function mapCommunity(source?: { _id?: string; id?: string; name?: string; title?: string }): AuthCommunity | undefined {
  if (!source) {
    return undefined;
  }

  const id = source._id ?? source.id;
  const name = source.name ?? source.title;
  if (!id && !name) {
    return undefined;
  }

  return {
    id: id ?? name ?? 'community',
    name: name ?? id ?? 'Community',
  };
}
