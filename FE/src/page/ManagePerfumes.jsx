import React, { useState, useEffect } from 'react';
import { brandAPI, perfumeAPI } from '../Axios/Axios';
import Modal from '../components/Modal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const ManagePerfumes = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [perfumeToDelete, setPerfumeToDelete] = useState(null);
  const [perfumeForm, setPerfumeForm] = useState({
    perfumeName: '',
    price: '',
    concentration: '',
    uri: '',
    description: '',
    ingredients: '',
    volume: '',
    targetAudience: '',
    brand: '',
    isFeatured: false
  });
  const [imagePreview, setImagePreview] = useState('');
  const [editingPerfumeId, setEditingPerfumeId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBrands();
    fetchPerfumes();
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
      const res = await brandAPI.getAllBrands();
      setBrands(res.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const res = await perfumeAPI.getAllPerfumes({});
      setPerfumes(res.data || []);
    } catch (err) {
      console.error('Error fetching perfumes:', err);
      setError('Failed to load perfumes');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setPerfumeForm({ ...perfumeForm, uri: url });
    setImagePreview(url);
  };

  const handleOpenModal = (perfume = null) => {
    if (perfume) {
      setPerfumeForm({
        perfumeName: perfume.perfumeName,
        price: perfume.price || '',
        concentration: perfume.concentration || '',
        uri: perfume.uri || '',
        description: perfume.description || '',
        ingredients: perfume.ingredients || '',
        volume: perfume.volume || '',
        targetAudience: perfume.targetAudience || '',
        brand: perfume.brand?._id || '',
        isFeatured: perfume.isFeatured || false
      });
      setImagePreview(perfume.uri || '');
      setEditingPerfumeId(perfume._id);
    } else {
      setPerfumeForm({
        perfumeName: '',
        price: '',
        concentration: '',
        uri: '',
        description: '',
        ingredients: '',
        volume: '',
        targetAudience: '',
        brand: '',
        isFeatured: false
      });
      setImagePreview('');
      setEditingPerfumeId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPerfumeForm({
      perfumeName: '',
      price: '',
      concentration: '',
      uri: '',
      description: '',
      ingredients: '',
      volume: '',
      targetAudience: '',
      brand: '',
      isFeatured: false
    });
    setImagePreview('');
    setEditingPerfumeId(null);
  };

  const handleAddPerfume = async (e) => {
    e.preventDefault();
    if (!perfumeForm.perfumeName.trim() || !perfumeForm.brand) {
      setError('Perfume name and brand are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formData = {
        ...perfumeForm,
        price: parseFloat(perfumeForm.price) || 0
      };

      if (editingPerfumeId) {
        await perfumeAPI.updatePerfume(editingPerfumeId, formData, token);
        setSuccess('Perfume updated successfully');
      } else {
        await perfumeAPI.createPerfume(formData, token);
        setSuccess('Perfume created successfully');
      }
      handleCloseModal();
      fetchPerfumes();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving perfume');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerfume = (id) => {
    setPerfumeToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!perfumeToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await perfumeAPI.deletePerfume(perfumeToDelete, token);
      setSuccess('Perfume deleted successfully');
      setShowDeleteModal(false);
      setPerfumeToDelete(null);
      fetchPerfumes();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting perfume');
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
          <h1 className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>Manage Perfumes</h1>
          <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>View and manage fragrances</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#C9A55C' }}
        >
          + Add Perfume
        </button>
      </div>

      {/* Perfumes Grid */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>Loading perfumes...</p>
        </div>
      ) : perfumes.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>No perfumes found. Add your first perfume!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfumes.map((perfume) => (
            <div
              key={perfume._id}
              className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}
            >
              {/* Image */}
              {perfume.uri && (
                <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#F5F1EB' }}>
                  <img
                    src={perfume.uri}
                    alt={perfume.perfumeName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                  {perfume.perfumeName}
                </h3>
                <p className="text-sm mb-3" style={{ color: '#C9A55C' }}>
                  {perfume.brand?.brandName}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold" style={{ color: '#1A1A1A' }}>
                    ${perfume.price}
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E8E4DE', color: '#1A1A1A' }}>
                    {perfume.concentration}
                  </span>
                </div>

                <p className="text-xs mb-4" style={{ color: '#2D2D2D' }}>
                  {perfume.volume} • {perfume.targetAudience}
                </p>

                {perfume.description && (
                  <p className="text-xs mb-4" style={{ color: '#2D2D2D', maxHeight: '60px', overflow: 'hidden' }}>
                    {perfume.description}
                  </p>
                )}

                {perfume.isFeatured && (
                  <div className="mb-3 inline-block">
                    <span className="text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: '#C9A55C' }}>
                      ★ Featured
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(perfume)}
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
                    onClick={() => handleDeletePerfume(perfume._id)}
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

      {/* Perfume Modal */}
      <Modal
        isOpen={showModal}
        title={editingPerfumeId ? 'Edit Perfume' : 'Add New Perfume'}
        onClose={handleCloseModal}
        isLoading={loading}
      >
        <form onSubmit={handleAddPerfume} className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 rounded-lg overflow-hidden" style={{ height: '150px', backgroundColor: '#F5F1EB' }}>
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Image URL
            </label>
            <input
              type="url"
              value={perfumeForm.uri}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/perfume.jpg"
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: '#F5F1EB',
                border: '1px solid #E8E4DE',
                color: '#1A1A1A'
              }}
              disabled={loading}
            />
          </div>

          {/* Name and Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Perfume Name *
              </label>
              <input
                type="text"
                value={perfumeForm.perfumeName}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, perfumeName: e.target.value })}
                placeholder="Enter name"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Brand *
              </label>
              <select
                value={perfumeForm.brand}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, brand: e.target.value })}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Concentration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={perfumeForm.price}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Concentration
              </label>
              <input
                type="text"
                value={perfumeForm.concentration}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, concentration: e.target.value })}
                placeholder="Eau de Parfum"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Volume and Audience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Volume
              </label>
              <input
                type="text"
                value={perfumeForm.volume}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, volume: e.target.value })}
                placeholder="100ml"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                Target Audience
              </label>
              <input
                type="text"
                value={perfumeForm.targetAudience}
                onChange={(e) => setPerfumeForm({ ...perfumeForm, targetAudience: e.target.value })}
                placeholder="Women"
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: '#F5F1EB',
                  border: '1px solid #E8E4DE',
                  color: '#1A1A1A'
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
              Description
            </label>
            <textarea
              value={perfumeForm.description}
              onChange={(e) => setPerfumeForm({ ...perfumeForm, description: e.target.value })}
              placeholder="Describe the perfume"
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
              rows="3"
              style={{
                backgroundColor: '#F5F1EB',
                border: '1px solid #E8E4DE',
                color: '#1A1A1A'
              }}
              disabled={loading}
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={perfumeForm.isFeatured}
              onChange={(e) => setPerfumeForm({ ...perfumeForm, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: '#F5F1EB',
                border: '2px solid #C9A55C',
                cursor: 'pointer'
              }}
              disabled={loading}
            />
            <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer" style={{ color: '#1A1A1A' }}>
              Mark as Featured Product
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 text-sm"
              style={{ backgroundColor: '#C9A55C' }}
              disabled={loading}
            >
              {editingPerfumeId ? 'Update' : 'Add'} Perfume
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm"
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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Perfume"
        message="Are you sure you want to delete this perfume? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setPerfumeToDelete(null);
        }}
        isLoading={loading}
      />
    </div>
  );
};

export default ManagePerfumes;
