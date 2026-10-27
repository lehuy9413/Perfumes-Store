import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Users,
  ArrowRight,
  Eye,
  ShieldCheck,
  Package,
  Droplets,
  ArrowUp,
  ChevronDown
} from 'lucide-react';
import { perfumeAPI } from '../services/api';
import Footer from '../components/Footer';

// Custom hook: Intersection Observer for scroll animations
const useScrollAnimation = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Custom hook: Animated number counter
const useCounter = (end, duration = 1800, startCounting = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;
    let startTime = null;
    let animationId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration, startCounting]);

  return count;
};

const marqueeBrands = [
  'CHANEL', 'DIOR', 'TOM FORD', 'CREED',
  'YVES SAINT LAURENT', 'LE LABO', 'BYREDO',
  'MAISON FRANCIS KURKDJIAN', 'HERMÈS', 'BACCARAT ROUGE',
  'JO MALONE', 'DIPTYQUE', 'PARFUMS DE MARLY', 'KILIAN PARIS'
];

const features = [
  {
    icon: ShieldCheck,
    title: '100% Authentic Flacons',
    desc: 'Guaranteed genuine fragrances sourced directly from prestigious perfume houses in Paris & Grasse.'
  },
  {
    icon: Sparkles,
    title: 'Master Note Blends',
    desc: 'Rare artisanal notes and master perfumery formulated for sublime projection and lasting sillage.'
  },
  {
    icon: Package,
    title: 'Bespoke Packaging',
    desc: 'Each flacon is wrapped in signature luxury gift boxes adorned with elegant golden wax seals.'
  },
  {
    icon: Droplets,
    title: 'Discovery Samples',
    desc: 'Complimentary curation of two luxury sample vials with every full bottle purchase.'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredPerfumes, setFeaturedPerfumes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll animation refs
  const [heroStatsRef, heroStatsVisible] = useScrollAnimation(0.2);
  const [featuredRef, featuredVisible] = useScrollAnimation(0.1);
  const [featuresRef, featuresVisible] = useScrollAnimation(0.15);
  const [brandsRef, brandsVisible] = useScrollAnimation(0.1);

  // Animated counters for stats
  const fragranceCount = useCounter(100, 2000, heroStatsVisible);
  const brandCount = useCounter(50, 1800, heroStatsVisible);
  const customerCount = useCounter(1000, 2400, heroStatsVisible);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigate to perfume details and scroll to top
  const handlePerfumeClick = (perfumeId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/perfume/${perfumeId}`);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch brands
        const brandsRes = await perfumeAPI.getAllBrands();
        const brandsData = Array.isArray(brandsRes.data) ? brandsRes.data : [];
        setBrands(brandsData);

        // Fetch all perfumes and filter featured ones
        const perfumesRes = await perfumeAPI.getAllPerfumes({});
        const perfumesData = Array.isArray(perfumesRes.data) ? perfumesRes.data : [];
        const featured = perfumesData.filter(p => p.isFeatured === true);
        setFeaturedPerfumes(featured);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load fragrances. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter featured perfumes by category
  const filteredPerfumes = featuredPerfumes.filter(p => {
    if (selectedCategory === 'all') return true;
    return p.targetAudience?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FEFAF6' }}>

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden py-8 md:py-10 min-h-[calc(100vh-64px)] flex flex-col justify-center"
        style={{ backgroundColor: '#F5F1EB' }}
      >
        {/* Animated Background Image with Slow Breathing Zoom */}
        <div 
          className="hero-bg-zoom absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://png.pngtree.com/background/20230517/original/pngtree-some-bottles-of-perfume-beside-a-mirror-picture-image_2639470.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.96)'
          }}
        />

        {/* Ambient Overlay with Warm Mist Gradient */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(254, 250, 246, 0.65) 0%, rgba(245, 241, 235, 0.88) 100%)'
          }}
        />

        {/* Floating Golden Fragrance Dust / Particles */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="particle-1 absolute w-2 h-2 rounded-full bg-[#C9A55C]/40 blur-[1px] top-1/4 left-1/5" />
          <div className="particle-2 absolute w-3 h-3 rounded-full bg-[#D8B467]/35 blur-[2px] top-1/3 right-1/4" />
          <div className="particle-3 absolute w-2 h-2 rounded-full bg-[#C9A55C]/50 blur-[1px] bottom-1/3 left-1/3" />
          <div className="particle-4 absolute w-3 h-3 rounded-full bg-[#B8943F]/30 blur-[1.5px] top-2/3 right-1/6" />
          <div className="particle-5 absolute w-2 h-2 rounded-full bg-[#D8B467]/45 blur-[1px] bottom-1/4 left-2/3" />
          <div className="particle-6 absolute w-2.5 h-2.5 rounded-full bg-[#C9A55C]/35 blur-[1px] top-1/6 right-1/3" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 text-center relative z-20 max-w-4xl my-auto">
          
          {/* Badge */}
          <div className="hero-badge inline-block mb-2.5">
            <span 
              className="badge-pulse inline-flex items-center gap-2 text-[10px] md:text-[11px] font-semibold px-5 py-1.5 rounded-full tracking-[0.22em] uppercase"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                color: '#A87E38',
                border: '1px solid rgba(201, 165, 92, 0.4)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(201, 165, 92, 0.15)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A55C]" />
              Haute Parfumerie Collection
            </span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 leading-[1.12] tracking-tight">
            <span style={{ color: '#1A1A1A' }}>Discover Your</span><br />
            <span className="gold-shimmer-text">Signature Scent</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="hero-subtitle max-w-xl mx-auto mb-6 text-sm md:text-base leading-relaxed font-light"
            style={{ color: '#3A3835' }}
          >
            Explore our curated sanctuary of rare, opulent perfumes crafted by the world’s most prestigious fragrance houses. Immerse yourself in an aura of unforgettable elegance.
          </p>

          {/* CTA Action Buttons */}
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-7">
            <button
              onClick={() => scrollToSection('featured-collection')}
              className="btn-luxury-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 text-xs font-semibold tracking-[0.18em] uppercase shadow-md cursor-pointer"
            >
              <span>Explore Featured Flacons</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollToSection('brands-section')}
              className="btn-luxury-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-semibold tracking-[0.18em] uppercase cursor-pointer"
            >
              <span>Prestige Houses</span>
            </button>
          </div>

          {/* Statistics Grid */}
          <div 
            ref={heroStatsRef}
            className="hero-stats grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 max-w-2xl mx-auto"
          >
            <div 
              className="p-3 md:p-3.5 rounded-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(232, 228, 222, 0.85)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Sparkles className="w-4 h-4 text-[#C9A55C]" />
                <h3 className="stat-number text-2xl md:text-3xl font-bold" style={{ color: '#A87E38' }}>
                  {fragranceCount}+
                </h3>
              </div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#555' }}>
                Exclusive Fragrances
              </p>
            </div>

            <div 
              className="p-3 md:p-3.5 rounded-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(232, 228, 222, 0.85)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Award className="w-4 h-4 text-[#C9A55C]" />
                <h3 className="stat-number text-2xl md:text-3xl font-bold" style={{ color: '#A87E38' }}>
                  {brandCount}+
                </h3>
              </div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#555' }}>
                Prestige Brands
              </p>
            </div>

            <div 
              className="p-3 md:p-3.5 rounded-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(232, 228, 222, 0.85)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Users className="w-4 h-4 text-[#C9A55C]" />
                <h3 className="stat-number text-2xl md:text-3xl font-bold" style={{ color: '#A87E38' }}>
                  {customerCount}+
                </h3>
              </div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase" style={{ color: '#555' }}>
                Happy Connoisseurs
              </p>
            </div>
          </div>

          {/* Floating Scroll Down Indicator */}
          <div className="mt-5 hidden md:block">
            <button
              onClick={() => scrollToSection('featured-collection')}
              className="floating-bounce inline-flex flex-col items-center gap-1 text-xs text-[#8A847C] hover:text-[#C9A55C] transition-colors cursor-pointer"
            >
              <span className="tracking-[0.18em] uppercase text-[9px] font-medium">Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#C9A55C]" />
            </button>
          </div>

        </div>
      </div>

      {/* Infinite Luxury Brands Marquee Ticker */}
      <div
        className="marquee-container py-3.5 border-y"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#EDE8E1'
        }}
      >
        <div className="marquee-track flex items-center">
          {[...marqueeBrands, ...marqueeBrands].map((brandName, idx) => (
            <div key={idx} className="flex items-center mx-6 flex-shrink-0">
              <span
                className="text-[12px] font-medium tracking-[0.28em] uppercase transition-colors duration-300 hover:text-[#C9A55C] cursor-default"
                style={{ color: '#6A655F', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {brandName}
              </span>
              <span className="mx-6 text-[10px] text-[#C9A55C]">✦</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Featured Fragrances Section */}
        <section id="featured-collection" ref={featuredRef} className="mb-24 scroll-mt-24">

          {/* Section Header */}
          <div className={`mb-10 text-center animate-on-scroll ${featuredVisible ? 'visible' : ''}`}>
            <p
              className="text-xs font-semibold inline-block px-6 py-2 rounded-full mb-3 tracking-widest uppercase"
              style={{ backgroundColor: '#EFEBE4', color: '#A87E38' }}
            >
              Featured Selection
            </p>



            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              {[
                { id: 'all', label: 'All Fragrances' },
                { id: 'men', label: 'For Men' },
                { id: 'women', label: 'For Women' },
                { id: 'unisex', label: 'Unisex' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`text-xs font-semibold tracking-[0.16em] uppercase px-5 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${selectedCategory === tab.id
                    ? 'bg-[#C9A55C] text-white shadow-md -translate-y-0.5'
                    : 'bg-white text-[#555] border border-[#EAE6E0] hover:border-[#C9A55C] hover:text-[#C9A55C]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-[#EAE6E0] bg-white">
                  <div className="loading-shimmer h-72" />
                  <div className="p-4 space-y-3">
                    <div className="loading-shimmer h-3.5 rounded w-1/3" />
                    <div className="loading-shimmer h-5 rounded w-3/4" />
                    <div className="loading-shimmer h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && (
            <>
              {filteredPerfumes.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#EAE6E0] p-8 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-[#777] mb-4">No fragrances found in this category.</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs uppercase font-semibold tracking-wider text-[#C9A55C] underline underline-offset-4"
                  >
                    View all featured items
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredPerfumes.map((perfume, index) => (
                    <div
                      key={perfume._id}
                      className={`perfume-card card-animate group cursor-pointer flex flex-col ${featuredVisible ? 'visible' : ''}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAE6E0',
                        transitionDelay: featuredVisible ? `${Math.min(index * 70, 500)}ms` : '0ms'
                      }}
                      onClick={() => handlePerfumeClick(perfume._id)}
                    >
                      {/* Image Area */}
                      <div className="relative overflow-hidden" style={{ paddingTop: '128%', backgroundColor: '#F7F4F0' }}>
                        {perfume.uri ? (
                          <img
                            src={perfume.uri}
                            alt={perfume.perfumeName}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                            loading="lazy"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Perfume'; }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#E8E4DE' }}>
                            <span style={{ color: '#999', fontSize: '12px' }}>No Image</span>
                          </div>
                        )}

                        {/* Featured Badge */}
                        {perfume.isFeatured && (
                          <div className="absolute top-3 left-3 z-10">
                            <span
                              className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white px-2.5 py-1 rounded-sm"
                              style={{
                                backgroundColor: 'rgba(26, 26, 26, 0.75)',
                                backdropFilter: 'blur(6px)',
                                border: '1px solid rgba(255,255,255,0.15)'
                              }}
                            >
                              Featured
                            </span>
                          </div>
                        )}

                        {/* Concentration Badge */}
                        {perfume.concentration && (
                          <div className="absolute top-3 right-3 z-10">
                            <span
                              className="text-[8.5px] font-semibold tracking-[0.18em] uppercase text-[#A87E38] px-2 py-0.5 rounded-sm"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(201, 165, 92, 0.3)'
                              }}
                            >
                              {perfume.concentration}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay with Discover CTA */}
                        <div
                          className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          style={{
                            background: 'linear-gradient(to top, rgba(18, 14, 10, 0.72) 0%, rgba(18, 14, 10, 0.2) 45%, transparent 100%)',
                            paddingBottom: '20px'
                          }}
                        >
                          <span
                            className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-white font-medium px-4 py-2 rounded-full border border-white/60 bg-black/40 backdrop-blur-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D8B467]" />
                            Discover Flacon
                          </span>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A55C] mb-1.5 truncate">
                            {perfume.brand?.brandName || 'Haute Parfumerie'}
                          </p>
                          <h3
                            className="text-[14px] font-medium text-[#1A1A1A] leading-snug tracking-tight mb-1 group-hover:text-[#A87E38] transition-colors duration-200 line-clamp-1"
                          >
                            {perfume.perfumeName}
                          </h3>
                          {perfume.volume && (
                            <p className="text-[11px] text-[#888] tracking-wider font-light">
                              {perfume.volume}
                            </p>
                          )}
                        </div>

                        {/* Price & Target Audience */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0EDE8]">
                          <span className="text-base font-semibold text-[#1A1A1A] tracking-tight">
                            ${perfume.price || 150}
                          </span>
                          {perfume.targetAudience && (
                            <span
                              className="text-[9px] font-medium tracking-[0.16em] uppercase px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#F5F1EB', color: '#6A655F' }}
                            >
                              {perfume.targetAudience}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View All Button */}
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/perfumes')}
                  className="btn-luxury-outline inline-flex items-center gap-3 px-10 py-4 text-xs font-semibold tracking-[0.25em] uppercase cursor-pointer"
                >
                  <span>View All Fragrances</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A55C]" />
                </button>
              </div>
            </>
          )}

        </section>

        {/* "The Art of Haute Parfumerie" Features Section */}
        <section
          ref={featuresRef}
          className="mb-24 py-16 px-6 md:px-12 rounded-xl"
          style={{
            backgroundColor: '#F8F4EE',
            border: '1px solid #ECE7DF'
          }}
        >
          <div className={`text-center max-w-2xl mx-auto mb-12 animate-on-scroll ${featuresVisible ? 'visible' : ''}`}>
            <p
              className="text-xs font-semibold inline-block px-6 py-2 rounded-full mb-3 tracking-widest uppercase"
              style={{ backgroundColor: '#EAE5DC', color: '#A87E38' }}
            >
              Why L'Essence
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#1A1A1A]">
              The Art of Luxury Perfumery
            </h2>
            <p className="text-sm text-[#666]">
              Every creation in our gallery embodies supreme craftsmanship, rare olfactory harmonies, and unmatched longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className={`feature-card card-animate p-6 rounded-lg bg-white border border-[#EAE6E0] flex flex-col items-center text-center ${featuresVisible ? 'visible' : ''}`}
                  style={{
                    transitionDelay: featuresVisible ? `${index * 90}ms` : '0ms'
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: '#FAF7F2',
                      border: '1px solid #EAE4D8'
                    }}
                  >
                    <IconComp className="w-6 h-6 text-[#C9A55C]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6A655F] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Prestige Brands Section */}
        <section id="brands-section" ref={brandsRef} className="py-12 border-t" style={{ borderColor: '#E8E4DE' }}>

          <div className={`mb-12 text-center animate-on-scroll ${brandsVisible ? 'visible' : ''}`}>
            <p
              className="text-xs font-semibold inline-block px-6 py-2 rounded-full mb-3 tracking-widest uppercase"
              style={{ backgroundColor: '#E8E4DE', color: '#A87E38' }}
            >
              Our Selection
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              Prestige Fragrance Houses
            </h2>
            <p className="max-w-xl mx-auto text-sm text-[#777]">
              Discover creations from master perfumers and heritage maisons revered worldwide.
            </p>
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#777]">
              No brands currently available
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {brands.map((brand, index) => (
                <button
                  key={brand._id || brand.brandName}
                  onClick={() => navigate(`/perfumes?brand=${encodeURIComponent(brand.brandName)}`)}
                  className={`brand-card card-animate rounded-lg border border-[#EAE6E0] overflow-hidden bg-white group cursor-pointer text-left ${brandsVisible ? 'visible' : ''}`}
                  style={{
                    transitionDelay: brandsVisible ? `${Math.min(index * 60, 400)}ms` : '0ms'
                  }}
                >
                  <div className="relative h-36 flex items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: '#FAF7F2' }}>
                    {brand.uri ? (
                      <img
                        src={brand.uri}
                        alt={brand.brandName}
                        className="max-h-24 max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=' + brand.brandName;
                        }}
                      />
                    ) : (
                      <span className="text-sm font-semibold tracking-wider text-[#A87E38]">
                        {brand.brandName}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 text-center border-t border-[#F0EDE8]">
                    <p className="font-semibold text-xs tracking-wider uppercase text-[#1A1A1A] group-hover:text-[#A87E38] transition-colors">
                      {brand.brandName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

        </section>

      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="btn-scroll-top fixed bottom-8 right-8 z-40 p-3.5 rounded-full bg-[#C9A55C] text-white shadow-xl hover:bg-[#B8943F] transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default Home;