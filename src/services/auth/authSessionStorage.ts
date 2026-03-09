import * as Keychain from 'react-native-keychain';
import { SignInResponse } from './types';

const AUTH_SESSION_SERVICE = 'nuri-teacher-auth-session';
const AUTH_SESSION_USERNAME = 'auth-session';

export async function saveStoredAuthSession(session: SignInResponse): Promise<void> {
  await Keychain.setGenericPassword(AUTH_SESSION_USERNAME, JSON.stringify(session), {
    service: AUTH_SESSION_SERVICE,
  });
}

export async function readStoredAuthSession(): Promise<SignInResponse | undefined> {
  const credentials = await Keychain.getGenericPassword({
    service: AUTH_SESSION_SERVICE,
  });

  if (!credentials) {
    return undefined;
  }

  try {
    return JSON.parse(credentials.password) as SignInResponse;
  } catch {
    await clearStoredAuthSession();
    return undefined;
  }
}

export async function clearStoredAuthSession(): Promise<void> {
  await Keychain.resetGenericPassword({
    service: AUTH_SESSION_SERVICE,
  });
}
