import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Crown, Gift, Truck, Clock, Star, Phone, Calendar, ChevronRight, Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

// Default hero image - can be changed via admin settings
const DEFAULT_HERO_IMAGE = '/images/loyalty-hero.webp';

export default function MyLoyalty() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [birthday, setBirthday] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedTierView, setSelectedTierView] = useState<string | null>(null);

  // State for card flip
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Fetch loyalty hero settings
  const { data: heroImageSetting } = trpc.settings.get.useQuery({ key: 'loyalty-hero-image' });
  const { data: heroTitleSetting } = trpc.settings.get.useQuery({ key: 'loyalty-hero-title' });
  const { data: heroSubtitleSetting } = trpc.settings.get.useQuery({ key: 'loyalty-hero-subtitle' });

  // Fetch all tier-related settings (icons, subtitles, etc)
  const { data: allSettings } = trpc.settings.list.useQuery();

  // Build a settings map for easy access to tier customizations
  const tierCustomSettings: Record<string, string> = {};
  if (allSettings) {
    allSettings.forEach((s: any) => {
      if (s.key.startsWith('tier-') || s.key.startsWith('progress-')) {
        tierCustomSettings[s.key] = s.value;
      }
    });
  }

  // Helper to get custom icon for a tier
  const getTierIcon = (tier: string) => {
    return tierCustomSettings[`tier-${tier}-icon`] || '/images/palmeira-black.svg';
  };

  // Helper to get custom subtitle for a tier
  const getTierSubtitle = (tier: string, lang: string) => {
    const key = `tier-${tier}-subtitle-${lang}`;
    return tierCustomSettings[key] || '';
  };

  // Helper to get card back image for a tier
  const getTierCardBack = (tier: string) => {
    return tierCustomSettings[`tier-${tier}-card-back`] || '';
  };

  // Default titles and subtitles for each tier progress card
  const tierProgressDefaults: Record<string, { titleEN: string; titlePT: string; subtitleEN: string; subtitlePT: string; defaultColor: string }> = {
    green: {
      titleEN: 'Welcome to Green!',
      titlePT: 'Bem-vindo ao Green!',
      subtitleEN: 'Keep shopping to unlock Silver benefits.',
      subtitlePT: 'Continue comprando para desbloquear benefícios Silver.',
      defaultColor: '#e8f5e9',
    },
    silver: {
      titleEN: 'Silver Member',
      titlePT: 'Membro Silver',
      subtitleEN: 'Keep shopping to unlock Gold benefits.',
      subtitlePT: 'Continue comprando para desbloquear benefícios Gold.',
      defaultColor: '#f5f5f5',
    },
    gold: {
      titleEN: 'Gold Member',
      titlePT: 'Membro Gold',
      subtitleEN: 'Keep shopping to unlock Black benefits.',
      subtitlePT: 'Continue comprando para desbloquear benefícios Black.',
      defaultColor: '#fff8e1',
    },
    platinum: {
      titleEN: "You're at the top!",
      titlePT: 'Você está no topo!',
      subtitleEN: 'Keep shopping to enjoy your exclusive benefits.',
      subtitlePT: 'Continue comprando para aproveitar seus benefícios exclusivos.',
      defaultColor: '#ffffff',
    },
  };

  // Helpers for progress card customization (works for all 4 tiers)
  const getProgressIcon = (tier: string) => tierCustomSettings[`progress-${tier}-icon`] || '/images/palmeira-black.svg';
  const getProgressBgImage = (tier: string) => tierCustomSettings[`progress-${tier}-bg-image`] || '';
  const getProgressBgColor = (tier: string) => tierCustomSettings[`progress-${tier}-bg-color`] || tierProgressDefaults[tier]?.defaultColor || '#ffffff';
  const getProgressTitle = (tier: string, lang: string) => {
    const key = `progress-${tier}-title-${lang}`;
    const defaults = tierProgressDefaults[tier];
    return tierCustomSettings[key] || (lang === 'en' ? defaults?.titleEN : defaults?.titlePT) || '';
  };
  const getProgressSubtitle = (tier: string, lang: string) => {
    const key = `progress-${tier}-subtitle-${lang}`;
    const defaults = tierProgressDefaults[tier];
    return tierCustomSettings[key] || (lang === 'en' ? defaults?.subtitleEN : defaults?.subtitlePT) || '';
  };

  const heroImage = heroImageSetting?.value || DEFAULT_HERO_IMAGE;
  const heroTitle = heroTitleSetting?.value || 'Inside The Green World';
  const heroSubtitle = heroSubtitleSetting?.value || 'A private universe where ritual, beauty, and time shape the art of living.';

  // Fetch tier benefits (includes iconUrl for card images)
  const { data: tierBenefitsData } = trpc.loyalty.getTierBenefits.useQuery(undefined, {
    enabled: !isAuthenticated,
  });

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

  // Content for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="w-full">
        {/* Hero Section for non-logged users */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

          <div className="relative z-10 text-center text-white px-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] mb-4 opacity-90">Loyalty Program</p>
            <h1 className="text-5xl md:text-7xl font-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              The Green World
            </h1>
            <p className="text-xl md:text-2xl font-light italic mb-8 opacity-90" style={{ fontFamily: 'Georgia, serif' }}>
              {language === 'en' ? 'A universe by Ile Ala' : 'Um universo Ile Ala'}
            </p>
            <p className="text-lg mb-10 max-w-xl mx-auto opacity-90">
              {language === 'en'
                ? 'Join our exclusive loyalty program and enjoy unique benefits, special rewards, and personalized experiences.'
                : 'Participe do nosso programa de fidelidade exclusivo e aproveite benefícios únicos, recompensas especiais e experiências personalizadas.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8">
                  {language === 'en' ? 'Sign In' : 'Entrar'}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 px-8">
                  {language === 'en' ? 'Create Account' : 'Criar Conta'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tiers Preview Section */}
        <section className="py-20 bg-white">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                {language === 'en' ? 'Membership Tiers' : 'Níveis de Assinatura'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {language === 'en'
                  ? 'The more you shop, the more you earn. Unlock exclusive benefits as you progress through our tiers.'
                  : 'Quanto mais você compra, mais você ganha. Desbloqueie benefícios exclusivos conforme avança nos níveis.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const defaultTiers = [
                  { tier: 'green', displayName: 'Green', gradient: 'linear-gradient(135deg, #3A5F4F 0%, #2D4A3E 50%, #1E3329 100%)', backgroundImage: '/images/tier-cards/green-card.png', textColor: 'text-white', range: '0 - 1,499 AED', benefits: ['Newsletter Exclusiva', 'Acesso a Vendas Privadas'] },
                  { tier: 'silver', displayName: 'Silver', gradient: 'linear-gradient(135deg, #D8D8D8 0%, #A8A8A8 50%, #888888 100%)', backgroundImage: '/images/tier-cards/silver-card.png', textColor: 'text-white', range: '1,500 - 3,999 AED', benefits: ['Frete Padrão Grátis (UAE)', 'Presente de Aniversário'] },
                  { tier: 'gold', displayName: 'Gold', gradient: 'linear-gradient(135deg, #E8D48A 0%, #C5A849 50%, #9A7B2F 100%)', backgroundImage: '/images/tier-cards/gold-card.png', textColor: 'text-white', range: '4,000 - 7,499 AED', benefits: ['Frete Expresso Grátis', 'Acesso Antecipado 24h', 'Suporte Prioritário'] },
                  { tier: 'platinum', displayName: 'Black', gradient: 'linear-gradient(135deg, #5A5A5A 0%, #3D3D3D 50%, #2C2C2C 100%)', backgroundImage: '/images/tier-cards/black-card.png', textColor: 'text-white', range: '7,500+ AED', benefits: ['Concierge WhatsApp VIP', 'Convites para Eventos', 'Presentes Surpresa'] },
                ];

                return defaultTiers.map((t) => {
                  const dbTier = tierBenefitsData?.find((tb: any) => tb.tier === t.tier);
                  const hasDbImage = dbTier?.iconUrl;
                  const backgroundImage = hasDbImage ? dbTier.iconUrl : t.backgroundImage;

                  return (
                    <div
                      key={t.tier}
                      className="rounded-2xl p-6 text-center text-white relative overflow-hidden"
                      style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {/* Overlay for text readability */}
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative z-10">
                        {/* Header with tier name and icon */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{t.displayName}</h3>
                          <img
                            src={getTierIcon(t.tier)}
                            alt="tier icon"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <p className="text-sm opacity-80 mb-4 text-left">{t.range}</p>
                        {/* Subtitle if configured */}
                        {getTierSubtitle(t.tier, language) && (
                          <p className="text-xs opacity-80 text-white mb-3 italic text-left">
                            {getTierSubtitle(t.tier, language)}
                          </p>
                        )}
                        <ul className="text-sm text-left space-y-2 opacity-90">
                          {t.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-4 h-4" /> {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>
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

  // Sort tiers in correct order: green, silver, gold, platinum(black)
  const tierOrder = ['green', 'silver', 'gold', 'platinum'];
  const allTiers = (data?.allTiers || []).sort((a: any, b: any) =>
    tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  // Helper to get display name (converts Platinum to Black)
  const getTierDisplayName = (tier: any, lang: string) => {
    const name = lang === 'en' ? tier.displayNameEN : tier.displayNamePT;
    // Replace Platinum with Black in display names
    if (tier.tier === 'platinum') {
      return lang === 'en' ? 'Black Member' : 'Membro Black';
    }
    return name;
  };

  const tierConfig: Record<string, { gradient: string; textColor: string; backgroundImage?: string }> = {
    green: {
      gradient: 'linear-gradient(135deg, #3A5F4F 0%, #2D4A3E 50%, #1E3329 100%)',
      textColor: 'text-white',
      backgroundImage: '/images/tier-cards/green-card.png',
    },
    silver: {
      gradient: 'linear-gradient(135deg, #D8D8D8 0%, #A8A8A8 50%, #888888 100%)',
      textColor: 'text-gray-900',
      backgroundImage: '/images/tier-cards/silver-card.png',
    },
    gold: {
      gradient: 'linear-gradient(135deg, #E8D48A 0%, #C5A849 50%, #9A7B2F 100%)',
      textColor: 'text-gray-900',
      backgroundImage: '/images/tier-cards/gold-card.png',
    },
    platinum: {
      gradient: 'linear-gradient(135deg, #5A5A5A 0%, #3D3D3D 50%, #2C2C2C 100%)',
      textColor: 'text-white',
      backgroundImage: '/images/tier-cards/black-card.png',
    },
  };

  // Get the current tier config, using database iconUrl if available
  const currentUserTier = member?.tier || 'green';
  const dbTierData = allTiers.find((t: any) => t.tier === currentUserTier);
  const currentTierConfig = {
    ...tierConfig[currentUserTier],
    // Use database iconUrl if available, otherwise use default
    backgroundImage: dbTierData?.iconUrl || tierConfig[currentUserTier].backgroundImage,
  };

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
      whatsappTitle: 'Black Concierge',
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
      whatsappTitle: 'Concierge Black',
      whatsappDesc: 'Adicione seu WhatsApp para serviço de concierge personalizado.',
      claimGift: 'Resgatar Presente',
      save: 'Salvar',
      youreAtTheTop: 'Você está no topo!',
      keepShopping: 'Continue comprando para aproveitar seus benefícios exclusivos.',
    },
  };

  const t = content[language];

  return (
    <div className="w-full">
      {/* Hero Section for logged in users */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container max-w-5xl">
          {/* Main Card */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Loyalty Card Visual with Flip Effect */}
            <div
              className="h-64 cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={() => setIsCardFlipped(!isCardFlipped)}
            >
              <div
                className="relative w-full h-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front of Card */}
                <div
                  className="absolute inset-0 rounded-2xl p-8 shadow-2xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    ...(currentTierConfig.backgroundImage ? {
                      backgroundImage: `url(${currentTierConfig.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : {
                      background: currentTierConfig.gradient,
                    }),
                  }}
                >
                  {/* Subtle overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/20" />

                  <div className={`relative z-10 h-full flex flex-col justify-between ${currentTierConfig.textColor}`}>
                    <div className="flex justify-between items-start">
                      <div className="mb-2">
                        <p className="text-sm opacity-80 tracking-widest">THE GREEN WORLD</p>
                        <p className="text-2xl font-bold uppercase tracking-wider">
                          {member?.tier === 'platinum' ? 'BLACK' : (member?.tier?.toUpperCase() || 'GREEN')}
                        </p>
                      </div>
                      {/* Tier icon */}
                      <img
                        src={getTierIcon(currentUserTier)}
                        alt="tier icon"
                        className="w-10 h-10 object-contain"
                      />
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

                  {/* Click hint */}
                  <div className="absolute bottom-2 right-2 text-white/50 text-xs">
                    {language === 'en' ? 'Click to flip' : 'Clique para virar'}
                  </div>
                </div>

                {/* Back of Card */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {getTierCardBack(currentUserTier) ? (
                    // Custom back image from admin
                    <div className="relative w-full h-full">
                      <img
                        src={getTierCardBack(currentUserTier)}
                        alt="Card back"
                        className="w-full h-full object-cover"
                      />
                      {/* Member ID overlay on custom image */}
                      {member?.memberId && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
                            <p className="text-xs text-white/70 uppercase tracking-wider">Member ID</p>
                            <p className="text-lg font-mono text-white tracking-widest">{member.memberId}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Default back design
                    <div
                      className="w-full h-full flex flex-col items-center justify-between py-6"
                      style={{
                        background: currentTierConfig.gradient,
                      }}
                    >
                      <div className="text-center text-white flex-1 flex flex-col items-center justify-center">
                        <img
                          src="/images/palmeira-black.svg"
                          alt="ILE ALA"
                          className="w-20 h-20 mx-auto mb-3 invert"
                        />
                        <p className="text-lg font-light tracking-widest">ILE ALA</p>
                        <p className="text-sm opacity-70">The Green World</p>
                      </div>

                      {/* Member ID section */}
                      {member?.memberId && (
                        <div className="text-center text-white mt-4 border-t border-white/20 pt-4 w-full px-6">
                          <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Member ID</p>
                          <p className="text-xl font-mono tracking-widest">{member.memberId}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Click hint on back */}
                  <div className="absolute bottom-2 right-2 text-white/50 text-xs">
                    {language === 'en' ? 'Click to flip' : 'Clique para virar'}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card - Customized for each tier */}
            <Card className="p-6 overflow-hidden">
              {/* Custom Progress Card for current tier */}
              <div
                className="text-center py-6 flex flex-col items-center justify-center h-full rounded-lg relative overflow-hidden"
                style={{
                  backgroundColor: getProgressBgImage(currentUserTier) ? undefined : getProgressBgColor(currentUserTier),
                  backgroundImage: getProgressBgImage(currentUserTier) ? `url(${getProgressBgImage(currentUserTier)})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {getProgressBgImage(currentUserTier) && <div className="absolute inset-0 bg-black/20" />}
                <div className="relative z-10">
                  <img
                    src={getProgressIcon(currentUserTier)}
                    alt="ILE ALA"
                    className="w-24 h-24 mx-auto mb-4 object-contain"
                  />
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: getProgressBgImage(currentUserTier) ? '#fff' : undefined }}
                  >
                    {getProgressTitle(currentUserTier, language)}
                  </h3>
                  <p
                    className={getProgressBgImage(currentUserTier) ? '' : 'text-muted-foreground'}
                    style={{ color: getProgressBgImage(currentUserTier) ? 'rgba(255,255,255,0.8)' : undefined }}
                  >
                    {getProgressSubtitle(currentUserTier, language)}
                  </p>
                </div>
              </div>

              {/* Progress bar to next tier (only if not at max) */}
              {nextTierInfo?.nextTier && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    {t.nextTier}: {nextTierInfo.nextTier === 'platinum' ? 'Black' : nextTierInfo.nextTier.charAt(0).toUpperCase() + nextTierInfo.nextTier.slice(1)}
                  </h4>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t.progress}</span>
                      <span className="font-semibold">{nextTierInfo.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${nextTierInfo.progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    <span className="font-semibold text-primary">{formatPrice(nextTierInfo.amountNeeded)}</span>{' '}
                    {t.toReach}{' '}
                    <span className="font-semibold">
                      {nextTierInfo.nextTier === 'platinum' ? 'Black' : nextTierInfo.nextTier.charAt(0).toUpperCase() + nextTierInfo.nextTier.slice(1)}
                    </span>
                  </p>

                  <Link href="/shop">
                    <Button className="w-full" size="sm">
                      {language === 'en' ? 'Shop Now' : 'Comprar Agora'}
                    </Button>
                  </Link>
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
              <div
                className={`p-4 rounded-lg border ${benefits?.freeStandardShipping !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.freeStandardShipping === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.freeStandardShipping === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Truck className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.freeStandardShipping}</p>
                  </div>
                </div>
              </div>

              {/* Free Express Shipping */}
              <div
                className={`p-4 rounded-lg border ${benefits?.freeExpressShipping !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.freeExpressShipping === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.freeExpressShipping === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Truck className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.freeExpressShipping}</p>
                  </div>
                </div>
              </div>

              {/* Early Access */}
              <div
                className={`p-4 rounded-lg border ${(benefits?.earlyAccessHours || 0) <= 0 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={(benefits?.earlyAccessHours || 0) > 0 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {(benefits?.earlyAccessHours || 0) > 0 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Clock className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.earlyAccess}</p>
                    {(benefits?.earlyAccessHours || 0) > 0 && (
                      <p className="text-xs text-muted-foreground">{benefits?.earlyAccessHours} {t.hours}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Birthday Gift */}
              <div
                className={`p-4 rounded-lg border ${benefits?.birthdayReward !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.birthdayReward === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.birthdayReward === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Gift className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.birthdayGift}</p>
                  </div>
                </div>
              </div>

              {/* Priority Support */}
              <div
                className={`p-4 rounded-lg border ${benefits?.prioritySupport !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.prioritySupport === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.prioritySupport === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Star className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.prioritySupport}</p>
                  </div>
                </div>
              </div>

              {/* Personal Concierge */}
              <div
                className={`p-4 rounded-lg border ${benefits?.personalConcierge !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.personalConcierge === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.personalConcierge === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Phone className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.concierge}</p>
                  </div>
                </div>
              </div>

              {/* Event Invites */}
              <div
                className={`p-4 rounded-lg border ${benefits?.eventInvites !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.eventInvites === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.eventInvites === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Calendar className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.eventInvites}</p>
                  </div>
                </div>
              </div>

              {/* Surprise Gifts */}
              <div
                className={`p-4 rounded-lg border ${benefits?.surpriseGifts !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.surpriseGifts === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.surpriseGifts === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Gift className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                    <p className="font-medium text-sm">{t.surpriseGifts}</p>
                  </div>
                </div>
              </div>

              {/* Exclusive Products */}
              <div
                className={`p-4 rounded-lg border ${benefits?.exclusiveProducts !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                style={benefits?.exclusiveProducts === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
              >
                <div className="flex items-center gap-3">
                  {benefits?.exclusiveProducts === 1 ? (
                    <Check className="w-5 h-5" style={{ color: '#255238' }} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Crown className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
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
            <h3 className="text-xl font-semibold mb-2">{t.allTiers}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'en' ? 'Click on a tier to see its benefits' : 'Clique em um nível para ver seus benefícios'}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {allTiers.map((tier) => {
                const config = tierConfig[tier.tier];
                const isCurrentTier = tier.tier === member?.tier;
                const isSelected = selectedTierView === tier.tier;
                // Use database image if available, otherwise use our tier-cards images
                const backgroundImage = tier.iconUrl || config?.backgroundImage;

                // Benefits to show on each tier card
                const tierBenefits: Record<string, { en: string[]; pt: string[] }> = {
                  green: {
                    en: ['Exclusive Newsletter', 'Private Sales Access'],
                    pt: ['Newsletter Exclusiva', 'Acesso a Vendas Privadas'],
                  },
                  silver: {
                    en: ['Free Standard Shipping (UAE)', 'Birthday Gift'],
                    pt: ['Frete Padrão Grátis (UAE)', 'Presente de Aniversário'],
                  },
                  gold: {
                    en: ['Free Express Shipping', 'Early Access 24h', 'Priority Support'],
                    pt: ['Frete Expresso Grátis', 'Acesso Antecipado 24h', 'Suporte Prioritário'],
                  },
                  platinum: {
                    en: ['WhatsApp VIP Concierge', 'Event Invitations', 'Surprise Gifts'],
                    pt: ['Concierge WhatsApp VIP', 'Convites para Eventos', 'Presentes Surpresa'],
                  },
                };
                const benefits = tierBenefits[tier.tier]?.[language] || [];

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierView(isSelected ? null : tier.tier)}
                    className={`rounded-2xl p-6 text-center transition-all cursor-pointer hover:scale-105 relative overflow-hidden ${
                      isCurrentTier ? 'ring-2 ring-primary' : ''
                    } ${isSelected ? 'scale-105 shadow-lg' : ''}`}
                    style={{
                      ...(backgroundImage ? {
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {
                        background: config?.gradient || '#ccc',
                      }),
                      ...(isSelected ? {
                        boxShadow: '0 0 0 3px #255238',
                      } : {}),
                    }}
                  >
                    {/* Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10">
                      {/* Header with tier name and icon */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {getTierDisplayName(tier, language)}
                          </h3>
                          <p className="text-sm opacity-80 text-white">
                            {formatPrice(tier.minSpend)}
                            {tier.maxSpend ? ` - ${formatPrice(tier.maxSpend)}` : '+'}
                          </p>
                        </div>
                        <img
                          src={getTierIcon(tier.tier)}
                          alt="tier icon"
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      {/* Subtitle if configured */}
                      {getTierSubtitle(tier.tier, language) && (
                        <p className="text-xs opacity-80 text-white mb-3 italic">
                          {getTierSubtitle(tier.tier, language)}
                        </p>
                      )}
                      <ul className="text-sm text-left space-y-2 opacity-90 text-white">
                        {benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 flex-shrink-0" /> {benefit}
                          </li>
                        ))}
                      </ul>
                      {isCurrentTier && (
                        <p className="text-xs mt-4 font-semibold uppercase tracking-wider text-white">
                          {language === 'en' ? 'YOUR LEVEL' : 'SEU NÍVEL'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Tier Benefits */}
            {selectedTierView && (() => {
              const selectedTier = allTiers.find(t => t.tier === selectedTierView);
              if (!selectedTier) return null;
              const config = tierConfig[selectedTierView];

              return (
                <div className="mt-8 pt-6 border-t">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold">
                      {getTierDisplayName(selectedTier, language)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(selectedTier.minSpend)}
                      {selectedTier.maxSpend ? ` - ${formatPrice(selectedTier.maxSpend)}` : '+'} {language === 'en' ? 'spent' : 'gastos'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Free Standard Shipping */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.freeStandardShipping !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.freeStandardShipping === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.freeStandardShipping === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Truck className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.freeStandardShipping}</p>
                        </div>
                      </div>
                    </div>

                    {/* Free Express Shipping */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.freeExpressShipping !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.freeExpressShipping === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.freeExpressShipping === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Truck className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.freeExpressShipping}</p>
                        </div>
                      </div>
                    </div>

                    {/* Early Access */}
                    <div
                      className={`p-4 rounded-lg border ${(selectedTier.earlyAccessHours || 0) <= 0 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={(selectedTier.earlyAccessHours || 0) > 0 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {(selectedTier.earlyAccessHours || 0) > 0 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Clock className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.earlyAccess}</p>
                          {(selectedTier.earlyAccessHours || 0) > 0 && (
                            <p className="text-xs text-muted-foreground">{selectedTier.earlyAccessHours} {t.hours}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Birthday Gift */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.birthdayReward !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.birthdayReward === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.birthdayReward === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Gift className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.birthdayGift}</p>
                        </div>
                      </div>
                    </div>

                    {/* Priority Support */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.prioritySupport !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.prioritySupport === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.prioritySupport === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Star className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.prioritySupport}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Concierge */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.personalConcierge !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.personalConcierge === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.personalConcierge === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Phone className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.concierge}</p>
                        </div>
                      </div>
                    </div>

                    {/* Event Invites */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.eventInvites !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.eventInvites === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.eventInvites === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Calendar className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.eventInvites}</p>
                        </div>
                      </div>
                    </div>

                    {/* Surprise Gifts */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.surpriseGifts !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.surpriseGifts === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.surpriseGifts === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Gift className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.surpriseGifts}</p>
                        </div>
                      </div>
                    </div>

                    {/* Exclusive Products */}
                    <div
                      className={`p-4 rounded-lg border ${selectedTier.exclusiveProducts !== 1 ? 'bg-gray-50 border-gray-200 opacity-50' : ''}`}
                      style={selectedTier.exclusiveProducts === 1 ? { backgroundColor: 'rgba(37, 82, 56, 0.1)', borderColor: 'rgba(37, 82, 56, 0.3)' } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {selectedTier.exclusiveProducts === 1 ? (
                          <Check className="w-5 h-5" style={{ color: '#255238' }} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <Crown className="w-5 h-5 mb-1" style={{ color: '#255238' }} />
                          <p className="font-medium text-sm">{t.exclusiveProducts}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
    </div>
  );
}
