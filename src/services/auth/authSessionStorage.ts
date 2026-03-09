import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { SignInResponse } from './types';

const AUTH_SESSION_SERVICE = 'nuri-teacher-auth-session';
const AUTH_SESSION_USERNAME = 'auth-session';

function shouldProtectWithBiometrics(session: SignInResponse): boolean {
  return session.token !== 'guest-session';
}

function getBiometricSaveOptions() {
  if (Platform.OS !== 'ios') {
    return {};
  }

  return {
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
  };
}

function getReadOptions() {
  if (Platform.OS !== 'ios') {
    return {
      service: AUTH_SESSION_SERVICE,
    };
  }

  return {
    service: AUTH_SESSION_SERVICE,
    authenticationPrompt: {
      title: 'Unlock Nuri Teacher',
      subtitle: 'Use Face ID to restore your session',
      description: 'Authenticate to continue to your children’s classes.',
      cancel: 'Cancel',
    },
  };
}

export async function saveStoredAuthSession(session: SignInResponse): Promise<void> {
  await Keychain.setGenericPassword(AUTH_SESSION_USERNAME, JSON.stringify(session), {
    service: AUTH_SESSION_SERVICE,
    ...(shouldProtectWithBiometrics(session) ? getBiometricSaveOptions() : {}),
  });
}

export async function readStoredAuthSession(): Promise<SignInResponse | undefined> {
  const credentials = await Keychain.getGenericPassword(getReadOptions());

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
