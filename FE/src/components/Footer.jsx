import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ backgroundColor: '#F5F1EB', borderColor: '#E8E4DE' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              L'<span style={{ color: '#C9A55C' }}>ESSENCE</span>
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              Discover the finest fragrances from around the world. Experience luxury, elegance, and sophistication in every bottle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-sm transition hover:text-[#C9A55C]"
                  style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/perfumes')}
                  className="text-sm transition hover:text-[#C9A55C]"
                  style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  Shop
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/perfumes?category=brands')}
                  className="text-sm transition hover:text-[#C9A55C]"
                  style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  Brands
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-sm transition hover:text-[#C9A55C]"
                  style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  My Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Contact Us</a></li>
              <li><a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Shipping Info</a></li>
              <li><a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Returns</a></li>
              <li><a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>Follow Us</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-sm font-semibold transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Facebook</a>
              <a href="#" className="text-sm font-semibold transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Instagram</a>
              <a href="#" className="text-sm font-semibold transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Twitter</a>
            </div>
            <p className="text-sm" style={{ color: '#666' }}>
              Email: <a href="mailto:info@lessence.com" className="font-semibold hover:text-[#C9A55C] transition" style={{ color: '#C9A55C' }}>info@lessence.com</a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#E8E4DE', margin: '24px 0' }}></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p style={{ color: '#666', fontSize: '14px' }}>
            © {currentYear} L'Essence. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Privacy Policy</a>
            <a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Terms & Conditions</a>
            <a href="#" className="text-sm transition hover:text-[#C9A55C]" style={{ color: '#666' }}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
