import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Building2, Globe, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    poBox: '',
    country: 'AE', // Default to UAE
  });

  const utils = trpc.useUtils();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      console.log('[Register] Registration successful:', data);
      toast.success(language === 'en' ? 'Account created successfully! Please check your email to verify your account.' : 'Conta criada com sucesso! Por favor, verifique seu email para confirmar sua conta.');
      utils.auth.me.invalidate();
      
      // Aguardar um pouco antes de redirecionar para garantir que o cookie foi definido
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/cart';
        console.log('[Register] Redirecting to:', redirect);
        setLocation(redirect);
      }, 500);
    },
    onError: (error) => {
      console.error('[Register] Registration error:', error);
      const errorMessage = error.message || (language === 'en' ? 'Failed to create account' : 'Falha ao criar conta');
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error(language === 'en' 
        ? 'Password must be at least 6 characters' 
        : 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      poBox: formData.poBox,
      country: formData.country,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const countries = [
    { code: 'AE', name: language === 'en' ? 'United Arab Emirates' : 'Emirados Árabes Unidos' },
    { code: 'SA', name: language === 'en' ? 'Saudi Arabia' : 'Arábia Saudita' },
    { code: 'QA', name: language === 'en' ? 'Qatar' : 'Catar' },
    { code: 'KW', name: language === 'en' ? 'Kuwait' : 'Kuwait' },
    { code: 'BH', name: language === 'en' ? 'Bahrain' : 'Bahrein' },
    { code: 'OM', name: language === 'en' ? 'Oman' : 'Omã' },
    { code: 'BR', name: language === 'en' ? 'Brazil' : 'Brasil' },
    { code: 'US', name: language === 'en' ? 'United States' : 'Estados Unidos' },
    { code: 'GB', name: language === 'en' ? 'United Kingdom' : 'Reino Unido' },
  ];

  return (
    <div className="min-h-screen bg-sage-50 px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center mb-4">
          <Link href="/">
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="h-20 w-auto mx-auto mb-4 object-contain"
              style={{ maxWidth: '200px' }}
            />
          </Link>
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Create Account' : 'Criar Conta'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Join us to start shopping' 
              : 'Junte-se a nós para começar a comprar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sage-900">
              {language === 'en' ? 'Personal Information' : 'Informações Pessoais'}
            </h3>
            
            <div>
              <Label htmlFor="name">
                {language === 'en' ? 'Full Name' : 'Nome Completo'} *
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={language === 'en' ? 'Enter your full name' : 'Digite seu nome completo'}
                  className="pl-10"
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">
                {language === 'en' ? 'Email' : 'E-mail'} *
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder={language === 'en' ? 'Enter your email' : 'Digite seu e-mail'}
                  className="pl-10"
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">
                {language === 'en' ? 'Phone Number' : 'Telefone'} *
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder={language === 'en' ? '+971 XX XXX XXXX' : '+971 XX XXX XXXX'}
                  className="pl-10"
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">
                  {language === 'en' ? 'Password' : 'Senha'} *
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder={language === 'en' ? 'Min. 6 characters' : 'Mín. 6 caracteres'}
                    className="pl-10 pr-10"
                    required
                    disabled={registerMutation.isPending}
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

              <div>
                <Label htmlFor="confirmPassword">
                  {language === 'en' ? 'Confirm Password' : 'Confirmar Senha'} *
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    placeholder={language === 'en' ? 'Re-enter password' : 'Digite a senha novamente'}
                    className="pl-10 pr-10"
                    required
                    disabled={registerMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-sage-900">
              {language === 'en' ? 'Delivery Address' : 'Endereço de Entrega'}
            </h3>

            <div>
              <Label htmlFor="address">
                {language === 'en' ? 'Street Address' : 'Endereço'} *
              </Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={language === 'en' ? 'Street, building, apartment' : 'Rua, prédio, apartamento'}
                  className="pl-10"
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">
                  {language === 'en' ? 'City' : 'Cidade'} *
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder={language === 'en' ? 'Dubai, Abu Dhabi...' : 'Dubai, Abu Dhabi...'}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="state">
                  {language === 'en' ? 'State/Emirate' : 'Estado/Emirado'} *
                </Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder={language === 'en' ? 'Dubai, Abu Dhabi...' : 'Dubai, Abu Dhabi...'}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poBox">
                  {language === 'en' ? 'PO Box' : 'Caixa Postal'}
                </Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                  <Input
                    id="poBox"
                    type="text"
                    value={formData.poBox}
                    onChange={(e) => updateField('poBox', e.target.value)}
                    placeholder={language === 'en' ? 'Optional' : 'Opcional'}
                    className="pl-10"
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

            </div>

            <div>
              <Label htmlFor="country">
                {language === 'en' ? 'Country' : 'País'} *
              </Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400 z-10" />
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateField('country', value)}
                  disabled={registerMutation.isPending}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button with extra spacing */}
          <div className="pt-8 mt-8 border-t">
            <button
              type="submit"
              disabled={registerMutation.isPending}
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
                cursor: registerMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: registerMutation.isPending ? 0.5 : 1,
                transition: 'all 0.2s',
                minHeight: '56px'
              }}
              onMouseEnter={(e) => !registerMutation.isPending && (e.currentTarget.style.backgroundColor = '#3D6A4A')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4A7C59'}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span style={{ color: '#FFFFFF', fontSize: '18px' }}>{language === 'en' ? 'Creating account...' : 'Criando conta...'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600' }}>{language === 'en' ? 'Create Account' : 'Criar Conta'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sage-600">
            {language === 'en' ? 'Already have an account?' : 'Já tem uma conta?'}{' '}
            <Link href="/login" className="text-sage-900 font-semibold hover:text-sage-700">
              {language === 'en' ? 'Sign in' : 'Entrar'}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/shop" className="text-sm text-sage-600 hover:text-sage-900">
            {language === 'en' ? 'Continue shopping' : 'Continuar comprando'}
          </Link>
        </div>
      </Card>
    </div>
  );
}
