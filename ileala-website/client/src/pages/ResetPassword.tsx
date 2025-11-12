import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ResetPassword() {
  const { language } = useLanguage();
  const [location, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get token from URL query params
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const token = searchParams.get('token') || '';

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      alert(language === 'en' ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-sage-900 mb-2">
              {language === 'en' ? 'Password Reset Successful!' : 'Senha Redefinida!'}
            </h1>
            <p className="text-sage-600 mb-4">
              {language === 'en' 
                ? 'Your password has been updated successfully. Redirecting to login...'
                : 'Sua senha foi atualizada com sucesso. Redirecionando para o login...'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="ILE ALA" 
              className="h-16 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-semibold text-sage-900 mb-2">
            {language === 'en' ? 'Reset Password' : 'Redefinir Senha'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Enter your new password below'
              : 'Digite sua nova senha abaixo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-sage-700 mb-2">
              {language === 'en' ? 'New Password' : 'Nova Senha'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'en' ? 'Min. 6 characters' : 'Mín. 6 caracteres'}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-700 mb-2">
              {language === 'en' ? 'Confirm Password' : 'Confirmar Senha'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'en' ? 'Re-enter password' : 'Digite novamente'}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {resetPasswordMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {resetPasswordMutation.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            style={{
              width: '100%',
              backgroundColor: '#4A7C59',
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
              cursor: resetPasswordMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: resetPasswordMutation.isPending ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !resetPasswordMutation.isPending && (e.currentTarget.style.backgroundColor = '#3D6A4A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4A7C59')}
          >
            <Lock className="w-5 h-5" />
            <span>
              {resetPasswordMutation.isPending 
                ? (language === 'en' ? 'Resetting...' : 'Redefinindo...') 
                : (language === 'en' ? 'Reset Password' : 'Redefinir Senha')}
            </span>
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-sage-600 hover:text-sage-900">
              {language === 'en' ? 'Back to Login' : 'Voltar ao Login'}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
