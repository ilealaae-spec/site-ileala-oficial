import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Crown, Gift, Truck, Clock, Star, Phone, Calendar, ChevronRight, Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

export default function MyLoyalty() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [birthday, setBirthday] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const { data, isLoading, refetch } = trpc.loyalty.myStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateBirthdayMutation = trpc.loyalty.updateBirthday.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Birthday updated!' : 'Data de aniversário atualizada!');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateWhatsAppMutation = trpc.loyalty.updateWhatsApp.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'WhatsApp updated!' : 'WhatsApp atualizado!');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const claimBirthdayGiftMutation = trpc.loyalty.claimBirthdayGift.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetch();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => toast.error(error.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'en' ? 'Join Our Loyalty Program' : 'Participe do Nosso Programa'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'en'
              ? 'Sign in to access exclusive benefits and track your membership status.'
              : 'Entre para acessar benefícios exclusivos e acompanhar seu status de membro.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button>{language === 'en' ? 'Sign In' : 'Entrar'}</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">{language === 'en' ? 'Create Account' : 'Criar Conta'}</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const member = data?.member;
  const benefits = data?.benefits;
  const nextTierInfo = data?.nextTierInfo;
  const allTiers = data?.allTiers || [];

  const tierConfig: Record<string, { gradient: string; textColor: string; icon: string }> = {
    green: {
      gradient: 'linear-gradient(135deg, #255238 0%, #1a3d28 100%)',
      textColor: 'text-white',
      icon: '🌿',
    },
    silver: {
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
      textColor: 'text-gray-900',
      icon: '🥈',
    },
    gold: {
      gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
      textColor: 'text-gray-900',
      icon: '🏆',
    },
    platinum: {
      gradient: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 50%, #3d3d3d 100%)',
      textColor: 'text-white',
      icon: '👑',
    },
  };

  const currentTierConfig = tierConfig[member?.tier || 'green'];

  const formatPrice = (fils: number) => `${(fils / 100).toFixed(0)} AED`;

  const content = {
    en: {
      title: 'The Green World',
      subtitle: 'A universe by Ile Ala',
      memberSince: 'Member since',
      totalSpent: 'Total Spent',
      thisYear: 'This Year',
      allTime: 'All Time',
      nextTier: 'Next Tier',
      toReach: 'to reach',
      progress: 'Progress',
      yourBenefits: 'Your Benefits',
      allTiers: 'All Tiers',
      freeStandardShipping: 'Free Standard Shipping',
      freeExpressShipping: 'Free Express Shipping',
      earlyAccess: 'Early Access',
      hours: 'hours before launch',
      birthdayGift: 'Birthday Gift',
      prioritySupport: 'Priority Support',
      concierge: 'Personal Concierge',
      eventInvites: 'Event Invitations',
      surpriseGifts: 'Surprise Gifts',
      exclusiveProducts: 'Exclusive Products',
      updateBirthday: 'Set Your Birthday',
      birthdayDesc: 'Add your birthday to receive a special gift from us!',
      whatsappTitle: 'Platinum Concierge',
      whatsappDesc: 'Add your WhatsApp for personalized concierge service.',
      claimGift: 'Claim Birthday Gift',
      save: 'Save',
      youreAtTheTop: "You're at the top!",
      keepShopping: 'Keep shopping to enjoy your exclusive benefits.',
    },
    pt: {
      title: 'The Green World',
      subtitle: 'Um universo Ile Ala',
      memberSince: 'Membro desde',
      totalSpent: 'Total Gasto',
      thisYear: 'Este Ano',
      allTime: 'Total',
      nextTier: 'Próximo Nível',
      toReach: 'para alcançar',
      progress: 'Progresso',
      yourBenefits: 'Seus Benefícios',
      allTiers: 'Todos os Níveis',
      freeStandardShipping: 'Frete Standard Grátis',
      freeExpressShipping: 'Frete Expresso Grátis',
      earlyAccess: 'Acesso Antecipado',
      hours: 'horas antes do lançamento',
      birthdayGift: 'Presente de Aniversário',
      prioritySupport: 'Suporte Prioritário',
      concierge: 'Concierge Pessoal',
      eventInvites: 'Convites para Eventos',
      surpriseGifts: 'Presentes Surpresa',
      exclusiveProducts: 'Produtos Exclusivos',
      updateBirthday: 'Defina seu Aniversário',
      birthdayDesc: 'Adicione seu aniversário para receber um presente especial!',
      whatsappTitle: 'Concierge Platinum',
      whatsappDesc: 'Adicione seu WhatsApp para serviço de concierge personalizado.',
      claimGift: 'Resgatar Presente',
      save: 'Salvar',
      youreAtTheTop: 'Você está no topo!',
      keepShopping: 'Continue comprando para aproveitar seus benefícios exclusivos.',
    },
  };

  const t = content[language];

  // Get tier display name
  const getTierDisplayName = (tier: string) => {
    const names: Record<string, { en: string; pt: string }> = {
      green: { en: 'Green Member', pt: 'Membro Green' },
      silver: { en: 'Silver Member', pt: 'Membro Silver' },
      gold: { en: 'Gold Member', pt: 'Membro Gold' },
      platinum: { en: 'Platinum Member', pt: 'Membro Platinum' },
    };
    return names[tier]?.[language] || tier;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container max-w-5xl">
        {/* Elegant Welcome Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3">
            The Green World
          </p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {language === 'en' ? 'Hello' : 'Olá'}, <span className="font-medium">{user?.name?.split(' ')[0] || 'Member'}</span>
          </h1>
          <p className="text-lg text-gray-600 mt-4" style={{ fontFamily: 'Georgia, serif' }}>
            {language === 'en' ? 'Status: ' : 'Status: '}
            <span className="font-semibold" style={{
              color: member?.tier === 'gold' ? '#B8860B' :
                     member?.tier === 'silver' ? '#6B7280' :
                     member?.tier === 'platinum' ? '#1a1a1a' : '#255238'
            }}>
              {getTierDisplayName(member?.tier || 'green')}
            </span>
          </p>

          {/* Discrete Progress Bar */}
          {nextTierInfo?.nextTier && (
            <div className="max-w-md mx-auto mt-6">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${nextTierInfo.progress}%`,
                    background: member?.tier === 'gold' ? 'linear-gradient(90deg, #FFD700, #B8860B)' :
                               member?.tier === 'silver' ? 'linear-gradient(90deg, #C0C0C0, #808080)' :
                               member?.tier === 'platinum' ? 'linear-gradient(90deg, #3d3d3d, #1a1a1a)' :
                               'linear-gradient(90deg, #255238, #1a3d28)'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formatPrice(nextTierInfo.amountNeeded)} {language === 'en' ? 'until' : 'para'}{' '}
                <span className="font-medium">{nextTierInfo.nextTier.charAt(0).toUpperCase() + nextTierInfo.nextTier.slice(1)}</span>
              </p>
            </div>
          )}
          {!nextTierInfo?.nextTier && member?.tier === 'platinum' && (
            <p className="text-sm text-muted-foreground mt-4 italic">
              {language === 'en' ? 'You have reached our highest tier' : 'Você alcançou nosso nível mais alto'}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Loyalty Card Visual */}
          <div
            className="rounded-2xl p-8 shadow-2xl relative overflow-hidden h-64"
            style={{ background: currentTierConfig.gradient }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className={`relative z-10 h-full flex flex-col justify-between ${currentTierConfig.textColor}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{currentTierConfig.icon}</span>
                  <div>
                    <p className="text-sm opacity-80 tracking-widest">THE GREEN WORLD</p>
                    <p className="text-2xl font-bold uppercase tracking-wider">
                      {member?.tier?.toUpperCase() || 'GREEN'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold">{user?.name || 'Member'}</p>
                <p className="text-sm opacity-80">
                  {t.memberSince}{' '}
                  {member?.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-60">{t.thisYear}</p>
                  <p className="text-xl font-bold">{formatPrice(member?.totalSpentCurrentYear || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">{t.allTime}</p>
                  <p className="text-xl font-bold">{formatPrice(member?.totalSpentAllTime || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <Card className="p-6">
            {nextTierInfo?.nextTier ? (
              <>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5" />
                  {t.nextTier}: {nextTierInfo.nextTier.charAt(0).toUpperCase() + nextTierInfo.nextTier.slice(1)}
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t.progress}</span>
                    <span className="font-semibold">{nextTierInfo.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${nextTierInfo.progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{formatPrice(nextTierInfo.amountNeeded)}</span>{' '}
                  {t.toReach}{' '}
                  <span className="font-semibold">
                    {nextTierInfo.nextTier.charAt(0).toUpperCase() + nextTierInfo.nextTier.slice(1)}
                  </span>
                </p>

                <Link href="/shop">
                  <Button className="w-full mt-4">
                    {language === 'en' ? 'Shop Now' : 'Comprar Agora'}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">{t.youreAtTheTop}</h3>
                <p className="text-muted-foreground">{t.keepShopping}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Your Benefits */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {t.yourBenefits}
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Free Standard Shipping */}
            <div className={`p-4 rounded-lg border ${benefits?.freeStandardShipping === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.freeStandardShipping === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Truck className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.freeStandardShipping}</p>
                </div>
              </div>
            </div>

            {/* Free Express Shipping */}
            <div className={`p-4 rounded-lg border ${benefits?.freeExpressShipping === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.freeExpressShipping === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Truck className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.freeExpressShipping}</p>
                </div>
              </div>
            </div>

            {/* Early Access */}
            <div className={`p-4 rounded-lg border ${(benefits?.earlyAccessHours || 0) > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {(benefits?.earlyAccessHours || 0) > 0 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Clock className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.earlyAccess}</p>
                  {(benefits?.earlyAccessHours || 0) > 0 && (
                    <p className="text-xs text-muted-foreground">{benefits?.earlyAccessHours} {t.hours}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Birthday Gift */}
            <div className={`p-4 rounded-lg border ${benefits?.birthdayReward === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.birthdayReward === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Gift className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.birthdayGift}</p>
                </div>
              </div>
            </div>

            {/* Priority Support */}
            <div className={`p-4 rounded-lg border ${benefits?.prioritySupport === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.prioritySupport === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Star className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.prioritySupport}</p>
                </div>
              </div>
            </div>

            {/* Personal Concierge */}
            <div className={`p-4 rounded-lg border ${benefits?.personalConcierge === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.personalConcierge === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Phone className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.concierge}</p>
                </div>
              </div>
            </div>

            {/* Event Invites */}
            <div className={`p-4 rounded-lg border ${benefits?.eventInvites === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.eventInvites === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Calendar className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.eventInvites}</p>
                </div>
              </div>
            </div>

            {/* Surprise Gifts */}
            <div className={`p-4 rounded-lg border ${benefits?.surpriseGifts === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.surpriseGifts === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Gift className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.surpriseGifts}</p>
                </div>
              </div>
            </div>

            {/* Exclusive Products */}
            <div className={`p-4 rounded-lg border ${benefits?.exclusiveProducts === 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
              <div className="flex items-center gap-3">
                {benefits?.exclusiveProducts === 1 ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Crown className="w-5 h-5 text-primary mb-1" />
                  <p className="font-medium text-sm">{t.exclusiveProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Birthday Setting */}
          {benefits?.birthdayReward === 1 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-500" />
                {t.updateBirthday}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{t.birthdayDesc}</p>

              {member?.birthday ? (
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {new Date(member.birthday).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {member.birthdayGiftClaimed === 0 && (
                    <Button
                      onClick={() => claimBirthdayGiftMutation.mutate()}
                      disabled={claimBirthdayGiftMutation.isPending}
                    >
                      {claimBirthdayGiftMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {t.claimGift}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                  <Button
                    onClick={() => updateBirthdayMutation.mutate({ birthday })}
                    disabled={!birthday || updateBirthdayMutation.isPending}
                  >
                    {updateBirthdayMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.save}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* WhatsApp Concierge (Platinum only) */}
          {benefits?.personalConcierge === 1 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                {t.whatsappTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{t.whatsappDesc}</p>

              {member?.whatsappNumber ? (
                <p className="font-medium">{member.whatsappNumber}</p>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <Button
                    onClick={() => updateWhatsAppMutation.mutate({ whatsappNumber: whatsapp })}
                    disabled={!whatsapp || updateWhatsAppMutation.isPending}
                  >
                    {updateWhatsAppMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.save}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* All Tiers Overview */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold mb-6">{t.allTiers}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allTiers.map((tier) => {
              const config = tierConfig[tier.tier];
              const isCurrentTier = tier.tier === member?.tier;
              return (
                <div
                  key={tier.id}
                  className={`rounded-xl p-4 text-center transition-transform ${isCurrentTier ? 'ring-2 ring-primary scale-105' : ''}`}
                  style={{ background: config?.gradient || '#ccc' }}
                >
                  <p className={`text-3xl mb-2 ${config?.textColor}`}>{config?.icon}</p>
                  <p className={`font-bold text-lg mb-1 ${config?.textColor}`}>
                    {language === 'en' ? tier.displayNameEN : tier.displayNamePT}
                  </p>
                  <p className={`text-sm opacity-80 ${config?.textColor}`}>
                    {formatPrice(tier.minSpend)}
                    {tier.maxSpend ? ` - ${formatPrice(tier.maxSpend)}` : '+'}
                  </p>
                  {isCurrentTier && (
                    <p className={`text-xs mt-2 font-semibold ${config?.textColor}`}>
                      {language === 'en' ? 'YOUR LEVEL' : 'SEU NÍVEL'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
