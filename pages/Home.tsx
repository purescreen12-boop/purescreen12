
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieSlider from '../components/MovieSlider';
import Footer from '../components/Footer';
import { Movie, User } from '../types';
import emailjs from '@emailjs/browser';
import { Mail, Send, User as UserIcon, MessageSquare, ChevronDown, ChevronUp, Flame, Sparkles, TrendingUp, Film, ArrowRight } from 'lucide-react';

interface HomeProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  user: User | null;
}


const Home: React.FC<HomeProps> = ({ movies, onMovieSelect, user }) => {
  const form = useRef<HTMLFormElement>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Determine pricing based on user location with all countries supported
  const getPricingAnswer = () => {
    if (!user) {
      return 'Watch PureScreen on your smartphone, tablet, laptop, or streaming device, all for one fixed monthly fee. Sign up/in to see our pricing plans.';
    }
    
    const currency = user.currency || 'USD';
    
    // Pricing map - special rate for Nigeria, standard rate for all others
    const pricingMap: Record<string, { monthly: string; yearly: string }> = {
      NGN: { monthly: '₦2,000/month', yearly: '₦20,000/year' },
    };

    const pricing = pricingMap[currency] || { monthly: '$5.99/month', yearly: '$59.99/year' };
    
    return `Watch PureScreen on your smartphone, tablet, laptop, or streaming device, all for one fixed monthly fee. Plans range from ${pricing.monthly} and ${pricing.yearly}, But free watch for all users for now.`;
  };

  // Create dynamic FAQs with pricing based on user location
  const dynamicFaqs = [
    {
      category: 'getting-started',
      question: 'What is PureScreen?',
      answer: 'PureScreen is a faith-based streaming platform dedicated to sharing uplifting content through digital media. Our goal is to hand one voice, this platform connect us together.'
    },
   /* {
      category: 'getting-started',
      question: 'How much does PureScreen Cost?',
      answer: getPricingAnswer()
    },*/
    {
      category: 'getting-started',
      question: 'Where can i watch?',
      answer: 'Watch anywhere, anytime. Sign in with your account to watch instantly pureScreen.site from your personal computer or  on any internet-connected device that offers the smartphones, tablets, streaming media players.'
    },
    /*{
      category: 'watching',
      question: 'How do i cancel?',
      answer: 'You can cancel your subscription anytime through your account settings. No cancellation fees apply, and you will continue to have access to PureScreen until the end of your current billing cycle.'
    },*/
    {
      category: 'watching',
      question: 'What can i watch on PureScreen?',
      answer: 'PureScreen offers a wide variety of faith-based movies, documentaries, and series, movies, kid shows, stage productions that inspire and uplift. Our library includes content for all ages.'
    },
  ];

  const filteredFAQs = dynamicFaqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        alert('Thank you for your inquiry! We will get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        alert(`Failed to send inquiry: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending contact:', error);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  const sortedMovies = [...movies].sort((a, b) => parseInt(b.id) - parseInt(a.id));
  const trendingMovies = sortedMovies.slice(0, 10); // First 10 for trending slider

const sendEmail = (e: React.FormEvent) => {
  e.preventDefault();

  if (form.current) {
    emailjs.sendForm('service_g797igi', 'template_srziwew', form.current, 'x4bGaZakvtoCsyXqz').then(
      () => {
        alert('Message sent successfully!');
        form.current?.reset();
      },
      (error: any) => {
        alert('Failed to send message, please try again. ' + error.text);
      }
    );
  }
};
  



  return (
    <>
      {/* Background with Image */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Image with Gradients */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-parallax"
          style={{ backgroundImage:
             `url('/wet-monstera-deliciosa-plant-leaves-garden.jpg')`, backgroundPosition: '40% 50%' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t  via-transparent to-transparent" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="space-y-16">
            <Hero user={user} />

      {/* Trending Now Slider Section */}
      <section className="px-4 md:px-16">
        <div className="mb-8">
          {/* Section Header with Icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#9a7f1f]">
              <Flame size={20} className="text-black" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Trending Now</h2>
          </div>
          <p className="text-gray-400 text-sm ml-13 md:ml-13">New releaes just for you...</p>
        </div>

        {/* Movie Slider with Navigation */}
        <MovieSlider movies={trendingMovies} onMovieSelect={onMovieSelect} />

        {/* Explore More Button */}
        <div className="flex justify-center mt-8">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#ffed4e] text-black font-bold rounded-lg hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105"
          >
            Explore More
            <ArrowRight size={20} />
          </Link>
        </div>

      </section>


      {/* FAQ Section */}
      <section className="px-4 md:px-16">
        <div className="mb-8">
          {/* Section Header with Icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#ffed4e]">
              <MessageSquare size={20} className="text-black" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
          </div>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-3 md:space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-r from-white/5 to-white/5 rounded-2xl border border-white/10">
              <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">No results found for your search.</p>
              <p className="text-gray-500 text-sm">Try different keywords or browse all topics.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-r from-white/5 to-white/5 border border-white/10 hover:border-[#d4af37]/50 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-semibold pr-4 group-hover:text-[#d4af37] transition-colors">{faq.question}</span>
                  <div className="flex-shrink-0 text-[#d4af37] transition-transform duration-300">
                    {expandedFAQ === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4 border-t border-white/10">
                    <p className="text-gray-300 leading-relaxed text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 md:px-16">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 via-transparent to-[#d4af37]/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40"></div>
          
          {/* Content */}
          <div className="relative px-6 md:px-12 py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#d4af37] to-[#ffed4e] mx-auto mb-6">
                <Send size={24} className="text-black" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Get in Touch</h2>
              <p className="text-gray-300 text-sm md:text-base mb-8">Have questions about our platform? Want to partner with us? We'd love to hear from you!</p>

              <a
                href="mailto:gospelscreentv@gmail.com?subject=Enquires and Requests&body=Hi, I'd like to get in touch."
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#ffed4e] text-black font-bold rounded-lg hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105"
              >
                <Mail size={18} />
                Send Message
              </a>
            </div>
          </div>
        </div>
      </section>
          </div>
        </div>
      </div>

    <Footer />
    </>
  );
};

export default Home;
