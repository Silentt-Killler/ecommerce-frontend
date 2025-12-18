'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authImage, setAuthImage] = useState(null);

  useEffect(() => {
    // Wait for auth to initialize before redirecting
    if (isInitialized && isAuthenticated) {
      router.push('/');
    }
    fetchAuthImage();
  }, [isAuthenticated, isInitialized, router]);

  const fetchAuthImage = async () => {
    try {
      const res = await api.get('/settings');
      setAuthImage(res.data.auth_image || null);
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Use the store's login function (which takes email, password)
    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      router.push('/');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
    
    setSubmitting(false);
  };

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 300, 
              letterSpacing: 8, 
              color: '#0C0C0C',
              marginBottom: 50
            }}>
              PRISMIN
            </h1>
          </Link>

          {/* Heading */}
          <h2 style={{ 
            fontSize: 32, 
            fontWeight: 600, 
            color: '#0C0C0C',
            marginBottom: 8
          }}>
            Welcome back!
          </h2>
          <p style={{ 
            fontSize: 15, 
            color: '#919191',
            marginBottom: 40
          }}>
            Enter your credentials to access your account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 500, 
                color: '#0C0C0C',
                marginBottom: 8
              }}>
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    paddingRight: 48,
                    border: '1px solid #E0E0E0',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#919191'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#0C0C0C' }}
                />
                <span style={{ fontSize: 14, color: '#666' }}>Remember for 30 days</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#0C0C0C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: (submitting || isLoading) ? 'not-allowed' : 'pointer',
                opacity: (submitting || isLoading) ? 0.7 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !(submitting || isLoading) && (e.target.style.backgroundColor = '#333')}
              onMouseOut={(e) => e.target.style.backgroundColor = '#0C0C0C'}
            >
              {(submitting || isLoading) ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '32px 0',
            gap: 16
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
            <span style={{ fontSize: 13, color: '#919191' }}>Or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              type="button"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <p style={{ 
            textAlign: 'center', 
            marginTop: 40,
            fontSize: 15,
            color: '#666'
          }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#B08B5C', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        backgroundColor: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {authImage ? (
          <Image
            src={authImage}
            alt="Login"
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16
          }}>
            <p style={{ color: '#999', fontSize: 14 }}>Auth image not set</p>
            <p style={{ color: '#BBB', fontSize: 12 }}>Add from Admin → Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
