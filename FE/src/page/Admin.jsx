import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ManageBrands from './ManageBrands';
import ManagePerfumes from './ManagePerfumes';
import ManageCollectors from './ManageCollectors';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activePage, setActivePage] = useState('brands');

  // Double check for admin role
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  return (
    <div style={{ backgroundColor: '#FEFAF6', minHeight: '100vh' }}>
      {/* Header with Navigation */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E4DE' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>Admin Dashboard</h1>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-lg font-semibold transition-all"
              style={{ backgroundColor: '#E8E4DE', color: '#1A1A1A' }}
            >
              ← Back to Home
            </button>
          </div>

          {/* Navbar */}
          <div className="flex gap-4 border-b" style={{ borderColor: '#E8E4DE' }}>
            <button
              onClick={() => setActivePage('brands')}
              className={`px-6 py-3 font-semibold transition-all ${
                activePage === 'brands' ? 'border-b-2' : ''
              }`}
              style={{
                color: activePage === 'brands' ? '#C9A55C' : '#2D2D2D',
                borderBottomColor: activePage === 'brands' ? '#C9A55C' : 'transparent'
              }}
            >
              Manage Brands
            </button>
            <button
              onClick={() => setActivePage('perfumes')}
              className={`px-6 py-3 font-semibold transition-all ${
                activePage === 'perfumes' ? 'border-b-2' : ''
              }`}
              style={{
                color: activePage === 'perfumes' ? '#C9A55C' : '#2D2D2D',
                borderBottomColor: activePage === 'perfumes' ? '#C9A55C' : 'transparent'
              }}
            >
              Manage Perfumes
            </button>
            <button
              onClick={() => setActivePage('collectors')}
              className={`px-6 py-3 font-semibold transition-all ${
                activePage === 'collectors' ? 'border-b-2' : ''
              }`}
              style={{
                color: activePage === 'collectors' ? '#C9A55C' : '#2D2D2D',
                borderBottomColor: activePage === 'collectors' ? '#C9A55C' : 'transparent'
              }}
            >
              Manage Collectors
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {activePage === 'brands' && <ManageBrands />}
        {activePage === 'perfumes' && <ManagePerfumes />}
        {activePage === 'collectors' && <ManageCollectors />}
      </div>
    </div>
  );
};

export default Admin;
