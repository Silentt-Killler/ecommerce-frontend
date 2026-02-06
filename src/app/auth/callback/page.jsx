// src/app/auth/callback/page.jsx
// Handle Google OAuth callback

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Login failed. Please try again.');
        router.push('/login');
        return;
      }

      if (accessToken && refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        await checkAuth();
        
        toast.success('Welcome!');
        router.push('/');
      } else {
        toast.error('Authentication failed');
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
      backgroundColor: '#FFFFFF'
    }}>
      <div style={{ 
        width: 50, 
        height: 50, 
        border: '3px solid #B08B5C', 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <p style={{ color: '#919191', fontSize: 15 }}>Completing sign in...</p>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 50, height: 50, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
