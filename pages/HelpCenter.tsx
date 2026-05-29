import React, { useState } from 'react';
import {
  HelpCircle, Search, MessageSquare, BookOpen,
  Play, Upload, User, Star, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner. Fill in your details including name, email, and password.'
    },
    {
      category: 'getting-started',
      question: 'How do I watch movies?',
      answer: 'Browse our collection on the home page or use the "Browse" section. Click on any movie card to view details, then click the "Watch" button to start playing the full movie.'
    },
    {
      category: 'getting-started',
      question: 'How do I upload movies?',
      answer: 'First you have to become a creator. You can apply for creator status in your profile settings. Once approved, you will be able to upload movies.'
    },
    {
      category: 'watching',
      question: 'Why won\'t videos play automatically?',
      answer: 'For better user experience, videos only play when you click the "Trailer" or "Watch" buttons. This prevents unwanted playback and saves bandwidth.'
    },
    {
      category: 'watching',
      question: 'How do I control video playback?',
      answer: 'Use the custom controls that appear when you hover over the video: play/pause, skip forward/backward, volume control, and playback speed settings.'
    },
    {
      category: 'watching',
      question: 'How do I leave comments?',
      answer: 'Scroll down to the "Community Discussion" section. If you\'re signed in, you can type your message in the input field at the bottom and click the send button.'
    },
    {
      category: 'uploading',
      question: 'What file formats are supported?',
      answer: 'We support MP4 video files for both trailers and full movies. Thumbnails should be JPG or PNG images. Files are automatically saved to the Film folder.'
    },
    {
      category: 'uploading',
      question: 'How do I add movie details?',
      answer: 'When uploading, fill in the title, description, category, and year. You can also add cast information and select the appropriate genre.'
    },
    {
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Click on your profile picture or name in the top navigation, then select "Edit Profile". You can update your personal information, avatar, and description.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a reset link. Check your email for the verification code.'
    },
    {
      category: 'account',
      question: 'How do I view other users\' profiles?',
      answer: 'Click on any uploader\'s name in the movie details section. You\'ll be taken to their profile page where you can see their information.'
    },
    {
      category: 'features',
      question: 'What are the star ratings?',
      answer: 'Movies display star levels based on view counts: Level 1 (200+ views), Level 2 (500+ views), Level 3 (1000+ views), Level 4 (100,000+ views), Level 5 (500,000+ views).'
    },
    {
      category: 'features',
      question: 'How does the newsletter work?',
      answer: 'Subscribe to our newsletter on the home page to receive updates about new movie releases. We send emails to keep you informed about the latest gospel content.'
    },
    {
      category: 'features',
      question: 'Can I save movies for later?',
      answer: 'Yes! Click the bookmark icon on any movie card to save it to your personal collection. Access your saved movies from your profile.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'watching', name: 'Watching Movies', icon: Play },
    { id: 'uploading', name: 'Uploading Content', icon: Upload },
    { id: 'account', name: 'Account & Profile', icon: User },
    { id: 'features', name: 'Features', icon: Star }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle size={40} className="text-[#d4af37]" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Help Center</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of PureScreen
          </p>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-[#d4af37] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No results found for your search.</p>
              <p className="text-gray-500">Try different keywords or browse all topics.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp size={20} className="text-[#d4af37] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

       
      </div>
    </div>
  );
};

export default HelpCenter;