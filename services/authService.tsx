
import { User } from '../types';

declare const atob: (str: string) => string;

interface AuthService {
  register: (userData: { name: string; email: string; password: string; phone?: string; avatar?: string; description?: string; profession?: string }) => Promise<User>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  getCurrentUser: () => User | null;
  setCurrentUser: (user: User) => void;
  getProfiles: () => Promise<User[]>;
  loadUserFromDB: () => Promise<User | null>;
  googleSignInWithCredential: (credential: string) => Promise<User>;
  updateUser: (updated: User & { password?: string }, originalEmail?: string) => Promise<User>;
  getSavedMovies: (userEmail: string) => string[];
  saveMovie: (userEmail: string, movieId: string) => string[];
  unsaveMovie: (userEmail: string, movieId: string) => string[];
  isMovieSaved: (userEmail: string, movieId: string) => boolean;
  getUserRating: (userEmail: string, movieId: string) => number;
  setUserRating: (userEmail: string, movieId: string, rating: number) => void;
  normalizeAvatar: (avatar?: string | null) => string | undefined;
}

const USERS_KEY = 'gospelscreen_users_db';
const SAVED_MOVIES_KEY = 'gospelscreen_saved_movies_db';
const USER_RATINGS_KEY = 'gospelscreen_user_ratings_db';
const CURRENT_USER_EMAIL_KEY = 'gospelscreen_current_user_email';
const DEVICE_PROFILES_KEY = 'gospelscreen_device_profiles';

// Persist current user email in localStorage, fetch user data from DB
let _currentUser: User | null = null;

