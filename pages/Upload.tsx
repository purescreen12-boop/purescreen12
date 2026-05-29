
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, CheckCircle2, Loader2, Lock, 
  ShieldAlert, ArrowRight, Folder, Image as ImageIcon, 
  Film, Clapperboard, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie, User } from '../types';
import { CATEGORIES } from '../data/mockData';

interface UploadProps {
  user: User | null;
  onUpload?: (newMovie: Movie) => void;
}

const Upload: React.FC<UploadProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [hasPayment, setHasPayment] = useState(false);
  const [paymentCheckLoading, setPaymentCheckLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const availableCategories = CATEGORIES.filter(cat => cat !== 'All');

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    uploader: string;
  }>({
    title: '',
    description: '',
    category: availableCategories[0] || '',
    uploader: user?.name || 'Guest User',
  });
  const [folderName, setFolderName] = useState<string>('');

  // Media States
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const movieInputRef = useRef<HTMLInputElement>(null);
  const trailerInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Check if creator has made payment
  useEffect(() => {
    if (!user?.email) {
      setPaymentCheckLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/creator-payments/${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const payments = await res.json();
          const hasCompletedPayment = Array.isArray(payments) && 
            payments.some(p => ['completed', 'success'].includes((p.status || '').toLowerCase()));
          setHasPayment(hasCompletedPayment);
        }
      } catch (err) {
        console.warn('Error checking creator payments:', err);
        // If error, default to false
        setHasPayment(false);
      } finally {
        setPaymentCheckLoading(false);
      }
    };

    checkPaymentStatus();
  }, [user?.email]);

  async function getUploadUrls(movieFile: File | null, trailerFile: File | null, thumbnailFile: File | null) {
    const res = await fetch("http://localhost:8081/api/get-presigned-urls", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        movieName: movieFile?.name,
        movieType: movieFile?.type,
        trailerName: trailerFile?.name,
        trailerType: trailerFile?.type,
        thumbnailName: thumbnailFile?.name,
        thumbnailType: thumbnailFile?.type,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Debug: log the URLs
    console.log('Presigned URLs:', data);

    return data;
  }

  async function uploadToS3(url: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve('');
        } else {
          reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Failed to fetch'));

      xhr.send(file);
    });
  }

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
            <h2 className="text-3xl font-serif font-bold text-white">Access Restricted</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              To upload your gospel-filled stories, you must first join our community by signing in or creating an account.
            </p>
          </div>
          <Link 
            to="/auth" 
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-[#c49f27] transition-all flex items-center justify-center gap-2 group"
          >
            Go to Authentication
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is a creator or admin (has permission to upload) OR has made a creator payment
  const isCreator = user.role === 'creator' || user.role === 'admin' || hasPayment;
  if (!isCreator) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <ShieldAlert size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-white">Creator Account Required</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              To upload content, you need to complete your creator payment. This helps us maintain quality standards and support creators like you.
            </p>
          </div>
          <Link 
            to="/choose-path" 
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-[#c49f27] transition-all flex items-center justify-center gap-2 group"
          >
            Become a Creator
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'movie' | 'trailer' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'movie') {
      // Check file size: must be below 15GB
      const maxSize = 15 * 1024 * 1024 * 1024; // 15GB in bytes
      if (file.size > maxSize) {
        setError('Movie file size must be below 15GB.');
        return;
      }
      setMovieFile(file);
    }
    if (type === 'trailer') setTrailerFile(file);
    if (type === 'thumbnail') {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !movieFile) {
      setError("Please fill in basic details and select a main movie file.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Get presigned URLs for all files
      const urlsData = await getUploadUrls(movieFile, trailerFile, thumbnailFile);
      const { movie, trailer, thumbnail, movieId } = urlsData;

      // Upload files to S3 with real progress
      let currentProgress = 0;
      await uploadToS3(movie.uploadUrl, movieFile, (p) => {
        setProgress(currentProgress + p * 0.7); // 70% for movie
      });
      currentProgress = 70;
      setProgress(currentProgress);

      if (trailerFile && trailer) {
        await uploadToS3(trailer.uploadUrl, trailerFile, (p) => {
          setProgress(currentProgress + p * 0.15); // 15% for trailer
        });
        currentProgress += 15;
        setProgress(currentProgress);
      }

      if (thumbnailFile && thumbnail) {
        await uploadToS3(thumbnail.uploadUrl, thumbnailFile, (p) => {
          setProgress(currentProgress + p * 0.15); // 15% for thumbnail
        });
        currentProgress += 15;
        setProgress(currentProgress);
      }

      // Finalize upload (save to DB)
      const finalizeResponse = await fetch('http://localhost:8081/api/finalize-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          uploader: user?.name || 'Guest User',
          userId: user?.email || null,
          video_url: movie.fileUrl,
          trailer_url: trailer?.fileUrl || '',
          thumbnail_url: thumbnail?.fileUrl || '',
          movieId,
        }),
      });

      if (!finalizeResponse.ok) {
        const text = await finalizeResponse.text();
        throw new Error(`HTTP ${finalizeResponse.status}: ${finalizeResponse.statusText} - ${text}`);
      }

      const finalizeData = await finalizeResponse.json();
      const newMovie = finalizeData.movie;

      // Log what the backend says is the requested vs stored ID, so you can verify.
      console.log('Upload finalized:', {
        requestedMovieId: finalizeData.requestedMovieId,
        storedMovieId: finalizeData.storedMovieId,
        returnedMovieId: newMovie?.id,
      });

      if (newMovie && onUpload) {
        onUpload(newMovie);
      }

      setProgress(100);

      // Show the movie ID so you can validate the value shown in the UI matches the value stored on the backend.
      if (newMovie?.id) {
        setSuccess(`Upload complete! Movie ID: ${newMovie.id}`);
      }

      navigate('/browse');
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setProgress(0);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-8 md:px-16 flex flex-col items-center pb-20 relative overflow-hidden text-white">
      {/* Cinematic background image, same as Edit Profile */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('come.png')`, backgroundPosition: '20% 90%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="max-w-5xl w-full bg-[#121212]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl z-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6">
          <div className="text-center md:text-left space-y-3">
            <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Upload Production</h2>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed mx-auto md:mx-0">
              Prepare your masterpiece for the <b>PureScreen Library</b>. Ensure all media assets are high quality.
            </p>
          </div>
          
          <div className="bg-[#d4af37]/10 px-4 py-1.5 rounded-full border border-[#d4af37]/20 flex items-center gap-2 h-fit self-center md:self-start">
            <Folder size={12} className="text-[#d4af37]" />
            <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest italic">
              AUTHORISED SESSION
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Basic Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] border-b border-white/5 pb-2">Basic Information</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Movie Title</label>
                <input 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                  placeholder="e.g. The Forge"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-4 px-5 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all text-gray-300"
                  disabled={isUploading}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Synopsis</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all resize-none"
                  placeholder="Tell us about your content..."
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Section 2: Thumbnail Session */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] border-b border-white/5 pb-2">Cover Art (Thumbnail)</h3>
              
              <div 
                onClick={() => !isUploading && thumbnailInputRef.current?.click()}
                className={`relative aspect-video rounded-2xl border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all cursor-pointer group hover:border-[#d4af37]/50 ${isUploading ? 'opacity-50' : ''}`}
              >
                <input ref={thumbnailInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} />
                
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white" size={32} />
                      <span className="ml-2 text-white font-bold text-xs">Change Art</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <ImageIcon className="text-gray-700 mx-auto" size={48} />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Select Landscape Cover Art</p>
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest text-center">Recommended: 1920x1080 (JPG/PNG)</p>
            </div>
          </div>

          {/* Section 3: Video Assets (Movie & Trailer) */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] border-b border-white/5 pb-2">Video Assets</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Movie Slot */}
              <div 
                onClick={() => !isUploading && movieInputRef.current?.click()}
                className={`p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 hover:bg-white/10 transition-all cursor-pointer group ${isUploading ? 'opacity-50' : ''}`}
              >
                <input ref={movieInputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'movie')} />
                <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto border border-[#d4af37]/20 group-hover:scale-110 transition-transform">
                  <Film className="text-[#d4af37]" size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-widest">Full Movie</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{movieFile ? movieFile.name : "High Resolution Feature (MP4/MOV)"}</p>
                </div>
              </div>

              {/* Trailer Slot */}
              <div 
                onClick={() => !isUploading && trailerInputRef.current?.click()}
                className={`p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 hover:bg-white/10 transition-all cursor-pointer group ${isUploading ? 'opacity-50' : ''}`}
              >
                <input ref={trailerInputRef} type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'trailer')} />
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Clapperboard className="text-blue-400" size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs tracking-widest">Trailer</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{trailerFile ? trailerFile.name : "Optional 1-2min Preview"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress & Submit */}
          <div className="space-y-6 pt-4">
            {isUploading && (
              <div className="space-y-3 p-6 bg-[#d4af37]/5 rounded-2xl border border-[#d4af37]/20">
                <div className="flex justify-between text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Uploading taking place, please wait...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#d4af37] h-full transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4cf67] text-black font-bold py-6 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3 shadow-xl shadow-[#d4af37]/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>Finalizing Publication...</>
              ) : (
                <><CheckCircle2 size={24} /> Publish Content</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Upload Failed</h3>
              <button onClick={() => setError(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">{error}</p>
            <button onClick={() => setError(null)} className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:bg-[#c49f27] transition-colors">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Upload Successful</h3>
              <button onClick={() => setSuccess(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">{success}</p>
            <button onClick={() => { setSuccess(null); navigate('/browse'); }} className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-xl hover:bg-[#c49f27] transition-colors">
              Go to Browse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
