import { useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPassword() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-sage-600" />
            </div>
            <h1 className="text-2xl font-semibold text-sage-900 mb-2">
              {language === 'en' ? 'Check your email' : 'Verifique seu email'}
            </h1>
            <p className="text-sage-600">
              {language === 'en' 
                ? 'If an account exists with this email, you will receive a password reset link.'
                : 'Se existir uma conta com este email, você receberá um link de recuperação de senha.'}
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/login">
              <button
                type="button"
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
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3D6A4A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4A7C59')}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{language === 'en' ? 'Back to Login' : 'Voltar ao Login'}</span>
              </button>
            </Link>
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
            {language === 'en' ? 'Forgot Password?' : 'Esqueceu a senha?'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Enter your email and we\'ll send you a reset link'
              : 'Digite seu email e enviaremos um link de recuperação'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-2">
              {language === 'en' ? 'Email' : 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          {forgotPasswordMutation.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {language === 'en'
                ? 'Failed to send reset link. Please try again later.'
                : 'Falha ao enviar link de recuperação. Tente novamente mais tarde.'}
            </div>
          )}

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
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
              cursor: forgotPasswordMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: forgotPasswordMutation.isPending ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => !forgotPasswordMutation.isPending && (e.currentTarget.style.backgroundColor = '#3D6A4A')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4A7C59')}
          >
            <Mail className="w-5 h-5" />
            <span>
              {forgotPasswordMutation.isPending 
                ? (language === 'en' ? 'Sending...' : 'Enviando...') 
                : (language === 'en' ? 'Send Reset Link' : 'Enviar Link')}
            </span>
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-sage-600 hover:text-sage-900">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              {language === 'en' ? 'Back to Login' : 'Voltar ao Login'}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
