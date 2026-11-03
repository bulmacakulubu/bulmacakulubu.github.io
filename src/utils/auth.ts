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

export const GOOGLE_AUTH_CONFIG = {
  // Google Cloud Console Web Client ID
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '892768491664-3elskl9kv3483ggbmfjkkp5fdm4nd8ph.apps.googleusercontent.com',
};

export function loginWithGoogleCredential(credential: string): UserProfile | null {
  const payload = parseJwt(credential);
  if (!payload) return null;
  const name = payload.name || payload.given_name || payload.email?.split('@')[0] || 'Google Oyuncusu';
  const email = payload.email || '';
  const avatar = payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb`;
  
  const profile: UserProfile = {
    id: payload.sub ? `g_${payload.sub}` : 'g_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    avatar,
    provider: 'google',
    createdAt: new Date().toISOString(),
    rating: 1250,
  };
  saveUserProfile(profile);
  return profile;
}

export function signOutUser(email?: string): UserProfile {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  // Google Identity Services oturumunu tamamen kapatma ve otomatik hatırlamayı iptal etme
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    try {
      (window as any).google.accounts.id.disableAutoSelect();
      if (email) {
        (window as any).google.accounts.id.revoke(email, (done: any) => {
          console.log('Google hesap yetkisi sıfırlandı:', done);
        });
      }
    } catch (e) {
      console.warn('Google sign out error:', e);
    }
  }

  return DEFAULT_GUEST;
}

