import React, { useState, useEffect } from 'react';
import { brandAPI } from '../Axios/Axios';
import Modal from '../components/Modal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const ManageBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [brandForm, setBrandForm] = useState({ brandName: '', uri: '' });
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await brandAPI.getAllBrands();
      setBrands(res.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    if (brand) {
      setBrandForm({ brandName: brand.brandName, uri: brand.uri || '' });
      setEditingBrandId(brand._id);
    } else {
      setBrandForm({ brandName: '', uri: '' });
      setEditingBrandId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setBrandForm({ brandName: '', uri: '' });
    setEditingBrandId(null);
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!brandForm.brandName.trim()) {
      setError('Brand name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const brandData = {
        brandName: brandForm.brandName,
        uri: brandForm.uri
      };
      if (editingBrandId) {
        await brandAPI.updateBrand(editingBrandId, brandData, token);
        setSuccess('Brand updated successfully');
      } else {
        await brandAPI.createBrand(brandData, token);
        setSuccess('Brand created successfully');
      }
      handleCloseModal();
      fetchBrands();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = (id) => {
    setBrandToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!brandToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await brandAPI.deleteBrand(brandToDelete, token);
      setSuccess('Brand deleted successfully');
      setShowDeleteModal(false);
      setBrandToDelete(null);
      fetchBrands();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting brand');
      setShowDeleteModal(false);
      setBrandToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 rounded-lg animate-pulse" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <p style={{ color: '#DC2626' }} className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-lg animate-pulse" style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
          <p style={{ color: '#16A34A' }} className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>Manage Brands</h1>
          <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>View and manage perfume brands</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#C9A55C' }}
        >
          + Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>No brands found. Add your first brand!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}
            >
              {/* Brand Image */}
              {brand.uri && (
                <div className="relative h-40 bg-cover bg-center overflow-hidden" style={{ backgroundColor: '#F5F1EB' }}>
                  <img 
                    src={brand.uri} 
                    alt={brand.brandName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x160?text=' + brand.brandName;
                    }}
                  />
                </div>
              )}

              {/* Brand Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  {brand.brandName}
                </h3>

                <p className="text-sm mb-6" style={{ color: '#2D2D2D' }}>
                  Luxury perfume brand offering premium fragrances and exclusive collections.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(brand)}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      color: '#C9A55C',
                      backgroundColor: '#FEFAF6',
                      border: '2px solid #C9A55C'
                    }}
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand._id)}
                    className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand Modal */}
      <Modal
        isOpen={showModal}
        title={editingBrandId ? 'Edit Brand' : 'Add New Brand'}
        onClose={handleCloseModal}
        isLoading={loading}
      >
        <form onSubmit={handleAddBrand} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Brand Name *
            </label>
            <input
              type="text"
              value={brandForm.brandName}
              onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
              placeholder="Enter brand name"
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#F5F1EB',
                border: '1px solid #E8E4DE',
                color: '#1A1A1A'
              }}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Image URL (Brand Logo)
            </label>
            <input
              type="url"
              value={brandForm.uri}
              onChange={(e) => setBrandForm({ ...brandForm, uri: e.target.value })}
              placeholder="https://example.com/logo.jpg"
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#F5F1EB',
                border: '1px solid #E8E4DE',
                color: '#1A1A1A'
              }}
              disabled={loading}
            />
            {brandForm.uri && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#F5F1EB' }}>
                <p className="text-xs mb-2" style={{ color: '#2D2D2D' }}>Preview:</p>
                <img 
                  src={brandForm.uri} 
                  alt="Brand logo preview" 
                  className="h-20 object-cover rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#C9A55C' }}
              disabled={loading}
            >
              {editingBrandId ? 'Update Brand' : 'Add Brand'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-6 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: '#E8E4DE',
                color: '#1A1A1A'
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setBrandToDelete(null);
        }}
        isLoading={loading}
      />
    </div>
  );
};

export default ManageBrands;
