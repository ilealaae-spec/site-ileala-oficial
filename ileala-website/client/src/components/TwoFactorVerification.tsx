import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';

interface TwoFactorVerificationProps {
  tempToken: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function TwoFactorVerification({ tempToken, onSuccess, onBack }: TwoFactorVerificationProps) {
  const { language } = useLanguage();
  const [code, setCode] = useState('');

  const utils = trpc.useUtils();

  const verify2FAMutation = trpc.auth.verify2FALogin.useMutation({
    onSuccess: async (data) => {
      console.log('[2FA] Verification successful!', data);
      toast.success(language === 'en' ? 'Login successful!' : 'Login realizado com sucesso!');
      
      // Invalidate auth data
      await utils.auth.me.invalidate();
      
      // Wait a bit for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call success callback
      onSuccess();
    },
    onError: (error) => {
      console.error('[2FA] Verification error:', error);
      toast.error(error.message || (language === 'en' ? 'Invalid verification code' : 'Código de verificação inválido'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize code: remove spaces and convert to uppercase
    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    
    // Accept either:
    // - 6-digit TOTP code (numbers only)
    // - 8-character backup code (alphanumeric, with or without hyphen)
    if (!normalizedCode || (normalizedCode.length !== 6 && normalizedCode.length !== 8)) {
      toast.error(
        language === 'en' 
          ? 'Please enter a 6-digit code or 8-character backup code' 
          : 'Por favor, digite um código de 6 dígitos ou código de backup de 8 caracteres'
      );
      return;
    }

    verify2FAMutation.mutate({ tempToken, code: normalizedCode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-sage-100 rounded-full">
              <Shield className="w-12 h-12 text-sage-700" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Two-Factor Authentication' : 'Autenticação de Dois Fatores'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Enter the 6-digit code from your authenticator app or an 8-character backup code' 
              : 'Digite o código de 6 dígitos do seu aplicativo autenticador ou um código de backup de 8 caracteres'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-sage-900 mb-2">
              {language === 'en' ? 'Verification Code' : 'Código de Verificação'}
            </label>
            <Input
              id="code"
              type="text"
              maxLength={9}
              value={code}
              onChange={(e) => {
                // Allow alphanumeric and hyphens, convert to uppercase
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                setCode(value);
              }}
              placeholder="000000 ou XXXX-XXXX"
              className="text-center text-2xl font-mono tracking-widest"
              disabled={verify2FAMutation.isPending}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={verify2FAMutation.isPending || (code.trim().replace(/[^A-Z0-9]/g, '').length !== 6 && code.trim().replace(/[^A-Z0-9]/g, '').length !== 8)}
              className="w-full"
            >
              {verify2FAMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'en' ? 'Verify & Sign In' : 'Verificar e Entrar'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={verify2FAMutation.isPending}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Login' : 'Voltar ao Login'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-sage-600">
          <p>
            {language === 'en' 
              ? "Can't access your authenticator? Use a backup code (8 characters) or contact support." 
              : 'Não consegue acessar seu autenticador? Use um código de backup (8 caracteres) ou entre em contato com o suporte.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
