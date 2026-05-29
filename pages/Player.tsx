import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import HLS from 'hls.js';
import { Play, Pause, Maximize2, Calendar, Star, Share2, MessageSquare, Send, User, Clapperboard, Info, Eye, X, Camera, Trash2, AlertCircle, Loader } from 'lucide-react';
import whatsappIcon from '../icons/whatapp.jpg';
import gmailIcon from '../icons/gmail.jpg';
import twitterIcon from '../icons/twitter.jpg';
import instagramIcon from '../icons/Instagram.jpg';
import facebookIcon from '../icons/facebook.jpg';
import { Movie, Comment } from '../types';
import { movieService } from '../services/movieService';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

const VIEWS_KEY = 'gospelscreen_views_db';

interface PlayerProps {
  movies: Movie[];
  onDeleteMovie?: (movie: Movie) => void;
}

const Player: React.FC<PlayerProps> = ({ movies, onDeleteMovie }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie, ] = useState<Movie | null>(null);
  const [comments, setComments, ] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [views, setViews] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [hasUserViewed, setHasUserViewed] = useState(false);
  const [viewTimer, setViewTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekHoverPercent, setSeekHoverPercent] = useState<number | null>(null);
  const [seekHoverTime, setSeekHoverTime] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hlsRef = useRef<HLS | null>(null);
  const mountedRef = useRef(true);

  

  const isAdminUpload = (movieToCheck?: Movie | null) => {
    if (!movieToCheck?.uploader) return false;
    const uploaderLower = movieToCheck.uploader.toLowerCase();
    return uploaderLower.includes('admin') || uploaderLower.includes('gospelscreen') || uploaderLower.includes('gospel screen');
  };

  

  // Function to refresh view count from database
  const refreshViewCount = async () => {
    if (!movie || !mountedRef.current) return;
    try {
      const response = await fetch(`http://localhost:8081/api/get-movie-views/${movie.id}`);
      if (response.ok && mountedRef.current) {
        const data = await response.json();
        setViews(data.views || 0);
      }
    } catch (err) {
      console.error('Error refreshing view count:', err);
    }
  };

  useEffect(() => {
    // Clear any existing timer when movie changes
    if (viewTimer) {
      clearTimeout(viewTimer);
      setViewTimer(null);
    }
    
    const found = movies.find(m => m.id === id);
    if (found) {
      setMovie(found);
      const savedComments = movieService.getComments(found.id);
      setComments(savedComments);

      // Fetch persisted comments from backend on first load
      fetchComments(found.id);

      // Load total views from database (already included in the found movie object)
      const movieViews = found.views || 0;
      setViews(movieViews);
      
      // Check if current user has viewed this movie from database
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email) {
        fetch('http://localhost:8081/api/check-viewed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId: found.id, userEmail: currentUser.email })
        })
          .then(res => res.json())
          .then(data => setHasUserViewed(data.hasViewed || false))
          .catch(err => console.error('Error checking view status:', err));
      }
      setHasIncrementedViews(false); // Reset for new movie - views will increment on next play
      
      // Load user rating from database
      if (currentUser && currentUser.email) {
        fetch('http://localhost:8081/api/get-user-rating', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId: found.id, userId: currentUser.email })
        })
          .then(res => res.json())
          .then(data => setUserRating(data.rating || 0))
          .catch(err => console.error('Error fetching user rating:', err));
      }
      
      // Load total ratings from database
      fetch(`http://localhost:8081/api/get-total-ratings/${found.id}`)
        .then(res => res.json())
        .then(data => setTotalStars(data.totalRatings || 0))
        .catch(err => console.error('Error fetching total ratings:', err));
    }
    setCurrentUser(authService.getCurrentUser());
    setIsPlayingTrailer(false);
  }, [id, movies]);

  useEffect(() => {
    return () => {
      // Cleanup timer on unmount
      mountedRef.current = false;
      if (viewTimer) {
        clearInterval(viewTimer);
      }
    };
  }, [viewTimer]);

  // Additional cleanup for component unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (viewTimer) {
        clearInterval(viewTimer);
      }
      // Cleanup HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // Check subscription status (includes temporary access) unless the movie was uploaded by admin
  useEffect(() => {
    const checkSubscription = async () => {
      if (isAdminUpload(movie)) {
        setHasSubscription(true);
        return;
      }

      if (currentUser?.email) {
        try {
          const isActive = await subscriptionService.hasActiveSubscription(currentUser.email);
          setHasSubscription(isActive);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setHasSubscription(false);
        }
      } else {
        setHasSubscription(false);
      }
    };
    checkSubscription();
  }, [currentUser?.email, movie]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      setDuration(vid.duration || 0);
      setCurrentTime(vid.currentTime || 0);
      vid.volume = volume;
      vid.playbackRate = playbackRate;
    };

    const onTime = () => setCurrentTime(vid.currentTime || 0);
    const onPlay = () => {
      setIsPlaying(true);
      // Increment views immediately when play starts (if not already incremented for this user)
      if (!hasIncrementedViews && !hasUserViewed && movie && currentUser && mountedRef.current) {
        fetch('http://localhost:8081/api/increment-views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId: movie.id, userEmail: currentUser.email })
        })
          .then(res => res.json())
          .then(data => {
            if (mountedRef.current) {
              setViews(data.views || 0);
              setHasIncrementedViews(true);
              setHasUserViewed(true);
            }
          })
          .catch(err => console.error('Error incrementing views:', err));
      }

      // Start periodic view count refresh to show real-time views from other users
      if (!viewTimer && mountedRef.current) {
        const timer = setInterval(() => {
          // Only refresh if component is still mounted and movie exists
          if (movie && mountedRef.current) {
            refreshViewCount().catch(err => console.error('Error in view refresh:', err));
          }
        }, 30000); // Refresh every 30 seconds
        setViewTimer(timer);
      }
    };
    
    const onPause = () => {
      setIsPlaying(false);
      // Clear view refresh timer
      if (viewTimer) {
        clearInterval(viewTimer);
        setViewTimer(null);
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);

    vid.addEventListener('loadedmetadata', onLoaded);
    vid.addEventListener('timeupdate', onTime);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);
    vid.addEventListener('waiting', onWaiting);
    vid.addEventListener('canplay', onCanPlay);
    vid.addEventListener('playing', onPlaying);

    const onFullChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener('fullscreenchange', onFullChange);

    return () => {
      try {
        vid.removeEventListener('loadedmetadata', onLoaded);
        vid.removeEventListener('timeupdate', onTime);
        vid.removeEventListener('play', onPlay);
        vid.removeEventListener('pause', onPause);
        vid.removeEventListener('waiting', onWaiting);
        vid.removeEventListener('canplay', onCanPlay);
        vid.removeEventListener('playing', onPlaying);
      } catch (e) {
        // ignore if vid changed
      }
      document.removeEventListener('fullscreenchange', onFullChange);
    };
  }, [volume, playbackRate, movie?.fullMovieUrl, movie?.trailerUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Switch local source for trailer/full movie
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const currentUrl = isPlayingTrailer && movie?.trailerUrl ? movie.trailerUrl : movie?.fullMovieUrl;
    if (currentUrl) {
      if (vid.src !== currentUrl) {
        vid.src = currentUrl;
        vid.load();
      }
    } else {
      if (vid.hasAttribute('src')) {
        vid.removeAttribute('src');
        vid.load();
      }
    }
  }, [isPlayingTrailer, movie?.trailerUrl, movie?.fullMovieUrl]);

  // Keep playback state in sync with user toggle action without reloading source.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.play().catch(err => console.warn('Auto-play prevented:', err));
    }
  }, [isPlaying]);

  const fetchComments = async (movieId: string) => {
    try {
      const res = await fetch(`http://localhost:8081/api/comments/${movieId}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();

      const mapped: Comment[] = data.map((row: any) => ({
        id: row.id,
        movieId: row.movie_id,
        userName: row.name || row.user_id, // Use name from login table, fallback to email
        text: row.comment,
        timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarUrl: row.avatar || undefined, // Use avatar from login table
      }));

      setComments(mapped);
    } catch (err) {
      console.warn('Failed to load comments:', err);
      // Fallback to local storage comments if available
      if (movie) {
        setComments(movieService.getComments(movie.id));
      }
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !movie) return;

    const commentId = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).substr(2, 9);
    const payload = {
      id: commentId,
      user_id: currentUser.email,
      movie_id: movie.id,
      comment: newComment.trim(),
    };

    try {
      const res = await fetch('http://localhost:8081/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to send comment');
      }

      const newCommentItem: Comment = {
        id: commentId,
        movieId: movie.id,
        userName: currentUser.name,
        text: newComment.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarUrl: currentUser.avatar,
      };
      setComments((prev) => [newCommentItem, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to send comment:', err);
      alert('Unable to send comment. Please try again.');
    }
  };

  const playFullMovie = async () => {
    // Always get fresh user data when Watch is clicked
    const freshUser = authService.getCurrentUser();
    
    // Check if user is logged in
    if (!freshUser) {
      navigate('/auth');
      return;
    }

    const isAdminMovie = isAdminUpload(movie);
    if (!isAdminMovie) {
      // Refresh subscription status (including temporary unlock)
      let activeStatus = false;
      try {
        activeStatus = await subscriptionService.hasActiveSubscription(freshUser.email);
        setHasSubscription(activeStatus);
      } catch (err) {
        console.error('Error refreshing subscription status:', err);
      }

      if (!activeStatus) {
        setShowSubscriptionModal(true);
        return;
      }
    } else {
      setHasSubscription(true);
    }

    // Play the movie
    setIsPlayingTrailer(false);
    if (videoRef.current) {
      // Wait for src to be ready then play
      setTimeout(async () => {
        try {
          await videoRef.current?.play();
          setIsPlaying(true);
        } catch (e) {
          console.warn('Play failed', e);
        }
      }, 100);
    }
  };

  // Ensure when trailer/full toggles, the video element loads the updated src
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // allow React to update the `src` on the <video> before calling load
    const id = window.setTimeout(() => {
      try {
        vid.load();
        // Do not auto-play, let user click play button
      } catch (e) {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [isPlayingTrailer, movie?.trailerUrl, movie?.fullMovieUrl]);

  // Initialize HLS playback for HLS URLs
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Determine which HLS URL to use
    const hlsUrl = isPlayingTrailer ? movie?.hlsTrailerUrl : movie?.hlsPlaybackUrl;

    // If no HLS URL, cleanup HLS if it exists
    if (!hlsUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    // Check if HLS.js is supported
    if (!HLS.isSupported()) {
      console.warn('HLS.js is not supported in this browser');
      // Fallback to native HLS support on Safari
      if (vid.canPlayType('application/vnd.apple.mpegurl')) {
        vid.src = hlsUrl;
        vid.load();
      }
      return;
    }

    // Destroy existing HLS instance if switching sources
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // Create new HLS instance
    const hls = new HLS({
      debug: false,
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
    });

    hlsRef.current = hls;

    // Load the HLS stream
    hls.loadSource(hlsUrl);
    hls.attachMedia(vid);

    // Handle HLS events
    hls.on(HLS.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest loaded successfully');
    });

    hls.on(HLS.Events.ERROR, (event, data) => {
      console.error('HLS error:', data);
      if (data.fatal) {
        switch (data.type) {
          case HLS.ErrorTypes.NETWORK_ERROR:
            console.error('Network error loading HLS stream');
            break;
          case HLS.ErrorTypes.MEDIA_ERROR:
            console.error('Media error in HLS stream');
            hls.recoverMediaError();
            break;
          default:
            console.error('Fatal HLS error:', data);
            hls.destroy();
            hlsRef.current = null;
            break;
        }
      }
    });

    return () => {
      // Cleanup is handled by the movie change trigger
    };
  }, [isPlayingTrailer, movie?.hlsPlaybackUrl, movie?.hlsTrailerUrl]);

  // If navigated here with ?autoplayTrailer=true and the movie has a trailer, set trailer mode but don't auto-play
  useEffect(() => {
    if (!movie) return;
    const params = new URLSearchParams(location.search);
    const auto = params.get('autoplayTrailer');
    if (auto === 'true' && movie.trailerUrl) {
      setIsPlayingTrailer(true);
      // Do not auto-play, let user click play button
    }
  }, [location.search, movie]);

  const togglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    try {
      if (vid.paused) {
        await vid.play();
        setIsPlaying(true);
      } else {
        vid.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('Play failed', e);
    }
  };

  const seek = (time: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.min(Math.max(0, time), vid.duration || 0);
  };

  const skip = (seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    seek((vid.currentTime || 0) + seconds);
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;

    // Update hover indicator (so circle snaps to click position)
    setSeekHoverPercent(Math.max(0, Math.min(1, percent)));

    const vid = videoRef.current;
    const dur = vid?.duration || duration || 0;
    const newTime = dur * percent;
    seek(newTime);
  };

  const onProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percent = hoverX / rect.width;
    setSeekHoverPercent(Math.max(0, Math.min(1, percent)));
    
    const dur = duration || 0;
    const hoverTime = dur * percent;
    setSeekHoverTime(hoverTime);
  };

  const onProgressLeave = () => {
    setSeekHoverPercent(null);
    setSeekHoverTime(null);
  };

  const toggleMute = () => setMuted((m) => !m);

  const handleControlsInteraction = () => {
    setShowControls(true);
    // Clear existing timer
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    // Set new timer to hide controls after 3 seconds
    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const playerContainer = containerRef.current;
    if (!playerContainer) return;

    playerContainer.addEventListener('mousemove', handleControlsInteraction);
    playerContainer.addEventListener('click', handleControlsInteraction);

    return () => {
      playerContainer.removeEventListener('mousemove', handleControlsInteraction);
      playerContainer.removeEventListener('click', handleControlsInteraction);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };



  const handleRating = (rating: number) => {
    if (!currentUser || !movie) return;
    
    // Toggle: if user clicks the same rating, remove it (set to 0), otherwise set new rating
    const newRating = userRating === rating ? 0 : rating;
    
    // Save rating to database
    fetch('http://localhost:8081/api/rate-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId: movie.id, userId: currentUser.email, rating: newRating })
    })
      .then(res => res.json())
      .then(data => {
        setUserRating(newRating);
        setTotalStars(data.totalRatings || 0);
        console.log(`Rating ${newRating === 0 ? 'removed' : 'saved'} successfully`);
      })
      .catch(err => console.error('Error saving rating:', err));
  };

  const getRatings = async () => {
  const res = await fetch(`/api/movie-rating/${movie.id}`);
  const data = await res.json();

  setTotalStars(data.count);
};

  const formatCurrentTime = (seconds: number): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '00:00';
    seconds = Math.max(0, seconds);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '0:00:00';
    seconds = Math.max(0, seconds);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteMovie = () => {
    if (!movie || !currentUser) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!movie) return;
    
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`http://localhost:8081/api/delete-movie/${encodeURIComponent(movie.id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete movie');
      }

      // Notify parent component
      if (onDeleteMovie) {
        onDeleteMovie(movie);
      }
      movieService.deleteMovie(movie.id);

      console.log('Movie deleted successfully');
      setShowDeleteModal(false);
      
      // Navigate back to browse page after deletion
      setTimeout(() => {
        navigate('/browse');
      }, 500);
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete movie');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getLevelInfo = (views: number) => {
    if (views >= 500000) return { level: 5, color: "#d4af37", name: "Level 5" };
    if (views >= 100000) return { level: 4, color: "#ffff00", name: "Level 4" };
    if (views >= 1000) return { level: 3, color: "#0000ff", name: "Level 3" };
    if (views >= 500) return { level: 2, color: "#00ff00", name: "Level 2" };
    if (views >= 200) return { level: 1, color: "#ffffff", name: "Level 1" };
    return null;
  };

  if (!movie) return <div className="pt-24 text-center">Loading Content...</div>;

  const levelInfo = getLevelInfo(views);

  // Prefer HLS URLs if available, fallback to regular URLs
  const currentSource = isPlayingTrailer 
    ? (movie?.hlsTrailerUrl || movie?.trailerUrl)
    : (movie?.hlsPlaybackUrl || movie?.fullMovieUrl)
      ? (movie?.hlsPlaybackUrl || movie?.fullMovieUrl)
      : "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="pt-20 px-4 md:px-16 space-y-8 animate-in fade-in duration-500">
      {/* Video Player Section */}
      <div ref={containerRef} className="relative aspect-video w-full bg-black  overflow-hidden group border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        {/* Actual Video Element */}
        <video 
          ref={videoRef}
          poster={movie.thumbnail}
          className="w-full h-full object-cover"
          controls={false}
          preload="metadata"
          playsInline
          src={currentSource}
          onError={(event) => console.error('Video playback error:', event)}
          onStalled={(event) => console.warn('Video stalled:', event)}
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            setDuration(vid.duration || 0);
            setCurrentTime(vid.currentTime || 0);
            vid.volume = volume;
            vid.playbackRate = playbackRate;
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
          onPlay={() => {
            setIsPlaying(true);
            // Start view timer if user hasn't viewed before and timer not already running
            if (!hasUserViewed && !viewTimer && movie && currentUser) {
              const timer = setTimeout(async () => {
                // Increment views in database after 30 minutes of continuous play
                try {
                  const response = await fetch('http://localhost:8081/api/increment-views', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ movieId: movie.id, userEmail: currentUser.email })
                  });
                  const data = await response.json();
                  setViews(data.views || 0);
                  // Refresh view count from database to ensure real-time update
                  await refreshViewCount();
                } catch (err) {
                  console.error('Error incrementing views:', err);
                }
                setHasIncrementedViews(true);
                setHasUserViewed(true);
                setViewTimer(null);
              }, 1800000); // 30 minutes
              setViewTimer(timer);
            }
          }}
          onPause={() => {
            setIsPlaying(false);
            // Clear view timer if user pauses before 30 seconds
            if (viewTimer) {
              clearTimeout(viewTimer);
              setViewTimer(null);
            }
          }}
        >
          {/* No additional <source> tags; using <video src={currentSource}> with native load */}
          {/* Fallback for browsers that do not support <source> */}
          Your browser does not support the video tag.
        </video>
        

        
        {/* Loading/Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-12 h-12 text-[#d4af37] animate-spin" />
              <p className="text-white text-sm font-medium">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Cinematic Overlays */}
        {isPlayingTrailer && (
          <div className="absolute top-6 left-6 z-20">
            <span className="bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              Trailer Mode
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Custom Controls Bar */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent px-0 pb-4 md:pb-6 pt-8 md:pt-10 transition-opacity duration-300 ${
          isPlaying ? (isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none') : 'opacity-100'
        }`}>
          <div className="flex flex-col w-full px-2 md:px-3 relative top-4 md:top-5 gap-3 md:gap-2 pointer-events-auto">
            <div
              onClick={onProgressClick}
              onMouseMove={onProgressHover}
              onMouseLeave={onProgressLeave}
              className="h-1 md:h-1.5 relative cursor-pointer bg-white/20 rounded hover:h-2 md:hover:h-2 transition-all duration-200 group"
            >
              <div
                className="h-full bg-[#d4af37] rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, duration ? (currentTime / duration) * 100 : 0))}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 flex-shrink-0"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="text-xs md:text-sm text-gray-300 font-mono whitespace-nowrap flex-shrink-0">
                  {formatCurrentTime(currentTime)} / {formatDuration(duration)}
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-800/50"
                title="Fullscreen"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* Info & Trailer Actions */}
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2 md:mb-0">
                  <span className="block md:hidden">{movie.title}</span>
                  <span className="hidden md:block">{movie.title}</span>
                </h1>
                <div className="flex items-center gap-4 text-[#d4af37]">
                  {levelInfo && (
                       <>
                         <div className="flex gap-1">
                           <Star size={14} style={{ fill: levelInfo.color }} />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20">
                           {levelInfo.name}
                         </span>
                       </>
                     )}
                </div>
              </div>
              
              <div className="flex gap-4">
                {/* Buttons under player for mobile only, original for desktop */}
                <div>
                  {/* Desktop: original button row */}
                  <div className="hidden md:flex gap-4 items-center">
                    {/* ...existing code for all buttons, unchanged... */}
                    <button
                      onClick={async () => {
                        if (!movie) return;
                        if (!movie.trailerUrl) {
                          fileInputRef.current?.click();
                          return;
                        }
                        const newState = !isPlayingTrailer;
                        setIsPlayingTrailer(newState);
                        if (videoRef.current) {
                          if (newState) {
                            // Playing - wait for src to be ready then play
                            setTimeout(async () => {
                              try {
                                await videoRef.current?.play();
                                setIsPlaying(true);
                              } catch (e) {
                                console.warn('Play failed', e);
                              }
                            }, 100);
                          } else {
                            // Not playing - pause immediately
                            videoRef.current.pause();
                            setIsPlaying(false);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${isPlayingTrailer ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'}`}
                    >
                      <Clapperboard size={18} />
                      Trailer
                    </button>
                    <button
                      onClick={playFullMovie}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all bg-[#d4af37] text-black border-0 hover:bg-[#c49f27]"
                    >
                      <Play size={18} />
                      Watch
                    </button>
                  
                    <button
                      onClick={() => handleRating(userRating > 0 ? 0 : 5)}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                      title={userRating > 0 ? 'Remove rating' : 'Rate 5 stars'}
                    >
                      <Star 
                        size={20} 
                        fill={userRating > 0 ? '#d4af37' : 'none'} 
                        className={userRating > 0 ? 'text-[#d4af37]' : 'text-gray-400'} 
                      />
                    </button>
                    {currentUser && movie.uploader === currentUser.name && (
                      <button 
                        onClick={deleteMovie}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete movie"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button onClick={() => setShowShareDialog(true)} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                  {/* Mobile: buttons under player */}
                  <div className="flex flex-wrap gap-2 mt-4 md:hidden w-full justify-center items-center">
                    <button
                      onClick={async () => {
                        if (!movie) return;
                        if (!movie.trailerUrl) {
                          fileInputRef.current?.click();
                          return;
                        }
                        const newState = !isPlayingTrailer;
                        setIsPlayingTrailer(newState);
                        if (videoRef.current) {
                          if (newState) {
                            // Playing - wait for src to be ready then play
                            setTimeout(async () => {
                              try {
                                await videoRef.current?.play();
                                setIsPlaying(true);
                              } catch (e) {
                                console.warn('Play failed', e);
                              }
                            }, 100);
                          } else {
                            // Not playing - pause immediately
                            videoRef.current.pause();
                            setIsPlaying(false);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all border-2 ${isPlayingTrailer ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'}`}
                    >
                      <Clapperboard size={16} />
                      Trailer
                    </button>
                    <button
                      onClick={playFullMovie}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all bg-[#d4af37] text-black border-0 hover:bg-[#c49f27]"
                    >
                      <Play size={16} />
                      Watch
                    </button>
                    {/* Language Dropdown (Mobile) */}
                    <button
                      onClick={() => handleRating(userRating > 0 ? 0 : 5)}
                      className="p-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                      title={userRating > 0 ? 'Remove rating' : 'Rate 5 stars'}
                    >
                      <Star 
                        size={18} 
                        className={userRating > 0 ? 'text-[#d4af37]' : 'text-gray-400'} 
                        fill={userRating > 0 ? '#d4af37' : 'none'} 
                      />
                    </button>
                    {currentUser && movie.uploader === currentUser.name && (
                      <button 
                        onClick={deleteMovie}
                        className="p-2 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all"
                        title="Delete movie"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button onClick={() => setShowShareDialog(true)} className="p-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-[#d4af37]" />
                {movie.year} Production
              </span>
              
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="bg-[#d4af37]/10 text-[#d4af37] px-3 py-0.5 rounded-lg text-[10px] font-bold border border-[#d4af37]/20">
                {movie.category}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-2">
                <User size={14} className="text-[#d4af37]" />
                 {movie.uploader}
              </span>
              
            </div>

            <div className="space-y-4">
               <h3 className="text-lg md:text-2xl font-serif font-bold text-gray-100 flex items-center gap-3">
                 <Info size={18} className="text-[#d4af37]" />
                 Production Synopsis
               </h3>
               <p className="text-gray-400 leading-relaxed text-base md:text-lg  border-l-2 border-[#d4af37]/30 pl-4 md:pl-6 py-2 text-justify md:text-left" style={{ textJustify: 'inter-word' }}>
                 <span className="block max-w-[78vw] md:max-w-2xl mx-auto md:mx-0 break-words whitespace-pre-line">{movie.description}</span>
               </p>
            </div>
          </div>
        </div>

        {/* Unified Community Feed */}
        <div className="space-y-6">
          {/* Views Section */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye size={18} className="text-[#d4af37]" />
                Views
              </h3>
              <span className="text-2xl font-bold text-[#d4af37]">{views.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">People who have watched this movie</p>
          </div>

          {/* Stars Section */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star size={18} className="text-[#d4af37]" />
                Stars
              </h3>
              <span className="text-2xl font-bold text-[#d4af37]">{totalStars.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">People who liked this movie</p>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare size={18} className="text-red-500 animate-pulse" />
              Community Discussion
            </h3>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-3xl h-[500px] flex flex-col overflow-hidden shadow-inner">
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
           
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <MessageSquare size={48} className="mb-4 text-[#d4af37]" />
                  <p className="text-sm font-medium">Join the conversation.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex w-full items-center mb-1 px-1">
                      <User size={16} className="text-[#d4af37] mr-2" />
                      <span className="font-semibold text-gray-200 mr-2">{comment.userName}</span>
                      </div>
                    <p className="text-gray-300 ml-8 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 bg-black/40 border-t border-white/5">
              {currentUser ? (
                <form onSubmit={handleSendComment} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-black bg-[#d4af37] rounded-xl hover:bg-[#c49f27] transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
              ) : (
                <Link
                  to="/auth"
                  className="w-full block bg-[#d4af37] text-black text-center py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c49f27] transition-all"
                >
                  Sign in to Discuss
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232323] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share</h3>
              <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 min-w-[400px] md:min-w-0 justify-center mb-4">
                
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => window.open(`https://wa.me/?text=Check out this movie: ${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-md"
                      title="WhatsApp"
                    >
                      <img src={whatsappIcon} alt="WhatsApp" className="w-14 h-14"  />
                    </button>
                    <span className="mt-2 text-xs text-white">WhatsApp</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-md"
                      title="Facebook"
                    >
                      {/* Keep using SVG for Facebook since there's no Facebook icon file */}
                   <img src={facebookIcon} alt="Facebook" className="w-14 h-14" />
                    </button>
                    <span className="mt-2 text-xs text-white">Facebook</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this movie: ${movie?.title}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md"
                      title="X"
                    >
                      <img src={twitterIcon} alt="X" className="w-14 h-14" />
                    </button>
                    <span className="mt-2 text-xs text-white">X</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => window.open(`mailto:?subject=Check out this movie&body=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md"
                      title="Email"
                    >
                      <img src={gmailIcon} alt="Email" className="w-14 h-14" />
                    </button>
                    <span className="mt-2 text-xs text-white">Email</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <button className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md" title="Instagram" onClick={() => window.open(`https://www.instagram.com/share/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                       <img src={instagramIcon} alt="Instagram" className="w-14 h-14" />
                    </button>
                    <span className="mt-2 text-xs text-white">Instagram</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied!');
                  }}
                  className="px-3 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-lg hover:bg-[#c49f27]"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
   {/* This is a comment in JSX */}
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 max-w-sm sm:max-w-md w-full mx-auto p-6 sm:p-8 shadow-2xl relative transform transition-all duration-300 ease-out">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={20} className="text-white" />
            </button>


            <div className="flex items-center justify-center mb-6">
              <div className="bg-[#d4af37]/20 p-3 sm:p-4 rounded-full">
                <AlertCircle size={28} className="sm:w-8 sm:h-8 text-[#d4af37]" />
              </div>
            </div>


            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">Premium Membership Required</h2>
            <p className="text-gray-300 text-center mb-6 text-sm sm:text-base leading-relaxed px-2">
              Watch full movies by subscribing to GospelScreen TV. Get unlimited access to our entire library of Christian content.
            </p>

            <div className="space-y-3 mb-6 bg-[#0f0f0f] p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                <div className="w-2 h-2 bg-[#d4af37] rounded-full flex-shrink-0" />
                <span>Unlimited streaming of full movies</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                <div className="w-2 h-2 bg-[#d4af37] rounded-full flex-shrink-0" />
                <span>Watch in HD quality</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                <div className="w-2 h-2 bg-[#d4af37] rounded-full flex-shrink-0" />
                <span>Support Filmmakers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                <div className="w-2 h-2 bg-[#d4af37] rounded-full flex-shrink-0" />
                <span>Ad-free experience</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  navigate('/membership');
                }}
                className="w-full py-3 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#e5c158] transition-all text-sm sm:text-base"
              >
                Subscribe Now
              </button>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="w-full py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#d4af37]/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Movie</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="text-[#d4af37] font-semibold">"{movie?.title}"</span>?
                This action cannot be undone and will permanently remove the movie and all its files.
              </p>
              {deleteError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm">
                  Error: {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
