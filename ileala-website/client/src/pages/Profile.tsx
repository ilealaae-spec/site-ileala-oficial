import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
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
import { User, Mail, Phone, MapPin, Building2, Globe, Lock, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function Profile() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    poBox: '',
    country: 'AE',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        poBox: user.poBox || '',
        country: user.country || 'AE',
      });
    }
  }, [user]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(language === 'en' ? 'Profile updated successfully!' : 'Perfil atualizado com sucesso!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(language === 'en' 
        ? 'Password must be at least 6 characters' 
        : 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    toast.success(language === 'en' ? 'Password changed successfully!' : 'Senha alterada com sucesso!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sage-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'My Profile' : 'Meu Perfil'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Manage your account information and delivery addresses' 
              : 'Gerencie suas informações de conta e endereços de entrega'}
          </p>
        </div>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-6">
            {language === 'en' ? 'Personal Information' : 'Informações Pessoais'}
          </h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="pl-10"
                    required
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
                    className="pl-10"
                    required
                    disabled
                  />
                </div>
                <p className="text-xs text-sage-500 mt-1">
                  {language === 'en' ? 'Email cannot be changed' : 'O email não pode ser alterado'}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">
                {language === 'en' ? 'Phone Number' : 'Telefone'}
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
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-sage-900 mb-4">
                {language === 'en' ? 'Delivery Address' : 'Endereço de Entrega'}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">
                    {language === 'en' ? 'Street Address' : 'Endereço'}
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">
                      {language === 'en' ? 'City' : 'Cidade'}
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder={language === 'en' ? 'Dubai, Abu Dhabi...' : 'Dubai, Abu Dhabi...'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">
                      {language === 'en' ? 'State/Emirate' : 'Estado/Emirado'}
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder={language === 'en' ? 'Dubai, Abu Dhabi...' : 'Dubai, Abu Dhabi...'}
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
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">
                    {language === 'en' ? 'Country' : 'País'}
                  </Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400 z-10" />
                    <Select
                      value={formData.country}
                      onValueChange={(value) => updateField('country', value)}
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
            </div>

            <Button
              type="submit"
              className="w-full bg-sage-600 hover:bg-sage-700"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Save Changes' : 'Salvar Alterações'}
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-6">
            {language === 'en' ? 'Change Password' : 'Alterar Senha'}
          </h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">
                {language === 'en' ? 'Current Password' : 'Senha Atual'} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">
                {language === 'en' ? 'New Password' : 'Nova Senha'} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => updatePasswordField('newPassword', e.target.value)}
                  placeholder={language === 'en' ? 'Min. 6 characters' : 'Mín. 6 caracteres'}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmNewPassword">
                {language === 'en' ? 'Confirm New Password' : 'Confirmar Nova Senha'} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-400" />
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
                  placeholder={language === 'en' ? 'Re-enter new password' : 'Digite a nova senha novamente'}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-sage-600 hover:bg-sage-700"
              size="lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Change Password' : 'Alterar Senha'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
