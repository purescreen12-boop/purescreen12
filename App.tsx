import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { X } from 'lucide-react';

import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import FloatingInstallAlert from './components/FloatingInstallAlert';
const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const Player = lazy(() => import('./pages/Player'));
const Profile = lazy(() => import('./pages/Profile'));
const MyVideo = lazy(() => import('./pages/myvideo'));
const Auth = lazy(() => import('./pages/Auth'));
const Upload = lazy(() => import('./pages/Upload'));
const Membership = lazy(() => import('./pages/Membership'));
const ChoosePath = lazy(() => import('./pages/ChoosePath'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OptInput = lazy(() => import('./pages/OptInput'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const WhoIsWatching = lazy(() => import('./pages/WhoIsWatching'));

import { Movie, User } from './types';
import { authService } from './services/authService';
import { movieService } from './services/movieService';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Initialize App State
  useEffect(() => {
    const initializeApp = async () => {
      // Restore user session if they were previously logged in
      let restoredUser = authService.getCurrentUser();
      
      // If no in-memory user but email is saved, fetch full user data from backend
      if (!restoredUser) {
        restoredUser = await authService.loadUserFromDB();
      }
      
      if (restoredUser) {
        setUser(restoredUser);
      }

      // Fetch movies from backend
      try {
        const res = await fetch('http://localhost:8081/api/list-films');
        const data = await res.json();
        setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        setMovies([]);
      }

      // Simulate loading time for preloader
      setTimeout(() => setIsLoading(false), 3000);
    };

    initializeApp();
  }, []);

  const handleMovieSelect = (movie: Movie) => {
    if (!user) {
      setSelectedMovie(movie);
      setShowPopup(true);
    } else {
      navigate(`/watch/${movie.id}`);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    authService.setCurrentUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  // Update document title based on user's country
  useEffect(() => {
    if (user?.country) {
      document.title = `PureScreen ${user.country} - Watch Inspiring Content & films`;
    } else {
      document.title = 'PureScreen- Watch Inspiring Content & films';
    }
  }, [user?.country]);

  const handleUpload = async (newMovie: Movie) => {
    // Update UI immediately with the newly uploaded movie, ensuring no duplicate IDs
    setMovies(prev => {
      const filtered = prev.filter(m => m.id !== newMovie.id);
      return [newMovie, ...filtered];
    });

    // Also refresh from backend to keep in sync with DB
    try {
      const res = await fetch('http://localhost:8081/api/list-films');
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      // fallback: keep current list
    }
    navigate('/browse');
  };

  const handleDeleteMovie = async (movie: Movie) => {
    try {
      // Delete movie from S3 and database using the new endpoint
      const response = await fetch(`http://localhost:8081/api/delete-movie/${movie.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting movie:', errorData);
        throw new Error(errorData.error || 'Failed to delete movie');
      }

      const result = await response.json();
      console.log('Movie deleted successfully:', result);

      // Update local state by removing the movie
      setMovies(prev => prev.filter(m => m.id.toString() !== movie.id.toString()));
      movieService.deleteMovie(movie.id);

    } catch (error) {
      console.error('Error in handleDeleteMovie:', error);
      // Still update local state even if server deletion failed
      setMovies(prev => prev.filter(m => m.id.toString() !== movie.id.toString()));
      movieService.deleteMovie(movie.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#d4af37] selection:text-black">
      {isLoading ? (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <FloatingInstallAlert />
          {!(location.pathname === '/' && !user) && <Navbar user={user} onLogout={handleLogout} />}
          
          <main className="pb-20">
            <Suspense fallback={<div className="pt-20 text-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={user ? <Home movies={movies} onMovieSelect={handleMovieSelect} user={user} /> : <WhoIsWatching onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/browse" element={<Browse movies={movies} onMovieSelect={handleMovieSelect} />} />
                <Route path="/watch/:id" element={<Player movies={movies} onDeleteMovie={handleDeleteMovie} />} />
                <Route path="/profile/:email?" element={<Profile />} />
                <Route path="/myvideo" element={<MyVideo />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/auth" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/member-dashboard" element={<MemberDashboard />} />
                <Route path="/choose-path" element={<ChoosePath />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/otp" element={<OptInput />} />
                <Route path="/upload" element={<Upload user={user} onUpload={handleUpload} />} />
                <Route path="/creator-dashboard" element={<CreatorDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>

       {/*   <CookieConsent /> */}

          {/* Get Started Popup */}
          {showPopup && selectedMovie && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
                <div className="text-center">
                  <img
                    src={selectedMovie.thumbnail}
                    alt={selectedMovie.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-xl font-bold mb-2">Get Started with PureScreen</h2>
                  <p className="text-gray-300 mb-6">
                    Create an account to watch "{selectedMovie.title}" and enjoy unlimited access to faith-based content.
                  </p>
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      navigate('/auth?signup=true');
                    }}
                    className="w-full bg-[#d4af37] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#d4af37]/80 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
       </div>
  );
};

export default App;
