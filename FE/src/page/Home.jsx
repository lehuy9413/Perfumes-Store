import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { perfumeAPI } from '../services/api';
import Footer from '../components/Footer';

// Custom hook: Intersection Observer for scroll animations
const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Custom hook: Animated number counter
const useCounter = (end, duration = 2000, startCounting = false) => {
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
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration, startCounting]);

  return count;
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredPerfumes, setFeaturedPerfumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);

  // Scroll animation refs
  const [statsRef, statsVisible] = useScrollAnimation();
  const [featuredRef, featuredVisible] = useScrollAnimation();
  const [brandsRef, brandsVisible] = useScrollAnimation();

  // Animated counters for stats
  const fragranceCount = useCounter(100, 2000, statsVisible);
  const brandCount = useCounter(50, 2000, statsVisible);
  const customerCount = useCounter(1000, 2500, statsVisible);

  // Navigate to perfume details and scroll to top
  const handlePerfumeClick = (perfumeId) => {
    window.scrollTo(0, 0);
    navigate(`/perfume/${perfumeId}`);
  };

  useEffect(() => {
    // Fetch brands and load featured perfumes
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch brands
        const brandsRes = await perfumeAPI.getAllBrands();
        setBrands(brandsRes.data || []);
        
        // Fetch all perfumes and filter featured ones
        const perfumesRes = await perfumeAPI.getAllPerfumes({});
        const featured = (perfumesRes.data || []).filter(p => p.isFeatured === true);
        setFeaturedPerfumes(featured);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEFAF6' }}>
      {/* Hero Section */}
      <div className="py-16 overflow-hidden relative" style={{ 
        backgroundColor: '#F5F1EB',
        backgroundImage: 'url("https://png.pngtree.com/background/20230517/original/pngtree-some-bottles-of-perfume-beside-a-mirror-picture-image_2639470.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(245, 241, 235, 0.65)',
          zIndex: 1
        }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="hero-badge text-xs font-semibold inline-block px-6 py-2 rounded-full mb-4 tracking-widest" style={{ backgroundColor: '#E8E4DE', color: '#C9A55C' }}>LUXURY FRAGRANCES</p>
          <h1 className="hero-title text-6xl font-bold mb-4 leading-tight">
            <span style={{ color: '#1A1A1A' }}>Discover Your</span><br />
            <span style={{ color: '#C9A55C' }}>Signature Scent</span>
          </h1>
          <p className="hero-subtitle max-w-2xl mx-auto mb-12" style={{ color: '#2D2D2D' }}>
            Explore our exquisite collection of luxury perfumes from the world's most prestigious brands. 
            Find the perfect fragrance that defines your unique style and personality.
          </p>
          
          {/* Statistics */}
          <div ref={statsRef} className={`hero-stats grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto`}>
            <div>
              <h3 className="stat-number text-4xl font-bold" style={{ color: '#C9A55C' }}>{fragranceCount}+</h3>
              <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>PREMIUM FRAGRANCES</p>
            </div>
            <div>
              <h3 className="stat-number text-4xl font-bold" style={{ color: '#C9A55C' }}>{brandCount}+</h3>
              <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>LUXURY BRANDS</p>
            </div>
            <div>
              <h3 className="stat-number text-4xl font-bold" style={{ color: '#C9A55C' }}>{customerCount}+</h3>
              <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>HAPPY CUSTOMERS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Featured Products Section */}
        {!isLoading && (
          <div ref={featuredRef} className="mb-16">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold inline-block px-6 py-2 rounded-full mb-4 tracking-widest" style={{ backgroundColor: '#E8E4DE', color: '#C9A55C' }}>FEATURED COLLECTION</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A1A1A' }}>Featured Fragrances</h2>
            </div>

            {featuredPerfumes.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ color: '#2D2D2D' }}>No featured fragrances available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredPerfumes.map((perfume) => (
                  <div
                    key={perfume._id}
                    className="perfume-card group cursor-pointer flex flex-col"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE6E0', transition: 'border-color 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A55C'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#EAE6E0'}
                    onClick={() => handlePerfumeClick(perfume._id)}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ paddingTop: '128%', backgroundColor: '#F7F4F0' }}>
                      {perfume.uri ? (
                        <img
                          src={perfume.uri}
                          alt={perfume.perfumeName}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
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
                        <div className="absolute top-3 left-3">
                          <span style={{
                            fontSize: '8px', fontWeight: '600', letterSpacing: '2.5px',
                            textTransform: 'uppercase', color: '#FFFFFF',
                            backgroundColor: 'rgba(0,0,0,0.55)', padding: '4px 10px',
                            backdropFilter: 'blur(6px)', display: 'inline-block'
                          }}>
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div
                        className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ background: 'linear-gradient(to top, rgba(10,8,6,0.62) 0%, transparent 55%)', paddingBottom: '22px' }}
                      >
                        <span style={{
                          fontSize: '9px', letterSpacing: '3.5px', textTransform: 'uppercase',
                          color: '#FFFFFF', fontWeight: '500',
                          borderBottom: '1px solid rgba(255,255,255,0.55)', paddingBottom: '2px'
                        }}>
                          Discover
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '8.5px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C9A55C', marginBottom: '6px' }}>
                          {perfume.brand?.brandName || '—'}
                        </p>
                        <h3 style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A', lineHeight: '1.4', letterSpacing: '0.2px', marginBottom: '4px' }}>
                          {perfume.perfumeName}
                        </h3>
                        {perfume.concentration && (
                          <p style={{ fontSize: '9px', color: '#AAA', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                            {perfume.concentration}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F0EDE8' }}>
                        <span style={{ fontSize: '14px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '0.5px' }}>
                          ${perfume.price || 150}
                        </span>
                        {perfume.targetAudience && (
                          <span style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#BBBBBB', fontWeight: '500' }}>
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
                style={{
                  display: 'inline-block',
                  padding: '13px 48px',
                  background: 'transparent',
                  border: '1px solid #B8943F',
                  color: '#B8943F',
                  fontSize: '11px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#B8943F';
                  e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#B8943F';
                }}
              >
                View All Fragrances
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="text-2xl" style={{ color: '#2D2D2D' }}>Loading fragrances...</div>
            {/* Skeleton loader cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                  <div className="loading-shimmer h-64" />
                  <div className="p-4 space-y-3">
                    <div className="loading-shimmer h-4 rounded w-1/3" />
                    <div className="loading-shimmer h-5 rounded w-2/3" />
                    <div className="loading-shimmer h-8 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Section */}
        <div ref={brandsRef} className="py-12 border-t" style={{ borderColor: '#E8E4DE' }}>
          <div className={`mb-12 text-center animate-on-scroll ${brandsVisible ? 'visible' : ''}`}>
            <p className="text-xs font-semibold inline-block px-6 py-2 rounded-full mb-4 tracking-widest" style={{ backgroundColor: '#E8E4DE', color: '#C9A55C' }}>OUR SELECTION</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A1A1A' }}>Our Brands</h2>
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: '#2D2D2D' }}>No brands available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {brands.map((brand, index) => (
                <button
                  key={brand._id || brand.brandName}
                  onClick={() => navigate(`/perfumes?brand=${brand.brandName}`)}
                  className={`card-animate brand-card rounded-lg border border-gray-200 hover:border-[#C9A55C] hover:shadow-md transition-all overflow-hidden group ${brandsVisible ? 'visible' : ''}`}
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    transitionDelay: brandsVisible ? `${100 + index * 80}ms` : '0ms'
                  }}
                >
                  {brand.uri && (
                    <div className="relative h-40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F5F1EB' }}>
                      <img 
                        src={brand.uri} 
                        alt={brand.brandName}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=' + brand.brandName;
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-center" style={{ color: '#1A1A1A' }}>
                      {brand.brandName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;