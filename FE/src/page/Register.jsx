import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../Axios/Axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    yearOfBirth: '',
    gender: 'Male',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!form.username || form.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!form.fullName || form.fullName.trim().length === 0) {
      setError('Full name is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co|vn|info|biz|me|us|uk|ca|au|de|fr|jp|kr|cn|in|br|ru|za)(\.\w{2,3})?$/i;
    if (!form.email || !emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    const currentYear = new Date().getFullYear();
    const yob = parseInt(form.yearOfBirth);
    if (!form.yearOfBirth || isNaN(yob) || yob < 1900 || yob > currentYear) {
      setError(`Year of birth must be between 1900 and ${currentYear}`);
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        gender: form.gender,
        yob: parseInt(form.yearOfBirth)
      });
      const res = await authAPI.login({
        identifier: form.email.trim(),
        password: form.password
      });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focusedField === field ? '#B8943F' : '#D4C5A9'}`,
    color: '#1A1A1A',
    padding: '10px 0',
    fontSize: '14px',
    letterSpacing: '0.05em',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  });

  const selectStyle = (field) => ({
    ...inputStyle(field),
    cursor: 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23B8943F'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 4px center',
    paddingRight: '20px',
  });

  const labelStyle = (field) => ({
    display: 'block',
    fontSize: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: focusedField === field ? '#B8943F' : '#999',
    marginBottom: '6px',
    transition: 'color 0.3s ease',
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF7F2',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '60px 16px 60px',
      fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(184,148,63,0.07) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>

        {/* Decorative top rule */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8943F)' }} />
          <div style={{ width: '5px', height: '5px', border: '1px solid #B8943F', transform: 'rotate(45deg)', margin: '0 12px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8943F)' }} />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '300',
            letterSpacing: '0.35em',
            color: '#1A1A1A',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            L&apos;<span style={{ color: '#B8943F' }}>ESSENCE</span>
          </h1>
          <p style={{
            fontSize: '9px',
            letterSpacing: '0.5em',
            color: '#AAA',
            marginTop: '6px',
            textTransform: 'uppercase',
          }}>
            MAISON DE PARFUM
          </p>
        </div>

        {/* Subtitle */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          letterSpacing: '0.25em',
          color: '#AAA',
          textTransform: 'uppercase',
          marginBottom: '40px',
        }}>
          Become a Member
        </p>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderLeft: '2px solid #C0392B',
            backgroundColor: 'rgba(192,57,43,0.06)',
          }}>
            <p style={{ color: '#C0392B', fontSize: '12px', letterSpacing: '0.05em', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Row 1: Username & Full Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            <div>
              <label style={labelStyle('username')}>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle('username')}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label style={labelStyle('fullName')}>Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle('fullName')}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle('email')}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('email')}
              required
              disabled={loading}
            />
          </div>

          {/* Row: YOB & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            <div>
              <label style={labelStyle('yob')}>Year of Birth</label>
              <input
                type="number"
                value={form.yearOfBirth}
                onChange={(e) => setForm({ ...form, yearOfBirth: e.target.value })}
                onFocus={() => setFocusedField('yob')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle('yob')}
                min="1900"
                max={new Date().getFullYear()}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label style={labelStyle('gender')}>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                onFocus={() => setFocusedField('gender')}
                onBlur={() => setFocusedField(null)}
                style={selectStyle('gender')}
                required
                disabled={loading}
              >
                <option value="Male" style={{ backgroundColor: '#1A1A1A', color: '#F0EAE0' }}>Male</option>
                <option value="Female" style={{ backgroundColor: '#1A1A1A', color: '#F0EAE0' }}>Female</option>
                <option value="Other" style={{ backgroundColor: '#1A1A1A', color: '#F0EAE0' }}>Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle('password')}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('password')}
              required
              disabled={loading}
            />
            <p style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', marginTop: '6px' }}>Minimum 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '44px' }}>
            <label style={labelStyle('confirmPassword')}>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              style={inputStyle('confirmPassword')}
              required
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              border: '1px solid #B8943F',
              color: '#B8943F',
              fontSize: '11px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#B8943F';
                e.target.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#B8943F';
            }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        {/* Links */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#888', marginBottom: '12px' }}>
            Already a member?{' '}
            <Link
              to="/login"
              style={{ color: '#B8943F', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => e.target.style.borderBottomColor = '#B8943F'}
              onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Sign In
            </Link>
          </p>
          <Link
            to="/"
            style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#BBB', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#B8943F'}
            onMouseLeave={(e) => e.target.style.color = '#BBB'}
          >
            ← Return to Collection
          </Link>
        </div>

        {/* Decorative bottom rule */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8943F)' }} />
          <div style={{ width: '5px', height: '5px', border: '1px solid #B8943F', transform: 'rotate(45deg)', margin: '0 12px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8943F)' }} />
        </div>
      </div>
    </div>
  );
};

export default Register;