import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus('success');
      setMessage(language === 'en' 
        ? 'Your email has been verified successfully!' 
        : 'Seu email foi verificado com sucesso!');
      
      // Redirect to shop after 3 seconds
      setTimeout(() => {
        setLocation('/shop');
      }, 3000);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || (language === 'en' 
        ? 'Failed to verify email. The link may be invalid or expired.' 
        : 'Falha ao verificar email. O link pode ser inválido ou expirado.'));
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setStatus('error');
      setMessage(language === 'en' 
        ? 'No verification token provided.' 
        : 'Nenhum token de verificação fornecido.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-sage-600 animate-spin mb-4" />
              <h1 className="text-2xl font-display text-sage-900 mb-2">
                {language === 'en' ? 'Verifying your email...' : 'Verificando seu email...'}
              </h1>
              <p className="text-sage-600">
                {language === 'en' ? 'Please wait a moment.' : 'Por favor, aguarde um momento.'}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h1 className="text-2xl font-display text-sage-900 mb-2">
                {language === 'en' ? 'Email Verified!' : 'Email Verificado!'}
              </h1>
              <p className="text-sage-600 mb-6">{message}</p>
              <p className="text-sm text-sage-500">
                {language === 'en' 
                  ? 'Redirecting to shop...' 
                  : 'Redirecionando para a loja...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h1 className="text-2xl font-display text-sage-900 mb-2">
                {language === 'en' ? 'Verification Failed' : 'Verificação Falhou'}
              </h1>
              <p className="text-sage-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => setLocation('/shop')}
                  className="w-full bg-sage-600 hover:bg-sage-700"
                >
                  {language === 'en' ? 'Continue to Shop' : 'Continuar para Loja'}
                </Button>
                <Button
                  onClick={() => setLocation('/profile')}
                  variant="outline"
                  className="w-full"
                >
                  {language === 'en' ? 'Go to Profile' : 'Ir para Perfil'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
