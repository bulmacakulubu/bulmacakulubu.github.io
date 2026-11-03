import { UserProfile } from '../types';

const STORAGE_KEY = 'bulmaca_user_profile';

const DEFAULT_GUEST: UserProfile = {
  id: 'guest_local',
  name: 'Misafir Oyuncu',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  provider: 'guest',
  createdAt: new Date().toISOString(),
  rating: 1200,
};

// Simple base64url JWT payload decoder for Google ID tokens
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_GUEST;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loginWithGoogleData(userData: { name: string; email: string; avatar?: string }): UserProfile {
  const profile: UserProfile = {
    id: 'g_' + Math.random().toString(36).substring(2, 9),
    name: userData.name,
    email: userData.email,
    avatar:
      userData.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}&backgroundColor=2563eb`,
    provider: 'google',
    createdAt: new Date().toISOString(),
    rating: 1250,
  };
  saveUserProfile(profile);
  return profile;
}

export function signOutUser(): UserProfile {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_GUEST;
}

