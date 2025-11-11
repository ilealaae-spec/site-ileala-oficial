import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const utils = trpc.useUtils();
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Login successful!' : 'Login realizado com sucesso!');
      utils.auth.me.invalidate();
      
      // Redirect to cart or home
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/cart';
      setLocation(redirect);
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Invalid email or password' : 'Email ou senha inválidos'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(language === 'en' ? 'Please fill in all fields' : 'Por favor, preencha todos os campos');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="h-16 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Welcome Back' : 'Bem-vindo de Volta'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' ? 'Sign in to your account' : 'Entre na sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
        </form>

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
