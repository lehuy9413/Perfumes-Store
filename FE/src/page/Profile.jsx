import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userAPI, feedbackAPI } from '../services/api';

const goldRule = (
  <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8943F)' }} />
    <div style={{ width: '5px', height: '5px', border: '1px solid #B8943F', transform: 'rotate(45deg)', margin: '0 14px', flexShrink: 0 }} />
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8943F)' }} />
  </div>
);

const fieldStyle = (focused) => ({
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${focused ? '#B8943F' : '#D4C5A9'}`,
  color: '#1A1A1A',
  padding: '10px 0',
  fontSize: '15px',
  letterSpacing: '0.03em',
  outline: 'none',
  transition: 'border-color 0.3s',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
});

const labelStyle = (focused) => ({
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: focused ? '#B8943F' : '#999',
  marginBottom: '6px',
  transition: 'color 0.3s',
});

const LuxuryInput = ({ label, type = 'text', value, onChange, min, max, disabled }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '28px' }}>
      <label style={labelStyle(focused)}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        min={min}
        max={max}
        disabled={disabled}
        style={fieldStyle(focused)}
      />
    </div>
  );
};

const LuxurySelect = ({ label, value, onChange, options }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '28px' }}>
      <label style={labelStyle(focused)}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...fieldStyle(focused),
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23B8943F'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
          paddingRight: '20px',
        }}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ backgroundColor: '#FAF7F2', color: '#1A1A1A' }}>{o}</option>
        ))}
      </select>
    </div>
  );
};

const GhostBtn = ({ onClick, children, danger, small }) => (
  <button
    onClick={onClick}
    style={{
      padding: small ? '8px 24px' : '11px 36px',
      background: 'transparent',
      border: `1px solid ${danger ? '#C0392B' : '#B8943F'}`,
      color: danger ? '#C0392B' : '#B8943F',
      fontSize: '10px',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.25s',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = danger ? '#C0392B' : '#B8943F';
      e.currentTarget.style.color = '#fff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = danger ? '#C0392B' : '#B8943F';
    }}
  >
    {children}
  </button>
);

export function Profile() {
  const navigate = useNavigate();
  const { token, login } = useContext(AuthContext);
  const [currentMember, setCurrentMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingFeedbackData, setEditingFeedbackData] = useState({ rating: 0, comment: '' });
  const [formData, setFormData] = useState({ fullName: '', email: '', gender: 'Male', yob: new Date().getFullYear() - 20 });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    if (token) fetchProfile();
    else { setIsLoading(false); setError('No authentication found'); }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();
      setCurrentMember(response.data);
      setFormData({ fullName: response.data.fullName || '', email: response.data.email || '', gender: response.data.gender || 'Male', yob: response.data.yob || new Date().getFullYear() - 20 });
      setError(null);
      fetchUserFeedbacks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getFeedbacks();
      setUserFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null); setPasswordSuccess(null);
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) return setPasswordError('All fields are required');
    if (passwordData.newPassword === passwordData.oldPassword) return setPasswordError('New password must differ from current');
    if (passwordData.newPassword !== passwordData.confirmPassword) return setPasswordError('Passwords do not match');
    if (passwordData.newPassword.length < 6) return setPasswordError('Minimum 6 characters');
    try {
      await userAPI.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      setPasswordSuccess('Password updated successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setPasswordSuccess(null); setIsChangingPassword(false); }, 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteFeedback = async (feedbackId, perfumeName) => {
    if (!window.confirm(`Delete your review for ${perfumeName}?`)) return;
    try {
      await feedbackAPI.deleteFeedback(feedbackId);
      setUserFeedbacks(userFeedbacks.filter(fb => fb._id !== feedbackId));
      setSuccessMessage('Review deleted'); setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleUpdateFeedback = async () => {
    setError(null);
    if (!editingFeedbackData.rating || editingFeedbackData.rating < 1 || editingFeedbackData.rating > 3) return setError('Rating must be 1–3');
    if (!editingFeedbackData.comment?.trim()) return setError('Comment cannot be empty');
    try {
      const response = await feedbackAPI.updateFeedback(editingFeedbackId, editingFeedbackData);
      setUserFeedbacks(userFeedbacks.map(fb => fb._id === editingFeedbackId ? response.data : fb));
      setEditingFeedbackId(null); setEditingFeedbackData({ rating: 0, comment: '' });
      setSuccessMessage('Review updated'); setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleSave = async () => {
    try {
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data.user || response.data;
      setCurrentMember(updatedUser);
      login(token, updatedUser);
      setIsEditing(false);
      setSuccessMessage('Profile saved'); setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const font = "'Cormorant Garamond', Georgia, serif";

  if (isLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: font, fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#AAA' }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2', fontFamily: font, padding: '60px 16px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#AAA', marginBottom: '8px' }}>L&apos;Essence</p>
          <h1 style={{ fontSize: '32px', fontWeight: '300', letterSpacing: '0.15em', color: '#1A1A1A', margin: '0 0 4px' }}>My Profile</h1>
          {currentMember?.role === 'admin' && (
            <span style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#B8943F' }}>â€” Administrator â€”</span>
          )}
        </div>

        {goldRule}

        {/* Alerts */}
        {(error || successMessage) && (
          <div style={{
            marginBottom: '28px', padding: '12px 18px',
            borderLeft: `2px solid ${error ? '#C0392B' : '#B8943F'}`,
            backgroundColor: error ? 'rgba(192,57,43,0.06)' : 'rgba(184,148,63,0.07)',
            color: error ? '#C0392B' : '#8A6A20',
            fontSize: '12px', letterSpacing: '0.05em',
          }}>
            {error || successMessage}
          </div>
        )}

        {currentMember && (
          <>
            {/* Identity Section */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B8943F', margin: '0 0 8px' }}>Identity</h2>
                  {!isEditing && (
                    <p style={{ fontSize: '26px', fontWeight: '300', color: '#1A1A1A', margin: 0 }}>
                      {currentMember.fullName || 'Member'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!isEditing ? (
                    <GhostBtn small onClick={() => setIsEditing(true)}>Edit</GhostBtn>
                  ) : (
                    <>
                      <GhostBtn small onClick={() => { setIsEditing(false); }}>Cancel</GhostBtn>
                      <GhostBtn small onClick={handleSave}>Save</GhostBtn>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <LuxuryInput label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <LuxuryInput label="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <LuxurySelect label="Gender" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} options={['Male', 'Female', 'Other']} />
                  <LuxuryInput label="Year of Birth" type="number" value={formData.yob} onChange={e => setFormData({ ...formData, yob: parseInt(e.target.value) || '' })} min="1900" max={new Date().getFullYear()} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  {[
                    { label: 'Email', value: currentMember.email },
                    { label: 'Gender', value: currentMember.gender || 'â€”' },
                    { label: 'Age', value: currentMember.yob ? `${new Date().getFullYear() - currentMember.yob} years` : 'â€”' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ borderBottom: '1px solid #E8E0D0', paddingBottom: '16px' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#AAA', marginBottom: '6px' }}>{label}</p>
                      <p style={{ fontSize: '15px', color: '#1A1A1A', margin: 0, letterSpacing: '0.02em', wordBreak: 'break-all' }}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {!isEditing && (
              <>
                {goldRule}

                {/* Security Section */}
                <section>
                  <h2 style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B8943F', margin: '0 0 28px' }}>Security</h2>

                  {currentMember.authProvider === 'google' ? (
                    <p style={{ fontSize: '12px', letterSpacing: '0.08em', color: '#AAA', fontStyle: 'italic' }}>
                      This account is linked to Google Sign-In. Password management is handled by Google.
                    </p>
                  ) : (
                    <>
                      {(passwordError || passwordSuccess) && (
                        <div style={{
                          marginBottom: '20px', padding: '12px 18px',
                          borderLeft: `2px solid ${passwordError ? '#C0392B' : '#B8943F'}`,
                          backgroundColor: passwordError ? 'rgba(192,57,43,0.06)' : 'rgba(184,148,63,0.07)',
                          color: passwordError ? '#C0392B' : '#8A6A20',
                          fontSize: '12px', letterSpacing: '0.05em',
                        }}>
                          {passwordError || passwordSuccess}
                        </div>
                      )}

                      {!isChangingPassword ? (
                        <GhostBtn small onClick={() => { setIsChangingPassword(true); setPasswordError(null); setPasswordSuccess(null); }}>
                          Change Password
                        </GhostBtn>
                      ) : (
                        <div>
                          <LuxuryInput label="Current Password" type="password" value={passwordData.oldPassword} onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                          <LuxuryInput label="New Password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                          <LuxuryInput label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <GhostBtn small onClick={handleChangePassword}>Save Password</GhostBtn>
                            <GhostBtn small onClick={() => { setIsChangingPassword(false); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(null); setPasswordSuccess(null); }}>Cancel</GhostBtn>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>

                {goldRule}

                {/* Reviews Section */}
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B8943F', margin: 0 }}>Reviews & Ratings</h2>
                    <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#AAA' }}>{userFeedbacks.length} {userFeedbacks.length === 1 ? 'review' : 'reviews'}</span>
                  </div>

                  {userFeedbacks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p style={{ fontSize: '13px', color: '#AAA', letterSpacing: '0.05em', marginBottom: '20px' }}>No reviews yet</p>
                      <Link to="/perfumes">
                        <GhostBtn small>Browse Fragrances</GhostBtn>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {userFeedbacks.map((feedback, idx) => (
                        <div key={feedback._id}>
                          {editingFeedbackId === feedback._id ? (
                            <div style={{ padding: '24px 0' }}>
                              <p style={{ fontSize: '16px', color: '#1A1A1A', letterSpacing: '0.05em', marginBottom: '20px', fontWeight: '400' }}>
                                {feedback.perfumeId?.perfumeName || 'Perfume'}
                              </p>
                              <LuxurySelect
                                label="Rating"
                                value={editingFeedbackData.rating}
                                onChange={e => setEditingFeedbackData({ ...editingFeedbackData, rating: parseInt(e.target.value) })}
                                options={[1, 2, 3]}
                              />
                              <div style={{ marginBottom: '28px' }}>
                                <label style={labelStyle(false)}>Comment</label>
                                <textarea
                                  value={editingFeedbackData.comment}
                                  onChange={e => setEditingFeedbackData({ ...editingFeedbackData, comment: e.target.value })}
                                  rows={3}
                                  style={{ ...fieldStyle(false), resize: 'none', paddingTop: '8px' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <GhostBtn small onClick={handleUpdateFeedback}>Save</GhostBtn>
                                <GhostBtn small onClick={() => { setEditingFeedbackId(null); setEditingFeedbackData({ rating: 0, comment: '' }); setError(null); }}>Cancel</GhostBtn>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <button
                                  onClick={() => navigate(`/perfume/${feedback.perfumeId?._id}`)}
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block', marginBottom: '8px' }}
                                >
                                  <span style={{ fontSize: '16px', color: '#1A1A1A', letterSpacing: '0.05em', fontFamily: font, transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#B8943F'}
                                    onMouseLeave={e => e.target.style.color = '#1A1A1A'}
                                  >
                                    {feedback.perfumeId?.perfumeName || 'Perfume (Deleted)'}
                                  </span>
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                  <span style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3].map(s => (
                                      <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= feedback.rating ? '#B8943F' : 'none'} stroke="#B8943F" strokeWidth="1.5">
                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                      </svg>
                                    ))}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#BBB', letterSpacing: '0.1em' }}>
                                    {new Date(feedback.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.6', letterSpacing: '0.02em' }}>{feedback.comment}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button
                                  onClick={() => { setEditingFeedbackId(feedback._id); setEditingFeedbackData({ rating: feedback.rating, comment: feedback.comment }); }}
                                  style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8943F', fontFamily: font, borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.borderBottomColor = '#B8943F'}
                                  onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                                >Edit</button>
                                <button
                                  onClick={() => handleDeleteFeedback(feedback._id, feedback.perfumeId?.perfumeName || 'Perfume')}
                                  style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C0392B', fontFamily: font, borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.borderBottomColor = '#C0392B'}
                                  onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                                >Delete</button>
                              </div>
                            </div>
                          )}
                          {idx < userFeedbacks.length - 1 && <div style={{ height: '1px', backgroundColor: '#EDE8DF' }} />}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {goldRule}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
