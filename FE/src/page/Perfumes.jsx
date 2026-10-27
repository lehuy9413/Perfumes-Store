import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { perfumeAPI } from '../services/api';
import { ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';

const Perfumes = () => {
  const navigate = useNavigate();
  const [perfumes, setPerfumes] = useState([]);
  const [totalPerfumes, setTotalPerfumes] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [searchParams] = useSearchParams();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [brandOpen, setBrandOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  // Navigate to perfume details and scroll to top
  const handlePerfumeClick = (perfumeId) => {
    window.scrollTo(0, 0);
    navigate(`/perfume/${perfumeId}`);
  };

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch brands on component mount
    const fetchBrands = async () => {
      try {
        const res = await perfumeAPI.getAllBrands();
        setBrands(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };
    
    // Fetch total perfumes count
    const fetchTotalCount = async () => {
      try {
        const res = await perfumeAPI.getAllPerfumes({});
        setTotalPerfumes(Array.isArray(res.data) ? res.data.length : 0);
      } catch (err) {
        console.error('Error fetching total count:', err);
      }
    };
    
    fetchBrands();
    fetchTotalCount();
  }, []);

  useEffect(() => {
    // Get parameters from URL
    const querySearch = searchParams.get('search') || '';
    const queryCategory = searchParams.get('category') || '';
    const queryBrand = searchParams.get('brand') || '';
    
    setSearch(querySearch);
    setSelectedCategory(queryCategory);
    
    if (queryBrand) {
      setSelectedBrands([queryBrand]);
    }
    // Don't clear brands/price when searching — allow combined search + filter
  }, [searchParams]);

  // Fetch when URL params change OR when manual filters (brands/price) change
  useEffect(() => {
    fetchPerfumes();
  }, [searchParams, selectedBrands, priceRange]);

  const fetchPerfumes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {};
      
      // Read search & category directly from URL (not state) to avoid stale data on mount
      const currentSearch = searchParams.get('search') || '';
      const currentCategory = searchParams.get('category') || '';
      
      // Send search term
      if (currentSearch) {
        params.search = currentSearch;
      }
      
      // Send price range
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 10000) params.maxPrice = priceRange[1];
      
      // Send brand filter - only first selected brand for backend
      if (selectedBrands.length > 0) {
        params.brand = selectedBrands[0];
      }
      
      // Send category/audience filter
      if (currentCategory && currentCategory !== 'brands') {
        const categoryMap = {
          'men': 'Men',
          'women': 'Women',
          'unisex': 'Unisex'
        };
        if (categoryMap[currentCategory.toLowerCase()]) {
          params.targetAudience = categoryMap[currentCategory.toLowerCase()];
        }
      }
      
      const res = await perfumeAPI.getAllPerfumes(params);
      let filteredPerfumes = Array.isArray(res.data) ? res.data : [];

      // Additional client-side filtering for multiple brands
      if (selectedBrands.length > 1) {
        filteredPerfumes = filteredPerfumes.filter(perfume => 
          selectedBrands.includes(perfume.brand?.brandName)
        );
      }

      setPerfumes(filteredPerfumes);
    } catch (err) {
      console.error('Error fetching perfumes:', err);
      setError('Failed to load perfumes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandToggle = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) 
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEFAF6' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Brands Grid */}
        {selectedCategory === 'brands' && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {brands.map((brand) => (
              <button
                key={brand._id || brand.brandName}
                onClick={() => navigate(`/perfumes?brand=${brand.brandName}`)}
                className="rounded-lg border border-gray-200 hover:border-[#C9A55C] hover:shadow-md transition-all overflow-hidden group"
                style={{ backgroundColor: '#FFFFFF' }}
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

        {/* Products with Sidebar */}
        {selectedCategory !== 'brands' && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Sidebar Filters - Sticky */}
            <div className="md:col-span-1 sticky top-40 h-fit">
              {/* Filter Header */}
              <div style={{ borderBottom: '1px solid #1A1A1A', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A' }}>
                  Filters {(selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000) ? `(${selectedBrands.length + (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0)})` : ''}
                </span>
                {(selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000 || search) && (
                  <button onClick={() => { setSelectedBrands([]); setPriceRange([0, 10000]); if (search) navigate('/perfumes'); }}
                    style={{ fontSize: '11px', color: '#888', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.5px' }}>
                    Clear all
                  </button>
                )}
              </div>

              {/* Selected chips */}
              {(selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 0' }}>
                  {selectedBrands.map(b => (
                    <span key={b} onClick={() => handleBrandToggle(b)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px', border: '1px solid #1A1A1A', borderRadius: '20px', cursor: 'pointer', color: '#1A1A1A', letterSpacing: '0.3px' }}>
                      {b} <span style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: 1 }}>×</span>
                    </span>
                  ))}
                  {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
                    <span onClick={() => setPriceRange([0, 10000])} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px', border: '1px solid #1A1A1A', borderRadius: '20px', cursor: 'pointer', color: '#1A1A1A', letterSpacing: '0.3px' }}>
                      ${priceRange[0]}–${priceRange[1]} <span style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: 1 }}>×</span>
                    </span>
                  )}
                </div>
              )}

              {/* Search info */}
              {search && (
                <div style={{ padding: '10px 0', borderBottom: '1px solid #E8E4DE' }}>
                  <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Results for</p>
                  <p style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '600' }}>"{search}"</p>
                </div>
              )}

              {/* Brand Filter Accordion */}
              <div style={{ borderBottom: '1px solid #D8D3CC' }}>
                <button onClick={() => setBrandOpen(o => !o)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A' }}>Brands</span>
                  <span style={{ fontSize: '20px', fontWeight: '300', color: '#1A1A1A', lineHeight: 1 }}>{brandOpen ? '−' : '+'}</span>
                </button>
                {brandOpen && (
                  <div style={{ paddingBottom: '16px' }}>
                    {brands.map((brand) => (
                      <div key={brand._id} onClick={() => handleBrandToggle(brand.brandName)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', cursor: 'pointer', borderBottom: '1px solid #F0EDE8' }}>
                        <span style={{ fontSize: '13px', letterSpacing: '0.2px', color: selectedBrands.includes(brand.brandName) ? '#1A1A1A' : '#555', fontWeight: selectedBrands.includes(brand.brandName) ? '600' : '400' }}>
                          {brand.brandName}
                        </span>
                        {selectedBrands.includes(brand.brandName) && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7L5.5 10.5L12 3.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Filter Accordion */}
              <div style={{ borderBottom: '1px solid #D8D3CC' }}>
                <button onClick={() => setPriceOpen(o => !o)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A' }}>Price</span>
                  <span style={{ fontSize: '20px', fontWeight: '300', color: '#1A1A1A', lineHeight: 1 }}>{priceOpen ? '−' : '+'}</span>
                </button>
                {priceOpen && (
                  <div style={{ paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '13px', color: '#444' }}>${priceRange[0].toLocaleString()}</span>
                      <span style={{ fontSize: '13px', color: '#444' }}>${priceRange[1].toLocaleString()}</span>
                    </div>
                    <div style={{ position: 'relative', height: '20px', marginBottom: '8px' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: '#E8E4DE', transform: 'translateY(-50%)' }} />
                      <div style={{ position: 'absolute', top: '50%', height: '2px', backgroundColor: '#1A1A1A', transform: 'translateY(-50%)', left: `${(priceRange[0] / 10000) * 100}%`, right: `${100 - (priceRange[1] / 10000) * 100}%` }} />
                      <input type="range" min="0" max="10000" value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 50), priceRange[1]])}
                        style={{ position: 'absolute', width: '100%', top: 0, height: '20px', opacity: 0, cursor: 'pointer', zIndex: 2, margin: 0 }} />
                      <input type="range" min="0" max="10000" value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 50)])}
                        style={{ position: 'absolute', width: '100%', top: 0, height: '20px', opacity: 0, cursor: 'pointer', zIndex: 2, margin: 0 }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Products Grid */}
            <div className="md:col-span-3 lg:col-span-4">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-16">
                  <div style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#999', fontWeight: '400' }}>
                    Loading fragrances…
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {perfumes.map((perfume) => (
                    <div
                      key={perfume._id}
                      className="group cursor-pointer flex flex-col"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE6E0', transition: 'border-color 0.3s ease' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A55C'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#EAE6E0'}
                      onClick={() => handlePerfumeClick(perfume._id)}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden" style={{ paddingTop: '128%', backgroundColor: '#F7F4F0' }}>
                        <img
                          src={perfume.uri}
                          alt={perfume.perfumeName}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Perfume'; }}
                        />

                        {/* Featured Badge */}
                        {perfume.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <span style={{
                              fontSize: '8px',
                              fontWeight: '600',
                              letterSpacing: '2.5px',
                              textTransform: 'uppercase',
                              color: '#FFFFFF',
                              backgroundColor: 'rgba(0,0,0,0.55)',
                              padding: '4px 10px',
                              backdropFilter: 'blur(6px)',
                              display: 'inline-block'
                            }}>
                              Featured
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div
                          className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                          style={{
                            background: 'linear-gradient(to top, rgba(10,8,6,0.62) 0%, transparent 55%)',
                            paddingBottom: '22px'
                          }}
                        >
                          <span style={{
                            fontSize: '9px',
                            letterSpacing: '3.5px',
                            textTransform: 'uppercase',
                            color: '#FFFFFF',
                            fontWeight: '500',
                            borderBottom: '1px solid rgba(255,255,255,0.55)',
                            paddingBottom: '2px'
                          }}>
                            Discover
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{
                            fontSize: '8.5px',
                            fontWeight: '700',
                            letterSpacing: '2.5px',
                            textTransform: 'uppercase',
                            color: '#C9A55C',
                            marginBottom: '6px'
                          }}>
                            {perfume.brand?.brandName || '—'}
                          </p>
                          <h3 style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#1A1A1A',
                            lineHeight: '1.4',
                            letterSpacing: '0.2px',
                            marginBottom: '4px'
                          }}>
                            {perfume.perfumeName}
                          </h3>
                          {perfume.concentration && (
                            <p style={{
                              fontSize: '9px',
                              color: '#AAA',
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase'
                            }}>
                              {perfume.concentration}
                            </p>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #F0EDE8'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '0.5px' }}>
                            ${perfume.price || 150}
                          </span>
                          {perfume.targetAudience && (
                            <span style={{
                              fontSize: '8px',
                              letterSpacing: '2px',
                              textTransform: 'uppercase',
                              color: '#BBBBBB',
                              fontWeight: '500'
                            }}>
                              {perfume.targetAudience}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && perfumes.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4" style={{ color: '#E8E4DE' }}>🔍</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D2D2D' }}>No perfumes found</h3>
                  <p style={{ color: '#2D2D2D' }}>Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-30"
          style={{ backgroundColor: '#C9A55C' }}
          title="Back to Top"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default Perfumes;
