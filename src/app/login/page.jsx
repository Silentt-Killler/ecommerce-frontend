'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, User } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authImage, setAuthImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (isInitialized && isAuthenticated) {
      router.push('/');
    }
    fetchAuthImage();
    
    return () => window.removeEventListener('resize', checkMobile);
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
      router.push('/');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
    
    setSubmitting(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingTop: 56 }}>
        {/* Black Header with User Icon */}
        <div style={{
          backgroundColor: '#0C0C0C',
          padding: '40px 20px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}>
          <div style={{
            width: 70,
            height: 70,
            border: '2px solid #FFFFFF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={35} color="#FFFFFF" strokeWidth={1.5} />
          </div>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px 24px', paddingBottom: 120 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0C0C0C', marginBottom: 28, textAlign: 'center' }}>
            Login
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Hello@dream.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  backgroundColor: '#F9F9F9'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    paddingRight: 48,
                    border: '1px solid #E0E0E0',
                    borderRadius: 8,
                    fontSize: 15,
                    outline: 'none',
                    backgroundColor: '#F9F9F9'
                  }}
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

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#0C0C0C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 30,
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
            <span style={{ fontSize: 13, color: '#919191' }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: 30,
              fontSize: 15,
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

          {/* Sign Up Link */}
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 15, color: '#666' }}>
            Don't have any account?{' '}
            <Link href="/signup" style={{ color: '#0C0C0C', fontWeight: 600, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Desktop Layout - Image on RIGHT
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 8, color: '#0C0C0C', marginBottom: 50 }}>PRISMIN</h1>
          </Link>

          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>Welcome back!</h2>
          <p style={{ fontSize: 15, color: '#919191', marginBottom: 40 }}>Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '14px 16px', paddingRight: 48, border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#919191' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              style={{ width: '100%', padding: '16px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0', gap: 16 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
            <span style={{ fontSize: 13, color: '#919191' }}>Or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 40, fontSize: 15, color: '#666' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#B08B5C', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#F5F5F5' }}>
        {authImage ? (
          <Image src={authImage} alt="Login" fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: '#999', fontSize: 14 }}>Auth image not set</p>
            <p style={{ color: '#BBB', fontSize: 12 }}>Add from Admin → Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
