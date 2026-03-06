import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../Axios/Axios';
import { AuthContext } from '../context/AuthContext';
import { perfumeAPI, feedbackAPI } from '../services/api';

const PerfumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [userFeedback, setUserFeedback] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchPerfumeDetails = async () => {
      try {
        // Scroll to top when loading new perfume
        window.scrollTo(0, 0);
        
        // Reset messages when data is re-fetched
        setSubmitError(null);
        setSuccessMessage(null);
        setIsEditingFeedback(false);
        
        setLoading(true);
        const response = await axios.get(`/perfumes/${id}`);
        setPerfume(response.data);

        // Fetch all feedbacks for this perfume (public - no auth needed)
        console.log('Fetching feedbacks for perfume:', id);
        try {
          const feedbackRes = await feedbackAPI.getPerfumeFeedbacks(id);
          console.log('Feedbacks fetched:', feedbackRes.data);
          setAllFeedbacks(feedbackRes.data || []);

          // Check if user already rated this perfume
          if (user && feedbackRes.data && feedbackRes.data.length > 0) {
            const userFb = feedbackRes.data.find(fb => fb.userId._id === user._id);
            if (userFb) {
              console.log('User feedback found:', userFb);
              setUserFeedback(userFb);
              setReviewForm({
                rating: userFb.rating,
                comment: userFb.comment || '',
              });
            } else {
              setUserFeedback(null);
              setReviewForm({ rating: 0, comment: '' });
            }
          } else {
            setUserFeedback(null);
            setReviewForm({ rating: 0, comment: '' });
          }
        } catch (fbErr) {
          console.warn('Error fetching feedbacks:', fbErr);
          setAllFeedbacks([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching perfume details:', err);
        setError('Failed to fetch perfume details.');
        setLoading(false);
      }
    };

    fetchPerfumeDetails();
  }, [id, user]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    // ✅ Only members can submit feedback
    if (!user) {
      setSubmitError('Please login to submit a review');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (user.role !== 'member') {
      setSubmitError('⛔ Only members can leave feedback. Admin accounts cannot rate products.');
      return;
    }

    if (userFeedback && !isEditingFeedback) {
      setSubmitError('You already rated this perfume once. Each product can only be rated once per account.');
      return;
    }

    if (!reviewForm.rating) {
      setSubmitError('Please select a rating');
      return;
    }

    try {
      if (isEditingFeedback && userFeedback) {
        // Update existing feedback
        const response = await feedbackAPI.updateFeedback(userFeedback._id, {
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        const updatedFeedback = response.data;
        setUserFeedback(updatedFeedback);
        setReviewForm({
          rating: updatedFeedback.rating,
          comment: updatedFeedback.comment || '',
        });
        setSuccessMessage('Review updated successfully!');
      } else {
        // Create new feedback
        const response = await feedbackAPI.createFeedback({
          perfumeId: id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        });
        const newFeedback = response.data;
        setUserFeedback(newFeedback);
        setReviewForm({
          rating: newFeedback.rating,
          comment: newFeedback.comment || '',
        });
        setSuccessMessage('Review submitted successfully!');
      }
      
      setIsEditingFeedback(false);
      
      // Refresh feedbacks without full page reload
      try {
        const feedbackRes = await feedbackAPI.getPerfumeFeedbacks(id);
        setAllFeedbacks(feedbackRes.data || []);
      } catch (refreshErr) {
        console.warn('Error refreshing feedbacks:', refreshErr);
      }

      // Auto clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleEditFeedback = () => {
    setIsEditingFeedback(true);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditingFeedback(false);
    setSubmitError(null);
    setSuccessMessage(null);
    if (userFeedback) {
      setReviewForm({
        rating: userFeedback.rating,
        comment: userFeedback.comment || '',
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await feedbackAPI.deleteFeedback(feedbackId);
      setDeleteConfirm(null);
      setSuccessMessage('Review deleted successfully!');
      
      // If user deleted their own feedback, reset form
      if (userFeedback && userFeedback._id === feedbackId) {
        setUserFeedback(null);
        setReviewForm({ rating: 0, comment: '' });
        setIsEditingFeedback(false);
      }
      
      // Refresh feedbacks
      const feedbackRes = await feedbackAPI.getPerfumeFeedbacks(id);
      setAllFeedbacks(feedbackRes.data || []);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setSubmitError(err.response?.data?.message || 'Failed to delete review.');
      setDeleteConfirm(null);
      setTimeout(() => setSubmitError(null), 3000);
    }
  };

  const getConcentrationDisplay = (conc) => {
    return { label: conc || 'N/A' };
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#FEFAF6' }}>
      <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#AAA' }}>Loading…</p>
    </div>
  );
  if (error) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#FEFAF6' }}>
      <p style={{ fontSize: '12px', color: '#999' }}>{error}</p>
    </div>
  );

  const calculateAverageRating = () => {
    if (allFeedbacks.length === 0) return 0;
    const sum = allFeedbacks.reduce((acc, feedback) => acc + (feedback.rating || 0), 0);
    return (sum / allFeedbacks.length).toFixed(1);
  };

  // Luxury minimal star renderer
  const renderLuxuryStars = (rating, interactive = false, onSelect = null, disabled = false) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onSelect && onSelect(star)}
          disabled={!interactive || disabled}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: interactive && !disabled ? 'pointer' : 'default',
            fontSize: '18px',
            color: (interactive ? reviewForm.rating : rating) >= star ? '#C9A55C' : '#D8D3CC',
            transition: 'color 0.15s',
            lineHeight: 1
          }}
        >★</button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FEFAF6' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#AAA', marginBottom: '40px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1A1A'}
          onMouseLeave={e => e.currentTarget.style.color = '#AAA'}
        >
          ← Collections
        </button>

        {perfume && (
          <>
            {/* ── Product Panel ── */}
            <div style={{ backgroundColor: '#FFFFFF', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: '64px' }} className="grid-cols-1 md:grid-cols-2">

              {/* Image */}
              <div style={{ backgroundColor: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', minHeight: '480px' }}>
                <img
                  src={perfume.uri}
                  alt={perfume.perfumeName}
                  style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Perfume'; }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Brand */}
                  <p style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A55C', marginBottom: '14px' }}>
                    {perfume.brand?.brandName || '—'}
                  </p>

                  {/* Name */}
                  <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1A1A1A', letterSpacing: '-0.5px', lineHeight: '1.25', marginBottom: '20px' }}>
                    {perfume.perfumeName}
                  </h1>

                  {/* Price */}
                  <p style={{ fontSize: '22px', fontWeight: '400', color: '#1A1A1A', letterSpacing: '0.5px', marginBottom: '24px' }}>
                    ${perfume.price}
                  </p>

                  {/* Description */}
                  {perfume.description && (
                    <p style={{ fontSize: '13px', lineHeight: '1.75', color: '#777', fontWeight: '300', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #EAE6E0' }}>
                      {perfume.description}
                    </p>
                  )}

                  {/* Concentration — full-width highlight */}
                  {perfume.concentration && (
                    <div style={{ marginBottom: '28px' }}>
                      <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '10px' }}>Concentration</p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#1A1A1A', padding: '10px 20px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A55C' }}>
                          {perfume.concentration}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Specs grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 20px', marginBottom: '32px' }}>
                    <div>
                      <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '8px' }}>Volume</p>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{perfume.volume} ml</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '8px' }}>For</p>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{perfume.targetAudience}</p>
                    </div>
                    {perfume.ingredients && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '8px' }}>Ingredients</p>
                        <p style={{ fontSize: '12px', color: '#888', lineHeight: '1.6', fontWeight: '300' }}>{perfume.ingredients}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button
                  style={{
                    width: '100%', padding: '16px', border: 'none', cursor: 'pointer',
                    backgroundColor: '#1A1A1A', color: '#FFFFFF',
                    fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase',
                    transition: 'background-color 0.25s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C9A55C'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1A1A1A'}
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* ── Reviews ── */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE6E0', padding: '52px 48px' }}>

              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #EAE6E0', paddingBottom: '24px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', color: '#1A1A1A', margin: 0 }}>Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderLuxuryStars(Math.round(calculateAverageRating()))}
                  <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '300' }}>
                    {calculateAverageRating()} &mdash; {allFeedbacks.length} {allFeedbacks.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>

              {/* Admin notice */}
              {user && user.role === 'admin' && (
                <div style={{ padding: '14px 18px', border: '1px solid #EAE6E0', marginBottom: '32px', fontSize: '11px', color: '#AAA', letterSpacing: '0.3px' }}>
                  Admin view — only members may leave reviews.
                </div>
              )}

              {/* Two-col: form + list */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }} className="grid-cols-1 md:grid-cols-2">

                {/* Review Form */}
                <div>
                  <p style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '24px' }}>
                    {userFeedback && !isEditingFeedback ? 'Your Review' : 'Write a Review'}
                  </p>

                  {/* Toasts */}
                  {submitError && (
                    <div style={{ padding: '12px 16px', border: '1px solid #F5C6CB', backgroundColor: '#FFF5F5', fontSize: '12px', color: '#C0392B', marginBottom: '20px', letterSpacing: '0.2px' }}>
                      {submitError}
                    </div>
                  )}
                  {successMessage && (
                    <div style={{ padding: '12px 16px', border: '1px solid #C9A55C', backgroundColor: '#FFFBF2', fontSize: '12px', color: '#8B6914', marginBottom: '20px', letterSpacing: '0.2px' }}>
                      {successMessage}
                    </div>
                  )}
                  {!user && (
                    <div style={{ padding: '12px 16px', border: '1px solid #EAE6E0', fontSize: '12px', color: '#AAA', marginBottom: '20px' }}>
                      Please sign in to leave a review.
                    </div>
                  )}
                  {user && user.role === 'member' && userFeedback && !isEditingFeedback && !successMessage && (
                    <div style={{ padding: '12px 16px', border: '1px solid #EAE6E0', fontSize: '12px', color: '#AAA', marginBottom: '20px' }}>
                      You have already reviewed this fragrance.
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview}>
                    {/* Stars */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '12px' }}>Rating</p>
                      {renderLuxuryStars(
                        reviewForm.rating, true,
                        (star) => setReviewForm(prev => ({ ...prev, rating: star })),
                        !user || user.role !== 'member' || (userFeedback && !isEditingFeedback)
                      )}
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#BBBBBB', marginBottom: '12px' }}>Comment <span style={{ fontWeight: '400' }}>(optional)</span></p>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        placeholder="Share your impression…"
                        rows="4"
                        disabled={!user || user.role !== 'member' || (userFeedback && !isEditingFeedback)}
                        style={{
                          width: '100%', border: '1px solid #EAE6E0', outline: 'none',
                          padding: '12px 14px', fontSize: '12px', color: '#1A1A1A',
                          resize: 'vertical', backgroundColor: '#FEFAF6',
                          fontFamily: 'inherit', lineHeight: '1.6',
                          boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = '#C9A55C'}
                        onBlur={e => e.target.style.borderColor = '#EAE6E0'}
                      />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {userFeedback && !isEditingFeedback ? (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleEditFeedback(); }}
                          style={{
                            flex: 1, padding: '13px', border: '1px solid #1A1A1A', background: 'none', cursor: 'pointer',
                            fontSize: '9px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1A1A1A',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#FFFFFF'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1A1A1A'; }}
                        >
                          Edit Review
                        </button>
                      ) : (
                        <>
                          <button
                            type="submit"
                            disabled={!user || user.role !== 'member'}
                            style={{
                              flex: 1, padding: '13px', border: 'none', cursor: (!user || user.role !== 'member') ? 'not-allowed' : 'pointer',
                              backgroundColor: (!user || user.role !== 'member') ? '#D8D3CC' : '#1A1A1A',
                              color: '#FFFFFF', fontSize: '9px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => { if (user && user.role === 'member') e.currentTarget.style.backgroundColor = '#C9A55C'; }}
                            onMouseLeave={e => { if (user && user.role === 'member') e.currentTarget.style.backgroundColor = '#1A1A1A'; }}
                          >
                            {user && user.role === 'admin' ? 'Admins cannot rate' : isEditingFeedback ? 'Update' : 'Submit'}
                          </button>
                          {isEditingFeedback && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); handleCancelEdit(); }}
                              style={{
                                padding: '13px 20px', border: '1px solid #EAE6E0', background: 'none', cursor: 'pointer',
                                fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#AAA',
                                transition: 'border-color 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = '#AAA'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = '#EAE6E0'}
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </form>
                </div>

                {/* Review List */}
                <div>
                  {allFeedbacks.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#BBBBBB', letterSpacing: '0.5px', paddingTop: '32px' }}>No reviews yet.</p>
                  ) : (
                    <div>
                      {allFeedbacks.map((feedback, idx) => {
                        const isOwner = user && feedback.userId?._id === user._id;
                        return (
                          <div key={feedback._id} style={{ paddingBottom: '24px', marginBottom: '24px', borderBottom: idx < allFeedbacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A1A', letterSpacing: '0.3px' }}>
                                  {feedback.userId?.fullName || 'Anonymous'}
                                </span>
                                {isOwner && (
                                  <span style={{ marginLeft: '8px', fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C9A55C' }}>You</span>
                                )}
                                <p style={{ fontSize: '10px', color: '#BBBBBB', marginTop: '3px', letterSpacing: '0.3px' }}>
                                  {new Date(feedback.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  {feedback.updatedAt && feedback.updatedAt !== feedback.createdAt && (
                                    <span style={{ fontStyle: 'italic', marginLeft: '6px' }}>· edited</span>
                                  )}
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  {[1, 2, 3].map(s => (
                                    <span key={s} style={{ fontSize: '13px', color: s <= feedback.rating ? '#C9A55C' : '#D8D3CC' }}>★</span>
                                  ))}
                                </div>
                                {isOwner && (
                                  <button
                                    onClick={() => setDeleteConfirm(feedback._id)}
                                    style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                            {feedback.comment && (
                              <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.7', fontWeight: '300' }}>{feedback.comment}</p>
                            )}

                            {/* Delete confirm */}
                            {deleteConfirm === feedback._id && (
                              <div style={{ marginTop: '12px', padding: '14px 16px', border: '1px solid #FECACA', backgroundColor: '#FFF5F5' }}>
                                <p style={{ fontSize: '11px', color: '#C0392B', marginBottom: '12px', letterSpacing: '0.3px' }}>Remove this review?</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleDeleteFeedback(feedback._id)}
                                    style={{ padding: '8px 16px', border: 'none', backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
                                  >
                                    Remove
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    style={{ padding: '8px 16px', border: '1px solid #EAE6E0', background: 'none', color: '#AAA', fontSize: '9px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PerfumeDetails;