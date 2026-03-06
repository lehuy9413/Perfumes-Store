import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { perfumeAPI, feedbackAPI } from '../services/api';

const PerfumeDetail = () => {
  const { id } = useParams();
  const [perfume, setPerfume] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [userFeedback, setUserFeedback] = useState(null);
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    fetchPerfumeDetails();
  }, [id]);

  const fetchPerfumeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching perfume details for ID:', id);
      const perfumeRes = await perfumeAPI.getPerfumeById(id);
      console.log('Perfume response:', perfumeRes.data);
      setPerfume(perfumeRes.data);

      // Fetch all feedbacks for this perfume
      console.log('Fetching feedbacks...');
      try {
        const feedbackRes = await feedbackAPI.getPerfumeFeedbacks(id);
        console.log('Feedbacks response:', feedbackRes.data);
        const perfumeFeedbacks = feedbackRes.data || [];
        setFeedbacks(perfumeFeedbacks);

        // Set user's feedback if exists
        if (user && perfumeFeedbacks.length > 0) {
          const userFb = perfumeFeedbacks.find(fb => fb.userId._id === user._id);
          if (userFb) {
            console.log('Found user feedback:', userFb);
            setUserFeedback(userFb);
            setRating(userFb.rating);
            setComment(userFb.comment);
          }
        }
      } catch (fbErr) {
        console.warn('Error fetching feedbacks:', fbErr);
        // Don't block perfume details if feedbacks fail to load
        setFeedbacks([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching perfume details:', err);
      setError('Failed to load perfume details');
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    if (!rating || rating < 1 || rating > 3) {
      setError('Please select a rating');
      return;
    }

    if (!comment || comment.trim().length === 0) {
      setError('Please enter a comment');
      return;
    }

    try {
      setError(null);
      const isUpdate = !!userFeedback;
      
      await feedbackAPI.createFeedback({
        perfumeId: id,
        rating: parseInt(rating),
        comment: comment.trim(),
      });

      setSuccessMessage(isUpdate ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
      
      // Refresh feedbacks
      await fetchPerfumeDetails();
      setComment('');
      setRating(3);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit feedback';
      setError(errorMsg);
    }
  };

  const getConcentrationClass = (conc) => {
    if (conc === 'Extrait' || conc === 'Parfum') {
      return 'bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform scale-105';
    }
    if (conc === 'EDP' || conc === 'Eau de Parfum') {
      return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md';
    }
    if (conc === 'EDT' || conc === 'Eau de Toilette') {
      return 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white px-4 py-2 rounded-lg font-semibold shadow-md';
    }
    if (conc === 'Cologne' || conc === 'Eau de Cologne') {
      return 'bg-gradient-to-br from-green-400 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md';
    }
    return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-lg">Loading...</p></div>;
  if (error && !perfume) return <div className="flex justify-center items-center min-h-screen"><p className="text-red-500 text-lg">{error}</p></div>;

  if (!perfume) return null;

  return (
    <div className="container mx-auto p-6 bg-[#FEFAF6] min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-[#F5F1EB] rounded-lg">
            <img 
              src={perfume.uri} 
              alt={perfume.perfumeName} 
              className="max-h-96 w-auto object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400?text=Perfume';
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{perfume.perfumeName}</h1>
            
            <p className="text-3xl font-bold mb-4 text-[#C9A55C]">${perfume.price}</p>

            <p className="text-sm text-gray-600 mb-6">{perfume.description}</p>

            {/* Product Specifications */}
            <div className="mb-8 border-t border-b py-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-gray-500">Concentration Type</p>
                  <p className={getConcentrationClass(perfume.concentration)}>
                    {perfume.concentration}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-gray-500">Volume</p>
                  <p className="text-lg font-semibold text-gray-900">{perfume.volume}ml</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-gray-500">For</p>
                  <p className="text-lg font-semibold text-gray-900">{perfume.targetAudience}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-gray-500">Brand</p>
                  <p className="text-lg font-semibold text-gray-900">{perfume.brand?.brandName || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest font-semibold mb-2 text-gray-500">Ingredients</p>
              <p className="text-sm text-gray-600 leading-relaxed">{perfume.ingredients || 'Not available'}</p>
            </div>

            {/* Add to Cart Button */}
            <button 
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition hover:opacity-90 bg-[#C9A55C]"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Customer Feedback & Ratings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-8 border-b">
          {/* Feedback Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Share Your Experience</h3>

            {!user && (
              <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm mb-4">
                Please login to leave a feedback
              </div>
            )}

            {user && userFeedback && (
              <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm mb-4">
                You already rated this perfume. Update your feedback below.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Your Rating</label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition hover:scale-110"
                      disabled={!user}
                    >
                      <span className={rating >= star ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Your Feedback</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this perfume..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A55C]"
                  rows="5"
                  disabled={!user}
                />
              </div>

              <button 
                onClick={submitFeedback}
                disabled={!user}
                className="w-full px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-[#C9A55C]"
              >
                {userFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </button>
            </div>
          </div>

          {/* Average Rating */}
          <div className="flex flex-col justify-start">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Community Rating</h3>
            <div className="text-center p-6 bg-gradient-to-br from-[#FEFAF6] to-white rounded-lg border border-gray-200">
              <p className="text-5xl font-bold mb-2 text-[#C9A55C]">
                {feedbacks.length > 0 ? (feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / feedbacks.length).toFixed(1) : '0'}
              </p>
              <div className="flex justify-center mb-4">
                {renderStars(feedbacks.length > 0 ? Math.round(feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / feedbacks.length) : 0)}
              </div>
              <p className="text-sm text-gray-600">Based on {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Individual Feedbacks */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">All Feedback</h3>
          {feedbacks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No feedback yet. Be the first to rate!</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="pb-4 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {feedback.userId?.fullName || 'Anonymous'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {feedback.updatedAt ? new Date(feedback.updatedAt).toLocaleDateString() : new Date(feedback.createdAt).toLocaleDateString()}
                        {feedback.updatedAt && new Date(feedback.updatedAt).getTime() !== new Date(feedback.createdAt).getTime() && ' (edited)'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerfumeDetail;