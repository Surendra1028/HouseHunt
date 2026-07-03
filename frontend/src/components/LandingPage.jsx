import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, 
  FaRegHeart, 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaMapMarkerAlt,
  FaArrowRight,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaUserPlus
} from 'react-icons/fa';




export default function LandingPage() {
  const navigate = useNavigate();
  const renderHeroTitle = (title) => {
    const words = title.split(' ');
    if (words.length <= 2) return title;
    const lastTwo = words.slice(-2).join(' ');
    const start = words.slice(0, -2).join(' ');
    return (
      <>
        {start}{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.2)]">
          {lastTwo}
        </span>
      </>
    );
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedType, setSelectedType] = useState('All');
  const propertyTypes = ['All', 'Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Loft', 'Cottage'];

  // Hero image lists
  const heroSlides = [
    {
      image: "/House pics/pic1.jpg",
      title: "Find Your Dream Rental Property",
      subtitle: "Comfort, Convenience & Class — All in One Place"
    },
    {
      image: "/House pics/pic2.jpg",
      title: "Discover Premium Living Spaces",
      subtitle: "Handpicked Luxury Rentals Tailored Just For You"
    },
    {
      image: "/House pics/pic3.jpg",
      title: "Seamless Renting Experience",
      subtitle: "Connect Directly with Trusted Landlords and Book Instantly"
    },
    {
      image: "/House pics/pic4.jpg",
      title: "A Place You Can Call Home",
      subtitle: "Find Rentals in the Most Vibrant & Premium Localities"
    }
  ];

  // Auto-run hero slider
  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(sliderTimer);
  }, [heroSlides.length]);

  // Change navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const nextHeroSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const featuredProperties = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      title: "Serene Haven Villa",
      city: "San Francisco",
      rent: 4500,
      beds: 4,
      baths: 3,
      area: 3200,
      type: "Villa"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      title: "Modern Luxury Apartment",
      city: "New York",
      rent: 3200,
      beds: 2,
      baths: 2,
      area: 1500,
      type: "Apartment"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      title: "Sunset Ridge Penthouse",
      city: "Los Angeles",
      rent: 5800,
      beds: 3,
      baths: 3.5,
      area: 2800,
      type: "Penthouse"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      title: "Oakridge Family Townhouse",
      city: "Seattle",
      rent: 2900,
      beds: 3,
      baths: 2.5,
      area: 1850,
      type: "Townhouse"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      title: "Urban Loft in Downtown",
      city: "Chicago",
      rent: 2200,
      beds: 1,
      baths: 1,
      area: 950,
      type: "Loft"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      title: "Charming Suburban Cottage",
      city: "Austin",
      rent: 2500,
      beds: 3,
      baths: 2,
      area: 1600,
      type: "Cottage"
    }
  ];

  const filteredProperties = selectedType === 'All' 
    ? featuredProperties 
    : featuredProperties.filter(p => p.type === selectedType);



  return (
    <div className="bg-[#090d16] text-[#f9fafb] min-h-screen font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* NAVIGATION BAR */}
      {/* Navbar Ambient Spotlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[60px] bg-gradient-to-r from-indigo-500/8 to-cyan-500/8 blur-3xl pointer-events-none z-40 rounded-full" />
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'py-5' : 'py-8'
      }`}>
        <div className={`max-w-7xl mx-auto px-6 flex justify-between items-center transition-all duration-500 ${
          isScrolled 
            ? 'max-w-6xl bg-[#111827]/75 backdrop-blur-xl border-t border-white/15 border-b border-white/5 border-x border-white/8 px-10 py-3.5 rounded-full shadow-[0_25px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(99,102,241,0.1)]' 
            : 'border-b border-white/0 py-2'
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-6 shadow-indigo-600/20">
              <FaHome className="text-white text-lg" />
            </div>
            <span className="font-heading text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:brightness-110 transition-all">
              HouseHunt
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#home" className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300 group">
              Home
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#properties" className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300 group">
              Properties
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#footer" className="relative text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300 group">
              Contact
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-5">
            {/* Login Button (Gradient Border morphing on hover) */}
            <button 
              onClick={() => navigate('/auth?mode=login')}
              className="relative p-[1px] rounded-full bg-gradient-to-r from-white/10 to-white/5 hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 bg-[length:200%_auto] hover:animate-gradient-flow transition-all duration-300 active:scale-95 cursor-pointer group shadow-[0_0_10px_rgba(255,255,255,0.01)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <div className="relative overflow-hidden px-6 py-2.5 rounded-full bg-[#090d16]/95 text-xs font-black tracking-widest uppercase text-gray-300 group-hover:text-white transition-all duration-300 flex items-center gap-2">
                {/* Shine Streak Effect */}
                <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-700 ease-out" />
                <FaUser className="text-xs text-indigo-400/80 group-hover:text-cyan-400 transition-colors duration-300 relative z-10" />
                <span className="relative z-10 group-hover:scale-102 transition-transform duration-300">Login</span>
              </div>
            </button>

            {/* Register Button (Gradient Border filling on hover) */}
            <button 
              onClick={() => navigate('/auth?mode=register')}
              className="relative p-[1px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-[length:200%_auto] animate-gradient-flow transition-all duration-300 active:scale-95 cursor-pointer group shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)]"
            >
              <div className="relative overflow-hidden px-7 py-2.5 rounded-full bg-[#090d16] group-hover:bg-transparent text-xs font-black tracking-widest uppercase text-white transition-all duration-300 flex items-center gap-2">
                {/* Shine Streak Effect */}
                <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-700 ease-out" />
                <FaUserPlus className="text-xs text-indigo-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                <span className="relative z-10 group-hover:scale-102 transition-transform duration-300">Register</span>
              </div>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-all duration-300 cursor-pointer"
          >
            <svg className={`w-6 h-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90 text-indigo-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-6 right-6 md:hidden bg-[#090d16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 z-40 flex flex-col gap-4 mt-2"
            >
              <div className="flex flex-col gap-4">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-indigo-400">Home</a>
                <a href="#properties" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-gray-300 hover:text-white transition-colors">Properties</a>
                <a href="#footer" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-gray-300 hover:text-white transition-colors">Contact</a>
                <hr className="border-white/5 my-1" />
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/auth?mode=login'); }}
                    className="flex-1 py-2.5 text-center rounded-lg bg-white/5 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/auth?mode=register'); }}
                    className="flex-1 py-2.5 text-center rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION / SLIDER */}
      <section id="home" className="relative h-screen w-full overflow-hidden">
        {/* Background images fade transition */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${heroSlides[activeSlide].image}')` }}
            />
          </AnimatePresence>
          {/* Dark elegant overlay */}
          <div className="absolute inset-0 bg-black/65 bg-gradient-to-t from-[#090d16] via-black/40 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full flex flex-col items-center justify-center text-center"
              >
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight font-heading">
                  {renderHeroTitle(heroSlides[activeSlide].title)}
                </h1>
                <p className="text-base sm:text-xl md:text-2xl text-gray-200/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                  {heroSlides[activeSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6 z-20 relative">
              {/* Button 1 (Explore Properties) */}
              <button 
                onClick={() => {
                  const target = document.getElementById('properties');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="relative overflow-hidden group w-full sm:w-auto px-10 py-5 text-sm font-black tracking-widest uppercase rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:via-indigo-400 hover:to-cyan-400 text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_10px_25px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.55)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
              >
                {/* Shine Streak Effect */}
                <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out" />
                
                <span className="relative z-10 flex items-center gap-2.5">
                  Explore Properties 
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>

              {/* Button 2 (Post Your Property) */}
              <button 
                onClick={() => navigate('/auth?mode=login&role=landlord')}
                className="relative overflow-hidden group w-full sm:w-auto px-10 py-5 text-sm font-black tracking-widest uppercase rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-white border border-indigo-500/20 hover:border-cyan-400/50 backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.2)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
              >
                {/* Shine Streak Effect */}
                <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out" />
                
                <span className="relative z-10">
                  Post Your Property
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom Navigation buttons */}
        <button 
          onClick={prevHeroSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg border border-white/10 bg-black/35 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
        >
          <FaChevronLeft className="text-sm" />
        </button>
        <button 
          onClick={nextHeroSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-lg border border-white/10 bg-black/35 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer"
        >
          <FaChevronRight className="text-sm" />
        </button>

        {/* Custom Pagination dots */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'bg-indigo-400 w-6' : 'bg-white/40 hover:bg-white'}`}
            />
          ))}
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => {
          const target = document.getElementById('properties');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }}>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Scroll Down</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1 h-1 rounded-full bg-indigo-400"
            />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section id="properties" className="pt-24 pb-8 px-6 max-w-7xl mx-auto relative" style={{ marginBottom: '40px' }}>
        {/* Glow decorative background elements */}
        <div className="absolute top-12 left-10 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none z-0" />
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
              Premium Listings
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-5 font-heading">
              Explore Our Premium Properties
            </h2>
            <p className="text-sm md:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light leading-relaxed text-center">
              Browse our curated collection of verified luxurious living spaces tailored specifically to fit your premium lifestyle.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 mx-auto mt-6 rounded-full" />
          </div>

          {/* Filtering Tabs Capsule */}
          <div className="w-full flex justify-center mb-16">
            <div className="max-w-3xl bg-white/[0.02] border border-white/5 rounded-full p-2 backdrop-blur-md shadow-2xl flex flex-wrap justify-center gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:scale-102'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={property.id}
                  className="relative bg-gradient-to-b from-[#111827]/60 to-[#0b0f19]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:border-indigo-500/35 group flex flex-col transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(99,102,241,0.1),0_0_40px_rgba(6,182,212,0.02)]"
                >
                  {/* Image & Badges */}
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    
                    {/* Property Type Badge */}
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[9px] text-indigo-300 border border-indigo-500/20 uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-lg">
                      {property.type}
                    </span>

                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#e11d48] transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                    >
                      {favorites[property.id] ? (
                        <FaHeart className="text-[#e11d48] text-xs animate-pulse" />
                      ) : (
                        <FaRegHeart className="text-gray-200 text-xs hover:scale-115 transition-transform" />
                      )}
                    </button>

                    {/* Rent Tag overlay */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-lg font-black text-white font-heading tracking-tight bg-gradient-to-r from-indigo-900/90 to-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.4)] flex items-baseline gap-0.5">
                        <span className="text-indigo-400 text-xs font-bold mr-0.5">$</span>
                        {property.rent}
                        <span className="text-[9px] font-normal text-slate-400 ml-0.5">/ mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="text-center">
                      <h3 className="text-base font-bold font-heading text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 transition-colors duration-300 truncate text-center">
                        {property.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1 mt-1 font-light">
                        <FaMapMarkerAlt className="text-indigo-400 text-xs" /> {property.city}
                      </p>
                      {/* Rating Component */}
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium">(5.0)</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/5">
                      {/* Specs Row Capsule track */}
                      <div className="flex items-center justify-around py-2 bg-[#090d16]/40 border border-white/5 rounded-xl mb-4 text-[11px] text-gray-300 shadow-inner">
                        <div className="flex items-center gap-1">
                          <FaBed className="text-indigo-400 text-xs" />
                          <span className="font-semibold text-white">{property.beds} <span className="font-light text-gray-400 text-[9px]">Beds</span></span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/5" />
                        <div className="flex items-center gap-1">
                          <FaBath className="text-indigo-400 text-xs" />
                          <span className="font-semibold text-white">{property.baths} <span className="font-light text-gray-400 text-[9px]">Baths</span></span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/5" />
                        <div className="flex items-center gap-1">
                          <FaRulerCombined className="text-indigo-400 text-xs" />
                          <span className="font-semibold text-white">{property.area} <span className="font-light text-gray-400 text-[9px]">sqft</span></span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => navigate('/auth?mode=login')}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 group/btn"
                      >
                        Book Inspection Now <FaArrowRight className="text-[10px] transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>
      {/* FOOTER */}
      <footer id="footer" className="bg-[#05080e] border-t border-white/5 px-10 md:px-20 lg:px-24 text-gray-400 relative overflow-hidden" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {/* Glow decorative backgrounds */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-6 relative z-10">
          
          {/* Column 1: Logo & Info - Spans 5 columns */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 cursor-pointer justify-center md:justify-start" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg hover:rotate-6 transition-transform duration-300">
                <FaHome className="text-white text-base" />
              </div>
              <span className="font-heading text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                HouseHunt
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-light pr-4 max-w-sm mx-auto md:mx-0">
              HouseHunt is a modern, role-based real estate platform providing premium tenants and trusted landlords a seamless environment for property management, scheduling, and billing.
            </p>
            <div className="flex gap-2.5 justify-center md:justify-start">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#1877f2] text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-0.5 shadow-sm hover:shadow-[#1877f2]/25">
                <FaFacebook className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#1da1f2] text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-0.5 shadow-sm hover:shadow-[#1da1f2]/25">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#e1306c] text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-0.5 shadow-sm hover:shadow-[#e1306c]/25">
                <FaInstagram className="text-sm" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#0077b5] text-white flex items-center justify-center transition-all duration-300 border border-white/5 hover:border-transparent hover:-translate-y-0.5 shadow-sm hover:shadow-[#0077b5]/25">
                <FaLinkedin className="text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links - Spans 3 columns */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start space-y-3 text-center md:text-left">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider flex flex-col items-center md:items-start">
              Quick Links
              <div className="w-6 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 mt-1" />
            </h4>
            <ul className="space-y-2 text-xs font-light pt-1 flex flex-col items-center md:items-start">
              <li><a href="#home" className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-300 flex items-center gap-1.5 justify-center md:justify-start">Home</a></li>
              <li><a href="#properties" className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-300 flex items-center gap-1.5 justify-center md:justify-start">Properties</a></li>
              <li><a href="/auth?mode=login" className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-300 flex items-center gap-1.5 justify-center md:justify-start">Tenant Portal</a></li>
              <li><a href="/auth?mode=login&role=landlord" className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-300 flex items-center gap-1.5 justify-center md:justify-start">Landlord Portal</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info - Spans 4 columns */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-3 text-center md:text-left">
            <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider flex flex-col items-center md:items-start">
              Contact Us
              <div className="w-6 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 mt-1" />
            </h4>
            <ul className="space-y-2.5 text-xs font-light pt-1 flex flex-col items-center md:items-start">
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
                  <FaEnvelope className="text-xs" />
                </span>
                <a href="mailto:support@househunt.com" className="text-gray-400 hover:text-white transition-colors">support@househunt.com</a>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
                  <FaPhoneAlt className="text-xs" />
                </span>
                <a href="tel:+91" className="text-gray-400 hover:text-white transition-colors font-mono">+91 123-4567</a>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
                  <FaMapMarkerAlt className="text-xs" />
                </span>
                <span className="text-gray-400 leading-relaxed">India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-slate-500 relative z-10">
          <p>© 2026 HouseHunt Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
