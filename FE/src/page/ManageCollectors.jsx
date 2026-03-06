import React, { useState, useEffect } from 'react';
import { userAPI } from '../Axios/Axios';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const emptyForm = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  gender: '',
  yob: '',
};

const ManageCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add user modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState({ open: false, collector: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCollectors();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getCollectors();
      setCollectors(res.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collectors');
    } finally {
      setLoading(false);
    }
  };

  // â”€â”€â”€ Add user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validateForm = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.yob && (isNaN(formData.yob) || formData.yob < 1900 || formData.yob > new Date().getFullYear()))
      errs.yob = 'Invalid year of birth';
    return errs;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    try {
      setAddLoading(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        gender: formData.gender || undefined,
        yob: formData.yob ? Number(formData.yob) : undefined,
      };
      await userAPI.createCollector(payload);
      setSuccess('Collector added successfully!');
      setShowAddModal(false);
      setFormData(emptyForm);
      setFormErrors({});
      fetchCollectors();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to create collector' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData(emptyForm);
    setFormErrors({});
  };

  // â”€â”€â”€ Delete (soft) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDeactivate = async () => {
    if (!deleteModal.collector) return;
    try {
      setDeleteLoading(true);
      await userAPI.deactivateCollector(deleteModal.collector._id);
      setSuccess(`"${deleteModal.collector.username || deleteModal.collector.email}" has been deactivated.`);
      setDeleteModal({ open: false, collector: null });
      fetchCollectors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate user');
      setDeleteModal({ open: false, collector: null });
    } finally {
      setDeleteLoading(false);
    }
  };

  // â”€â”€â”€ Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredCollectors = collectors.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.username?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.fullName?.toLowerCase().includes(s)
    );
  });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div>
      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
          <p style={{ color: '#DC2626' }} className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
          <p style={{ color: '#16A34A' }} className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>Manage Collectors</h1>
          <p className="text-sm mt-2" style={{ color: '#2D2D2D' }}>
            View and manage all members/collectors in the system
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B7355' }}
        >
          + Add Collector
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username, email, or full name..."
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
          style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', color: '#1A1A1A' }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>Loading collectors...</p>
        </div>
      ) : collectors.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#2D2D2D' }}>
          <p>No collectors found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E8E4DE' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#FEFAF6', borderBottom: '2px solid #E8E4DE' }}>
                {['Username', 'Email', 'Full Name', 'Gender', 'Year of Birth', 'Auth Provider', 'Status', 'Joined Date', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left font-semibold" style={{ color: '#1A1A1A' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCollectors.map((collector, index) => (
                <tr
                  key={collector._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FEFAF6',
                    borderBottom: '1px solid #E8E4DE',
                    opacity: collector.active === false ? 0.6 : 1,
                  }}
                >
                  <td className="px-6 py-4" style={{ color: '#1A1A1A' }}>
                    <span className="font-medium">{collector.username || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#1A1A1A' }}>{collector.email}</td>
                  <td className="px-6 py-4" style={{ color: '#1A1A1A' }}>{collector.fullName || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor:
                          collector.gender === 'Male' ? '#DBEAFE' : collector.gender === 'Female' ? '#FCE7F3' : '#E5E7EB',
                        color:
                          collector.gender === 'Male' ? '#1E40AF' : collector.gender === 'Female' ? '#BE185D' : '#374151',
                      }}
                    >
                      {collector.gender || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#1A1A1A' }}>{collector.yob || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: collector.authProvider === 'google' ? '#DCFCE7' : '#F3E8FF',
                        color: collector.authProvider === 'google' ? '#16A34A' : '#7E22CE',
                      }}
                    >
                      {collector.authProvider}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: collector.active === false ? '#FEE2E2' : '#DCFCE7',
                        color: collector.active === false ? '#DC2626' : '#16A34A',
                      }}
                    >
                      {collector.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: '#2D2D2D' }}>{formatDate(collector.createdAt)}</td>
                  <td className="px-6 py-4">
                    {collector.active !== false && (
                      <button
                        onClick={() => setDeleteModal({ open: true, collector })}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#DC2626' }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Info */}
      {!loading && collectors.length > 0 && (
        <div className="mt-4 text-sm" style={{ color: '#2D2D2D' }}>
          Showing {filteredCollectors.length} of {collectors.length} collectors
        </div>
      )}

      {/* â”€â”€ Add Collector Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg shadow-lg w-full max-w-lg"
            style={{ backgroundColor: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#E8E4DE' }}>
              <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>Add New Collector</h2>
              <button
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSubmit} className="px-6 py-4 space-y-4">
              {formErrors.submit && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2' }}>
                  <p className="text-sm" style={{ color: '#DC2626' }}>{formErrors.submit}</p>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                  Username <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F5F1EB', border: `1px solid ${formErrors.username ? '#DC2626' : '#E8E4DE'}`, color: '#1A1A1A' }}
                  placeholder="Enter username"
                />
                {formErrors.username && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{formErrors.username}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                  Email <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F5F1EB', border: `1px solid ${formErrors.email ? '#DC2626' : '#E8E4DE'}`, color: '#1A1A1A' }}
                  placeholder="Enter email"
                />
                {formErrors.email && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>
                  Password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F5F1EB', border: `1px solid ${formErrors.password ? '#DC2626' : '#E8E4DE'}`, color: '#1A1A1A' }}
                  placeholder="Minimum 6 characters"
                />
                {formErrors.password && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{formErrors.password}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', color: '#1A1A1A' }}
                  placeholder="Enter full name"
                />
              </div>

              {/* Gender + YOB */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{ backgroundColor: '#F5F1EB', border: '1px solid #E8E4DE', color: '#1A1A1A' }}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>Year of Birth</label>
                  <input
                    type="number"
                    name="yob"
                    value={formData.yob}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{ backgroundColor: '#F5F1EB', border: `1px solid ${formErrors.yob ? '#DC2626' : '#E8E4DE'}`, color: '#1A1A1A' }}
                    placeholder="e.g. 1995"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {formErrors.yob && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{formErrors.yob}</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: '#E8E4DE' }}>
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  disabled={addLoading}
                  className="px-5 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: '#E8E4DE', color: '#1A1A1A' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#8B7355' }}
                >
                  {addLoading ? 'Adding...' : 'Add Collector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* â”€â”€ Delete Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        title="Deactivate Collector"
        message={`Are you sure you want to deactivate "${deleteModal.collector?.username || deleteModal.collector?.email}"? The account will be set to inactive but remain in the database.`}
        onConfirm={handleDeactivate}
        onCancel={() => setDeleteModal({ open: false, collector: null })}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ManageCollectors;
