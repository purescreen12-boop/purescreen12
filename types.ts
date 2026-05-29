
export interface Movie {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  duration: string;
  year: number;
  uploader: string;
  uploaderEmail?: string;
  rating: number;
  ratingCount?: number; // Count of how many users have rated this movie
  fullMovieUrl?: string;
  trailerUrl?: string;
  hlsPlaybackUrl?: string; // HLS manifest URL for adaptive streaming
  hlsTrailerUrl?: string;  // HLS URL for trailer
  folder?: string;
  cast: string[];// Optional URL for the movie trailer
}

export interface Comment {
  id: string;
  movieId: string;
  userName: string;
  text: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface User {
  id?: number; // user_id from database
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // data URL or remote URL
  description?: string;
  profession?: string;
  country?: string;
  currency?: string;
  role?: 'user' | 'creator' | 'admin'; // user role from database
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  subscription_start: string;
  subscription_end: string;
  status: 'active' | 'cancelled' | 'expired';
  transaction_reference?: string;
  created_at: string;
  duration_days: number;
}

export enum Page {
  HOME = 'home',
  BROWSE = 'browse',
  PLAYER = 'player',
  AUTH = 'auth'
}

export interface AIInsight {
  theme: string;
  scriptureReference: string;
  reflection: string;
}