export const authService: AuthService = {
  // Register with backend
  register: async (userData: { name: string; email: string; password: string; phone?: string; avatar?: string; description?: string; profession?: string }): Promise<User> => {
    const response = await fetch('http://localhost:8081/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    const user: User = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      avatar: userData.avatar,
      description: userData.description,
      profession: userData.profession,
    };
    _currentUser = user;
    // Save profile to device storage for "Who is watching?" page
    authService.saveProfileToDevice(user);
    return user;
  },

  // Normalize avatar value (file path, data URL, or remote URL)
  // returns undefined when no avatar
  normalizeAvatar: (avatar?: string | null): string | undefined => {
    if (!avatar) return undefined;
    return avatar; // return as-is (file path, data URL, or remote URL)
  },

  // Login with backend
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await fetch('http://localhost:8081/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    // backend may return either the user directly or an object { user, token }
    const payload = data.user || data;

    const user: User = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      avatar: authService.normalizeAvatar(payload.avatar),
      description: payload.description,
      profession: payload.profession,
      country: payload.country,
      currency: payload.currency,
      role: payload.role,
    };

    // keep current user in memory
    _currentUser = user;

    // Save profile to device storage for "Who is watching?" page
    authService.saveProfileToDevice(user);

    return user;
  },

  logout: () => {
    _currentUser = null;
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  },

  getCurrentUser: (): User | null => {
    return _currentUser;
  },

  setCurrentUser: (user: User) => {
    _currentUser = user;
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, user.email);
    // Save profile to device storage for "Who is watching?" page
    authService.saveProfileToDevice(user);
  },

  getProfiles: (): User[] => {
    // Return profiles stored on this device only
    const stored = localStorage.getItem(DEVICE_PROFILES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveProfileToDevice: (user: User) => {
    const existingProfiles = authService.getProfiles();
    const updatedProfiles = existingProfiles.filter(p => p.email !== user.email);

    // Handle avatar URL properly
    let avatarUrl = user.avatar;
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
      // If it's a relative path, prefix with backend URL
      avatarUrl = `http://localhost:8081/${avatarUrl}`;
    }

    updatedProfiles.push({
      name: user.name,
      email: user.email,
      avatar: avatarUrl
    });
    localStorage.setItem(DEVICE_PROFILES_KEY, JSON.stringify(updatedProfiles));
  },

  // Load user from database using email
  loadUserFromDB: async (): Promise<User | null> => {
    const email = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    if (!email) return null;
    try {
      const response = await fetch(`http://localhost:8081/api/user/${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const user = await response.json();
      if (user.error) throw new Error(user.error);
      _currentUser = user;
      return user;
    } catch (e) {
      console.error('Error loading user from DB:', e);
      localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
      return null;
    }
  },

  // Accept a Google credential JWT (from @react-oauth/google) and sign in or create user
  googleSignInWithCredential: async (credential: string): Promise<User> => {
    const parts = credential.split('.');
    if (parts.length < 2) throw new Error('Invalid credential');
    const payload = JSON.parse(atob(parts[1]));
    const email = payload.email;
    const name = payload.name || payload.given_name || email.split('@')[0];
    const avatar = payload.picture;

    // Call backend Google sign-in endpoint to handle registration/login
    try {
      const googleLoginResponse = await fetch('http://localhost:8081/api/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, avatar }),
      });
      const googleLoginData = await googleLoginResponse.json();
      
      if (googleLoginData.error) {
        throw new Error(googleLoginData.error);
      }

      const userPayload = googleLoginData.user || googleLoginData;
      const user: User = {
        name: userPayload.name,
        email: userPayload.email,
        phone: userPayload.phone,
        avatar: authService.normalizeAvatar(userPayload.avatar || avatar),
        description: userPayload.description,
        profession: userPayload.profession,
      };

      _currentUser = user;
      // Save profile to device storage for "Who is watching?" page
      authService.saveProfileToDevice(user);
      return user;
    } catch (e) {
      console.error('Google sign-in error:', e);
      // Fallback: Try to register then login (for backward compatibility)
      try {
        await fetch('http://localhost:8081/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: '', avatar }),
        });
      } catch (regErr) {
        console.log('User may already exist, attempting login');
      }

      // Login with empty password
      const loginResponse = await fetch('http://localhost:8081/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: '' }),
      });
      const loginData = await loginResponse.json();
      if (loginData.error) {
        throw new Error(loginData.error);
      }

      const userPayload = loginData.user || loginData;
      const user: User = {
        name: userPayload.name,
        email: userPayload.email,
        phone: userPayload.phone,
        avatar: authService.normalizeAvatar(userPayload.avatar || avatar),
        description: userPayload.description,
        profession: userPayload.profession,
      };

      _currentUser = user;
      // Save profile to device storage for "Who is watching?" page
      authService.saveProfileToDevice(user);
      return user;
    }
  },

  // Update existing user details
  updateUser: async (updated: User & { password?: string }, originalEmail?: string): Promise<User> => {
    const body = { ...updated, originalEmail };
    if (!updated.password || !updated.password.trim()) {
      delete body.password;
    }
    const response = await fetch('http://localhost:8081/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: authService.normalizeAvatar(data.avatar),
      description: data.description,
      profession: data.profession,
    };
  },

  // Saved movies functionality
  getSavedMovies: (userEmail: string): string[] => {
    const saved = localStorage.getItem(SAVED_MOVIES_KEY);
    const allSaved = saved ? JSON.parse(saved) : {};
    return allSaved[userEmail] || [];
  },

  saveMovie: (userEmail: string, movieId: string): string[] => {
    const saved = localStorage.getItem(SAVED_MOVIES_KEY);
    const allSaved = saved ? JSON.parse(saved) : {};
    if (!allSaved[userEmail]) {
      allSaved[userEmail] = [];
    }
    if (!allSaved[userEmail].includes(movieId)) {
      allSaved[userEmail].push(movieId);
    }
    localStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(allSaved));
    return allSaved[userEmail];
  },

  unsaveMovie: (userEmail: string, movieId: string): string[] => {
    const saved = localStorage.getItem(SAVED_MOVIES_KEY);
    const allSaved = saved ? JSON.parse(saved) : {};
    if (allSaved[userEmail]) {
      allSaved[userEmail] = allSaved[userEmail].filter((id: string) => id !== movieId);
    }
    localStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(allSaved));
    return allSaved[userEmail];
  },

  isMovieSaved: (userEmail: string, movieId: string): boolean => {
    const savedMovies = authService.getSavedMovies(userEmail);
    return savedMovies.includes(movieId);
  },

  // User ratings functionality
  getUserRating: (userEmail: string, movieId: string): number => {
    const saved = localStorage.getItem(USER_RATINGS_KEY);
    const allRatings = saved ? JSON.parse(saved) : {};
    return allRatings[userEmail]?.[movieId] || 0;
  },

  setUserRating: (userEmail: string, movieId: string, rating: number): void => {
    const saved = localStorage.getItem(USER_RATINGS_KEY);
    const allRatings = saved ? JSON.parse(saved) : {};
    if (!allRatings[userEmail]) {
      allRatings[userEmail] = {};
    }
    allRatings[userEmail][movieId] = rating;
    localStorage.setItem(USER_RATINGS_KEY, JSON.stringify(allRatings));
  }
};
