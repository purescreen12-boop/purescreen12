import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

const MyVideo: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Lock size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white">Sign In Required</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              You must be logged in to view your uploaded videos.
            </p>
          </div>
          <Link 
            to="/auth" 
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-[#c49f27] transition-all flex items-center justify-center gap-2 group"
          >
            Go to Sign In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch videos for the current user using their email
    if (!user?.email) {
      setVideos([]);
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8081/api/my-videos/${encodeURIComponent(user.email)}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching videos:', err);
        setVideos([]);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 bg-[#181a1b] flex flex-col items-center">
      <h1 className="text-2xl font-bold text-[#d4af37] mb-8">My Uploaded Videos</h1>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <Video size={64} className="text-[#d4af37] mb-4" />
          <p className="text-lg text-gray-200 font-semibold mb-2">No video uploaded yet</p>
          <p className="text-gray-400">Put your first video out there</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-[#23272b] rounded-xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate(`/player/${video.id}`)}
            >
              <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-bold text-white mb-1 truncate">{video.title}</h2>
                <span className="text-xs text-gray-400">Video ID: {video.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVideo;
