import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import api, { authAPI } from '../Axios/Axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({
        identifier: form.email,
        password: form.password
      });
      login(res.data.token, res.data.user);
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      if (redirectPath) {
        window.location.href = redirectPath;
      } else if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Incorrect email or password';
      setError(errorMessage);
      if (passwordRef.current) {
        setTimeout(() => {
          passwordRef.current.focus();
          passwordRef.current.select();
        }, 0);
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/google-token', {
        access_token: tokenResponse.access_token
      });
      login(res.data.token, res.data.user);
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      if (redirectPath) {
        window.location.href = redirectPath;
      } else if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google sign-in failed';
      setError(errorMessage);
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google sign-in failed. Please try again.'),
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const focusableElements = [emailRef.current, passwordRef.current, submitRef.current];
      const currentFocus = document.activeElement;
      const currentIndex = focusableElements.indexOf(currentFocus);
      if (e.shiftKey) {
        const nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[nextIndex]?.focus();
      } else {
        const nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex]?.focus();
      }
    }
  };

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Cormorant Garamond', 'Didot', Georgia, serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(184,148,63,0.07) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

        {/* Decorative top rule */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8943F)' }} />
          <div style={{ width: '5px', height: '5px', border: '1px solid #B8943F', transform: 'rotate(45deg)', margin: '0 12px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8943F)' }} />
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
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
          marginBottom: '48px',
        }}>
          Private Access
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: '28px',
            padding: '12px 16px',
            borderLeft: '2px solid #C0392B',
            backgroundColor: 'rgba(192,57,43,0.06)',
          }}>
            <p style={{ color: '#C0392B', fontSize: '12px', letterSpacing: '0.05em', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle('email')}>Email or Username</label>
            <input
              ref={emailRef}
              type="text"
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={handleKeyDown}
              style={inputStyle('email')}
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '48px' }}>
            <label style={labelStyle('password')}>Password</label>
            <input
              ref={passwordRef}
              type="password"
              placeholder=""
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={handleKeyDown}
              style={inputStyle('password')}
              required
              disabled={loading}
            />
          </div>

          {/* Sign In Button */}
          <button
            ref={submitRef}
            type="submit"
            disabled={loading}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'transparent' : 'transparent',
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
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '36px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E0D8CC' }} />
          <span style={{ padding: '0 16px', fontSize: '10px', letterSpacing: '0.2em', color: '#BBB', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E0D8CC' }} />
        </div>

        {/* Google Sign In */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            title="Sign in with Google"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid #D4C5A9',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              padding: 0,
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#B8943F';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,148,63,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D4C5A9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </button>
        </div>

        {/* Links */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#888', marginBottom: '12px' }}>
            New to L&apos;Essence?{' '}
            <Link
              to="/register"
              style={{ color: '#B8943F', textDecoration: 'none', letterSpacing: '0.1em', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => e.target.style.borderBottomColor = '#B8943F'}
              onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
            >
              Create Account
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
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '48px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8943F)' }} />
          <div style={{ width: '5px', height: '5px', border: '1px solid #B8943F', transform: 'rotate(45deg)', margin: '0 12px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8943F)' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;