import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { getGoogleLoginUrl } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';
import TwoFactorVerification from '@/components/TwoFactorVerification';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';

export default function Login() {
  // Force rebuild - Chrome compatibility fix v2
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const { user, isAuthenticated, refresh } = useAuth();

  const utils = trpc.useUtils();

  // Handle OAuth success and errors from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const oauthSuccess = urlParams.has('oauth_success');
    
    // If OAuth success, invalidate and refresh
    if (oauthSuccess) {
      urlParams.delete('oauth_success');
      const redirect = urlParams.get('redirect') || '/';
      urlParams.delete('redirect');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
      
      // Force refresh auth data - reload page to ensure cookie is read
      setTimeout(() => {
        utils.auth.me.invalidate();
        refresh();
        
        // Reload page after a short delay to ensure cookie is available
        setTimeout(() => {
          window.location.href = redirect;
        }, 1000);
      }, 300);
    }
    
    // Show error if present
    if (error) {
      const errorMsg = decodeURIComponent(error);
      toast.error(errorMsg);
      urlParams.delete('error');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [utils, refresh, isAuthenticated, user, setLocation]);
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data: any) => {
      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        setTempToken(data.tempToken);
        return;
      }

      toast.success(language === 'en' ? 'Login successful!' : 'Login realizado com sucesso!');

      const isAdminDomain = window.location.hostname === 'admin.ileala.ae' ||
                           window.location.hostname.includes('admin');

      const params = new URLSearchParams(window.location.search);
      let redirect = params.get('redirect');

      if (redirect) {
        // Use explicit redirect parameter
      } else if (isAdminDomain) {
        redirect = `${window.location.protocol}//${window.location.hostname}/admin`;
      } else if (data?.user?.role === 'admin') {
        redirect = 'https://admin.ileala.ae/admin';
      } else {
        redirect = '/';
      }

      utils.auth.me.invalidate().catch(() => {});

      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = redirect;
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Invalid email or password' : 'Email ou senha inválidos'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email || email.trim() === '') {
      toast.error(language === 'en' ? 'Please enter your email' : 'Por favor, digite seu e-mail');
      return;
    }

    if (!password || password.trim() === '') {
      toast.error(language === 'en' ? 'Please enter your password' : 'Por favor, digite sua senha');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(language === 'en' ? 'Please enter a valid email' : 'Por favor, digite um e-mail válido');
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  // Handle 2FA verification success
  const handle2FASuccess = async () => {
    await utils.auth.me.invalidate();
    await refresh();

    const isAdminDomain = window.location.hostname === 'admin.ileala.ae' ||
                         window.location.hostname.includes('admin');

    const params = new URLSearchParams(window.location.search);
    let redirect = params.get('redirect');

    if (!redirect) {
      redirect = isAdminDomain ? '/admin' : '/';
    }

    setLocation(redirect);
  };
  
  // Handle Sign in with Apple (iOS native only)
  const handleAppleSignIn = async () => {
    try {
      const result = await SocialLogin.login({
        provider: 'apple',
        options: {
          scopes: ['email', 'name'],
        },
      });

      if (!result.result?.idToken) {
        toast.error(language === 'en' ? 'Apple Sign-In failed' : 'Falha no Sign in com Apple');
        return;
      }

      const profile = result.result.profile as any;
      const response = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identityToken: result.result.idToken,
          givenName: profile?.givenName || '',
          familyName: profile?.familyName || '',
          email: profile?.email || '',
        }),
      });

      if (response.ok) {
        await utils.auth.me.invalidate();
        window.location.href = '/';
      } else {
        const err = await response.json();
        toast.error(err.error || (language === 'en' ? 'Apple Sign-In failed' : 'Falha no Sign in com Apple'));
      }
    } catch (error: any) {
      if (error?.code !== 'USER_CANCELLED') {
        toast.error(language === 'en' ? 'Apple Sign-In failed' : 'Falha no Sign in com Apple');
      }
    }
  };

  // Handle back from 2FA screen
  const handleBackFrom2FA = () => {
    setRequires2FA(false);
    setTempToken('');
    setPassword('');
  };
  
  // Show 2FA verification screen if required
  if (requires2FA && tempToken) {
    return (
      <TwoFactorVerification 
        tempToken={tempToken} 
        onSuccess={handle2FASuccess}
        onBack={handleBackFrom2FA}
      />
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="mx-auto mb-4"
              style={{ 
                height: '50px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </Link>
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Welcome Back' : 'Bem-vindo de Volta'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' ? 'Sign in to your account' : 'Entre na sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-900 mb-2">
              {language === 'en' ? 'Email' : 'E-mail'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'en' ? 'your@email.com' : 'seu@email.com'}
                className="pl-10"
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-sage-900 mb-2">
              {language === 'en' ? 'Password' : 'Senha'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'en' ? 'Enter your password' : 'Digite sua senha'}
                className="pl-10 pr-10"
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button with extra spacing */}
          <div className="pt-6 mt-6">
            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: '100%',
                backgroundColor: '#4A7C59',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '6px',
                padding: '16px 24px',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.5 : 1,
                transition: 'all 0.2s',
                minHeight: '56px'
              }}
              onMouseEnter={(e) => !loginMutation.isPending && (e.currentTarget.style.backgroundColor = '#3D6A4A')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4A7C59'}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span style={{ color: '#FFFFFF', fontSize: '18px' }}>{language === 'en' ? 'Signing in...' : 'Entrando...'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600' }}>{language === 'en' ? 'Sign In' : 'Entrar'}</span>
                </>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mt-4">
            <Link href="/forgot-password" className="text-sm text-sage-600 hover:text-sage-900">
              {language === 'en' ? 'Forgot password?' : 'Esqueceu a senha?'}
            </Link>
          </div>
        </form>

        {/* Google OAuth Login Button - Only show if Google OAuth is configured */}
        {(() => {
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirect') || '/';
          const googleLoginUrl = getGoogleLoginUrl(redirectTo);
          
          if (!googleLoginUrl) {
            console.warn('[Login] Google OAuth button not shown - VITE_GOOGLE_CLIENT_ID not configured');
            return null; // Don't show Google button if not configured
          }
          
          return (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-sage-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-sage-500">
                    {language === 'en' ? 'Or continue with' : 'Ou continue com'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const url = getGoogleLoginUrl(redirectTo);
                    if (url) {
                      window.location.href = url;
                    } else {
                      toast.error(language === 'en' ? 'Google OAuth is not configured' : 'Google OAuth não está configurado');
                    }
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {language === 'en' ? 'Sign in with Google' : 'Entrar com Google'}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Apple Sign-In Button - Only shown on iOS native app */}
        {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios' && (
          <div className="mt-4">
            {/* Show divider only if Google button is not shown */}
            {!getGoogleLoginUrl(new URLSearchParams(window.location.search).get('redirect') || '/') && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-sage-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-sage-500">
                    {language === 'en' ? 'Or continue with' : 'Ou continue com'}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleAppleSignIn}
              style={{
                width: '100%',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: '600',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                minHeight: '48px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              {language === 'en' ? 'Sign in with Apple' : 'Entrar com Apple'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sage-600">
            {language === 'en' ? "Don't have an account?" : 'Não tem uma conta?'}{' '}
            <Link href="/register" className="text-sage-900 font-semibold hover:text-sage-700">
              {language === 'en' ? 'Create account' : 'Criar conta'}
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/shop" className="text-sm text-sage-600 hover:text-sage-900">
            {language === 'en' ? 'Continue shopping' : 'Continuar comprando'}
          </Link>
        </div>
      </Card>
    </div>
  );
}
