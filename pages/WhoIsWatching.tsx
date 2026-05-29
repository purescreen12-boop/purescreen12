import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface WhoIsWatchingProps {
  onAuthSuccess: (user: User) => void;
}

const WhoIsWatching: React.FC<WhoIsWatchingProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load profiles from device storage
    const deviceProfiles = authService.getProfiles();
    setProfiles(deviceProfiles);
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedUser || !password) return;

    setLoading(true);
    try {
      const authenticatedUser = await authService.login({ email: selectedUser.email, password });
      authService.setCurrentUser(authenticatedUser);
      onAuthSuccess(authenticatedUser);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    navigate('/auth?signin=true');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('/extreme-closeup-beautiful-blown-dandelion.jpg')`,
      }}
    >
      {loading && (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      )}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Who is watching?</h1>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {profiles.map((profile) => (
            <div
              key={profile.email}
              onClick={() => handleUserSelect(profile)}
              className="cursor-pointer flex flex-col items-center hover:scale-105 transition-transform"
            >
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center mb-2 overflow-hidden border-2 border-transparent hover:border-white">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{profile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-white text-lg">{profile.name}</span>
            </div>
          ))}

          <div
            onClick={handleAddUser}
            className="cursor-pointer flex flex-col items-center hover:scale-105 transition-transform"
          >
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center mb-2 border-2 border-white">
              <Plus size={32} className="text-white" />
            </div>
            <span className="text-white text-lg">Add Profile</span>
          </div>
        </div>

        {selectedUser && (
          <div className="bg-black/70 p-6 rounded-lg max-w-sm mx-auto backdrop-blur-sm">
            <h2 className="text-white text-xl mb-4">Enter password for {selectedUser.name}</h2>
            <div className="flex items-center mb-4">
              <Lock className="text-gray-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-white focus:outline-none"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            <button
              onClick={handleContinue}
              disabled={loading || !password}
              className="w-full bg-[#d4af37] text-white py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoIsWatching;