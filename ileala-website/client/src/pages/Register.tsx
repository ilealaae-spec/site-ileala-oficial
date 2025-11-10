import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, UserPlus } from 'lucide-react';

export default function Register() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const utils = trpc.useUtils();
  
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Account created successfully!' : 'Conta criada com sucesso!');
      utils.auth.me.invalidate();
      
      // Redirect to cart or home
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/cart';
      setLocation(redirect);
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to create account' : 'Falha ao criar conta'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error(language === 'en' ? 'Please fill in all fields' : 'Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      return;
    }

    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/">
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="h-16 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Create Account' : 'Criar Conta'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' ? 'Join us for exclusive luxury table décor' : 'Junte-se a nós para decoração de mesa de luxo exclusiva'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-sage-900 mb-2">
              {language === 'en' ? 'Full Name' : 'Nome Completo'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? 'John Doe' : 'João Silva'}
                className="pl-10"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

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
                disabled={registerMutation.isPending}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'en' ? 'At least 6 characters' : 'Pelo menos 6 caracteres'}
                className="pl-10"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-900 mb-2">
              {language === 'en' ? 'Confirm Password' : 'Confirmar Senha'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'en' ? 'Confirm your password' : 'Confirme sua senha'}
                className="pl-10"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-sage-600 hover:bg-sage-700"
            size="lg"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {language === 'en' ? 'Creating account...' : 'Criando conta...'}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Create Account' : 'Criar Conta'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sage-600">
            {language === 'en' ? 'Already have an account?' : 'Já tem uma conta?'}{' '}
            <Link href="/login" className="text-sage-900 font-semibold hover:text-sage-700">
              {language === 'en' ? 'Sign in' : 'Entrar'}
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
