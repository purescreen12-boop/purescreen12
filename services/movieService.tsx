
import { Movie, Comment } from '../types';
import { MOVIES as INITIAL_MOVIES } from '../data/mockData';

const MOVIES_KEY = 'gospelscreen_movies_db';
const COMMENTS_KEY = 'gospelscreen_comments_db';
const FOLDERS_KEY = 'gospelscreen_folders_db';

export const movieService = {
  getMovies: (): Movie[] => {
    const saved = localStorage.getItem(MOVIES_KEY);
    if (!saved) {
      localStorage.setItem(MOVIES_KEY, JSON.stringify(INITIAL_MOVIES));
      return INITIAL_MOVIES;
    }
    return JSON.parse(saved);
  },

  saveMovie: (movie: Movie): Movie[] => {
    const movies = movieService.getMovies();
    // Check if movie with same title already exists
    const existingIndex = movies.findIndex(m => m.title.toLowerCase() === movie.title.toLowerCase());
    if (existingIndex !== -1) {
      // Replace existing movie instead of adding duplicate
      movies[existingIndex] = movie;
    } else {
      // Add new movie at the front
      movies.unshift(movie);
    }
    localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
    // persist folder if provided
    if (movie.folder) {
      const folders = movieService.getFolders();
      if (!folders.includes(movie.folder)) {
        folders.unshift(movie.folder);
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
      }
    }
    return movies;
  },

  getFolders: (): string[] => {
    const saved = localStorage.getItem(FOLDERS_KEY);
    if (!saved) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(saved);
  },

  updateMovie: (movie: Movie): Movie[] => {
    const movies = movieService.getMovies();
    const updated = movies.map(m => m.id === movie.id ? movie : m);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteMovie: (movieId: string): Movie[] => {
    const movies = movieService.getMovies();
    const updated = movies.filter(m => m.id !== movieId);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updated));
    return updated;
  },

  getComments: (movieId: string): Comment[] => {
    const saved = localStorage.getItem(COMMENTS_KEY);
    if (!saved) return [];
    const allComments: Comment[] = JSON.parse(saved);
    return allComments.filter(c => c.movieId === movieId);
  },

  addComment: (comment: Comment): Comment[] => {
    const saved = localStorage.getItem(COMMENTS_KEY);
    const allComments: Comment[] = saved ? JSON.parse(saved) : [];
    const updated = [comment, ...allComments];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
    return updated.filter(c => c.movieId === comment.movieId);
  }
};
