
export interface Movie {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  duration: string;
  year: number;
  uploader: string;
  rating: number;
  fullMovieUrl: string;
  trailerUrl?: string; 
  cast: string[];// Optional URL for the movie trailer
}

export interface Comment {
  id: string;
  movieId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface User {
  name: string;
  email: string;
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
