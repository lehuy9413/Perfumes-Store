import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, User } from 'lucide-react';

const Header = () => {
    const { user, logout } = React.useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const [searchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setSearchOpen(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            // Navigate to perfumes page with ONLY search param
            // This clears all previous filters
            navigate(`/perfumes?search=${encodeURIComponent(search)}`);
            setSearch('');
            setSearchOpen(false);
        }
    };

    const handleCategoryFilter = (category) => {
        navigate(`/perfumes?category=${category}`);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Get current category from URL params
        const category = searchParams.get('category') || '';
        setActiveCategory(category);
    }, [searchParams]);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav 
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#EAE6E0]' 
                    : 'bg-white border-b border-[#EAE6E0]'
            }`}
        >
            <div className="container mx-auto px-4">
                {/* Main Header */}
                <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'}`}>
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold tracking-wider flex-shrink-0 group transition-transform duration-300 hover:scale-105">
                        L'<span style={{ color: '#C9A55C' }} className="transition-colors duration-300 group-hover:text-[#B8943F]">ESSENCE</span>
                    </Link>

                    {/* Middle Navigation - Category Links */}
                    <div className="hidden md:flex items-center space-x-10 flex-1 justify-center px-8">
                        <button
                            onClick={() => handleCategoryFilter('brands')}
                            className={`luxury-nav-link text-sm font-semibold tracking-widest transition-colors py-1 ${activeCategory === 'brands' ? 'active text-[#C9A55C]' : 'text-[#1A1A1A] hover:text-[#C9A55C]'}`}
                        >
                            BRANDS
                        </button>
                        <button
                            onClick={() => handleCategoryFilter('men')}
                            className={`luxury-nav-link text-sm font-semibold tracking-widest transition-colors py-1 ${activeCategory === 'men' ? 'active text-[#C9A55C]' : 'text-[#1A1A1A] hover:text-[#C9A55C]'}`}
                        >
                            MEN
                        </button>
                        <button
                            onClick={() => handleCategoryFilter('women')}
                            className={`luxury-nav-link text-sm font-semibold tracking-widest transition-colors py-1 ${activeCategory === 'women' ? 'active text-[#C9A55C]' : 'text-[#1A1A1A] hover:text-[#C9A55C]'}`}
                        >
                            WOMEN
                        </button>
                        <button
                            onClick={() => handleCategoryFilter('unisex')}
                            className={`luxury-nav-link text-sm font-semibold tracking-widest transition-colors py-1 ${activeCategory === 'unisex' ? 'active text-[#C9A55C]' : 'text-[#1A1A1A] hover:text-[#C9A55C]'}`}
                        >
                            UNISEX
                        </button>
                    </div>

                    {/* Right Side - Icons */}
                    <div className="flex items-center" style={{ gap: '24px' }}>

                        {/* Search Icon */}
                        <div className="relative" ref={searchRef}>
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: searchOpen ? '#C9A55C' : '#1A1A1A', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                onMouseLeave={e => e.currentTarget.style.color = searchOpen ? '#C9A55C' : '#1A1A1A'}
                                title="Search"
                            >
                                <Search strokeWidth={1.4} className="w-5 h-5" />
                            </button>

                            {searchOpen && (
                                <form onSubmit={handleSearch} className="absolute right-0 top-full z-50" style={{ marginTop: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE', padding: '16px', width: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                                    <div className="flex" style={{ gap: '8px', borderBottom: '1px solid #1A1A1A' }}>
                                        <input
                                            type="text"
                                            placeholder="Search fragrances…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', letterSpacing: '1px', padding: '8px 0', backgroundColor: 'transparent', color: '#1A1A1A' }}
                                            autoFocus
                                        />
                                        <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1A1A1A' }}>
                                            <Search strokeWidth={1.4} className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* User / Login Icon */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={toggleDropdown}
                                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: dropdownOpen ? '#C9A55C' : '#1A1A1A', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                    onMouseLeave={e => e.currentTarget.style.color = dropdownOpen ? '#C9A55C' : '#1A1A1A'}
                                    title={user.fullName || 'Account'}
                                >
                                    <User strokeWidth={1.4} className="w-5 h-5" />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full z-50" style={{ marginTop: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE', width: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #F0EDE8' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', color: '#1A1A1A' }}>{user.fullName || 'User'}</p>
                                            <p style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>{user.email}</p>
                                        </div>
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                            style={{ display: 'block', padding: '11px 16px', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F0EDE8', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
                                        >
                                            Profile
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setDropdownOpen(false)}
                                                style={{ display: 'block', padding: '11px 16px', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F0EDE8', transition: 'color 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
                                            >
                                                Admin
                                            </Link>
                                        )}
                                        <button onClick={handleLogout}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                style={{ background: 'none', border: 'none', padding: '4px', display: 'flex', alignItems: 'center', color: '#1A1A1A', transition: 'color 0.2s', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#C9A55C'}
                                onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
                                title="Sign in"
                            >
                                <User strokeWidth={1.4} className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;