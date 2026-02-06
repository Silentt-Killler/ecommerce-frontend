'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    emailOrPhone: '',
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authImage, setAuthImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchAuthImage = async () => {
    try {
      const res = await api.get('/settings');
      setAuthImage(res.data.auth_image || null);
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  // Detect if input is email or phone
  const isPhone = (value) => /^01[3-9]\d{8}$/.test(value.replace(/\s/g, ''));
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendOtp = async () => {
    const contact = formData.emailOrPhone.trim();
    
    if (!contact) {
      toast.error('Please enter email or phone number');
      return;
    }

    try {
      if (isPhone(contact)) {
        await api.post('/auth/send-otp', { phone: contact });
        toast.success('OTP sent to your phone');
      } else if (isEmail(contact)) {
        await api.post('/auth/send-email-otp', { email: contact });
        toast.success('OTP sent to your email');
      } else {
        toast.error('Please enter valid email or BD phone number (01XXXXXXXXX)');
        return;
      }
      
      setOtpSent(true);
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const contact = formData.emailOrPhone.trim();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      if (isPhone(contact)) {
        await api.post('/auth/verify-otp', { phone: contact, otp });
      } else {
        await api.post('/auth/verify-email-otp', { email: contact, otp });
      }
      
      setOtpVerified(true);
      toast.success('Verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    }
    setVerifyingOtp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contact = formData.emailOrPhone.trim();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!contact) {
      toast.error('Please enter email or phone number');
      return;
    }

    // If not verified, send OTP first
    if (!otpVerified) {
      if (!otpSent) {
        await handleSendOtp();
        return;
      } else {
        toast.error('Please verify your email/phone with OTP');
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    // Determine email and phone
    const email = isEmail(contact) ? contact : '';
    const phone = isPhone(contact) ? contact : '';

    const result = await register(formData.name, email, formData.password, phone);

    if (result.success) {
      toast.success('Account created successfully!');
      router.push('/');
    } else {
      toast.error(result.error || 'Registration failed');
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
        {/* Black Header */}
        <div style={{
          backgroundColor: '#0C0C0C',
          padding: '35px 20px 25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
            Sign Up
          </h1>
        </div>

        {/* Form Section */}
        <div style={{ padding: '28px 24px', paddingBottom: 120 }}>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Wasim Bari"
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

            {/* Email or Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                Email or Phone Number
              </label>
              <input
                type="text"
                value={formData.emailOrPhone}
                onChange={(e) => {
                  setFormData({ ...formData, emailOrPhone: e.target.value });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp('');
                }}
                placeholder="Hello@dream.com or 01XXXXXXXXX"
                required
                disabled={otpVerified}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  backgroundColor: otpVerified ? '#E8F5E9' : '#F9F9F9'
                }}
              />
              {otpVerified && (
                <p style={{ fontSize: 12, color: '#1E7F4F', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ Verified
                </p>
              )}
            </div>

            {/* OTP Input - Shows after OTP sent */}
            {otpSent && !otpVerified && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                  Enter OTP
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      border: '1px solid #E0E0E0',
                      borderRadius: 8,
                      fontSize: 18,
                      outline: 'none',
                      backgroundColor: '#F9F9F9',
                      letterSpacing: 8,
                      textAlign: 'center'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    style={{
                      padding: '14px 20px',
                      backgroundColor: '#1E7F4F',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: verifyingOtp ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {verifyingOtp ? '...' : 'Verify'}
                  </button>
                </div>
                {countdown > 0 && (
                  <p style={{ fontSize: 12, color: '#919191', marginTop: 8 }}>
                    Resend OTP in {countdown}s
                  </p>
                )}
                {countdown === 0 && otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', marginTop: 8, cursor: 'pointer' }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#919191' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#919191' }}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign Up Button - Sends OTP if not verified */}
            <button
              type="submit"
              disabled={submitting}
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
              {submitting ? 'Creating account...' : otpVerified ? 'Sign Up' : otpSent ? 'Verify & Sign Up' : 'Sign Up'}
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
            Sign up with Google
          </button>

          {/* Login Link */}
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 15, color: '#666' }}>
            Already have a account?{' '}
            <Link href="/login" style={{ color: '#0C0C0C', fontWeight: 600, textDecoration: 'none' }}>
              Login
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 80px', backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 8, color: '#0C0C0C', marginBottom: 40 }}>PRISMIN</h1>
          </Link>

          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>Create Account</h2>
          <p style={{ fontSize: 15, color: '#919191', marginBottom: 30 }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none' }}
              />
            </div>

            {/* Email or Phone */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Email or Phone Number</label>
              <input
                type="text"
                value={formData.emailOrPhone}
                onChange={(e) => {
                  setFormData({ ...formData, emailOrPhone: e.target.value });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp('');
                }}
                placeholder="Enter email or phone (01XXXXXXXXX)"
                required
                disabled={otpVerified}
                style={{ width: '100%', padding: '14px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', backgroundColor: otpVerified ? '#E8F5E9' : '#fff' }}
              />
              {otpVerified && <p style={{ fontSize: 12, color: '#1E7F4F', marginTop: 6 }}>✓ Verified</p>}
            </div>

            {/* OTP Input */}
            {otpSent && !otpVerified && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Enter OTP</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    style={{ flex: 1, padding: '14px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', letterSpacing: 4 }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    style={{ padding: '14px 24px', backgroundColor: '#1E7F4F', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: verifyingOtp ? 'not-allowed' : 'pointer' }}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  {countdown > 0 ? (
                    <span style={{ fontSize: 12, color: '#919191' }}>Resend in {countdown}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>Resend OTP</button>
                  )}
                </div>
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  style={{ width: '100%', padding: '14px 16px', paddingRight: 48, border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#919191' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                  style={{ width: '100%', padding: '14px 16px', paddingRight: 48, border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#919191' }}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', padding: '16px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Creating account...' : otpVerified ? 'Create Account' : 'Sign Up'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 16 }}>
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
            Sign up with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 30, fontSize: 15, color: '#666' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#B08B5C', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#F5F5F5' }}>
        {authImage ? (
          <Image src={authImage} alt="Signup" fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: '#999', fontSize: 14 }}>Auth image not set</p>
          </div>
        )}
      </div>
    </div>
  );
}
