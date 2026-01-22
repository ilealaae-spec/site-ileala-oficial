import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Crown, Users, TrendingUp, Search, Eye, Pencil, ArrowUpDown, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tier card config for gradients and icons
const tierCardConfig: Record<string, { gradient: string }> = {
  green: { gradient: 'linear-gradient(135deg, #255238 0%, #1a3d28 100%)' },
  silver: { gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' },
  gold: { gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' },
  platinum: { gradient: 'linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 50%, #3d3d3d 100%)' },
};

// Component for tier card with image upload
function TierCardWithUpload({ tier, language, onUpdate }: { tier: any; language: string; onUpdate: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = tierCardConfig[tier.tier] || tierCardConfig.green;

  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      updateTierMutation.mutate({ tier: tier.tier, iconUrl: data.url });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message || (language === 'en' ? 'Failed to upload' : 'Erro ao enviar'));
    },
  });

  const updateTierMutation = trpc.admin.loyalty.updateTier.useMutation({
    onSuccess: () => {
      setIsUploading(false);
      toast.success(language === 'en' ? 'Image updated!' : 'Imagem atualizada!');
      onUpdate();
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || (language === 'en' ? 'Failed to save' : 'Erro ao salvar'));
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Select an image file' : 'Selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Max 5MB' : 'Máx 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `tier-${tier.tier}-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setIsUploading(true);
    updateTierMutation.mutate({ tier: tier.tier, iconUrl: null });
  };

  return (
    <Card className="overflow-hidden">
      {/* Card Preview */}
      <div
        className="relative h-32 flex items-center justify-center text-white"
        style={{
          background: tier.iconUrl ? undefined : config.gradient,
        }}
      >
        {tier.iconUrl && (
          <>
            <img src={tier.iconUrl} alt={tier.tier} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
          </>
        )}
        <div className="relative z-10 text-center">
          <span className="text-lg font-bold capitalize">{tier.tier === 'platinum' ? 'Black' : tier.tier}</span>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="p-4 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
        </Button>
        {tier.iconUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Remove' : 'Remover'}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function LoyaltyTab() {
  const { language } = useLanguage();
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditTierOpen, setIsEditTierOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false);
  const [newTier, setNewTier] = useState('');
  const [tierChangeReason, setTierChangeReason] = useState('');
  const [sendUpgradeEmail, setSendUpgradeEmail] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberTier, setNewMemberTier] = useState('green');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTierImage, setIsUploadingTierImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tierImageInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.admin.loyalty.stats.useQuery();
  const { data: tiers, refetch: refetchTiers } = trpc.admin.loyalty.tiers.useQuery();
  const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = trpc.admin.loyalty.list.useQuery({
    tier: tierFilter !== 'all' ? tierFilter : undefined,
  });

  // Fetch loyalty hero settings
  const { data: heroImageSetting, refetch: refetchHeroImage } = trpc.settings.get.useQuery({ key: 'loyalty-hero-image' });
  const { data: heroTitleSetting, refetch: refetchHeroTitle } = trpc.settings.get.useQuery({ key: 'loyalty-hero-title' });
  const { data: heroSubtitleSetting, refetch: refetchHeroSubtitle } = trpc.settings.get.useQuery({ key: 'loyalty-hero-subtitle' });

  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);

  // Initialize hero text values when data loads
  useEffect(() => {
    if (heroTitleSetting?.value && !heroTitle) setHeroTitle(heroTitleSetting.value);
    if (heroSubtitleSetting?.value && !heroSubtitle) setHeroSubtitle(heroSubtitleSetting.value);
  }, [heroTitleSetting, heroSubtitleSetting]);

  const { data: memberDetail } = trpc.admin.loyalty.getMember.useQuery(
    { memberId: selectedMember?.member?.id },
    { enabled: !!selectedMember?.member?.id && isDetailOpen }
  );

  const { data: memberActivity, refetch: refetchActivity } = trpc.admin.loyalty.getMemberActivity.useQuery(
    { memberId: selectedMember?.member?.id, limit: 20 },
    { enabled: !!selectedMember?.member?.id && isDetailOpen }
  );

  // Mutations
  const updateTierMutation = trpc.admin.loyalty.updateTier.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Tier updated successfully!' : 'Nível atualizado com sucesso!');
      refetchTiers();
      setIsEditTierOpen(false);
      setSelectedTier(null);
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to update tier' : 'Erro ao atualizar nível'));
    },
  });

  const changeMemberTierMutation = trpc.admin.loyalty.changeMemberTier.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Member tier changed successfully!' : 'Nível do membro alterado com sucesso!');
      refetchMembers();
      refetchActivity();
      setIsChangeTierOpen(false);
      setNewTier('');
      setTierChangeReason('');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to change tier' : 'Erro ao alterar nível'));
    },
  });

  // Add member mutation
  const addMemberMutation = trpc.admin.loyalty.addMember.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchMembers();
        setIsAddMemberOpen(false);
        setNewMemberEmail('');
        setNewMemberTier('green');
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to add member' : 'Erro ao adicionar membro'));
    },
  });

  // Delete member mutation
  const deleteMemberMutation = trpc.admin.loyalty.deleteMember.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchMembers();
        setIsDetailOpen(false);
        setSelectedMember(null);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to delete member' : 'Erro ao excluir membro'));
    },
  });

  // Upload image mutation
  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      // After uploading, update the setting
      updateSettingMutation.mutate({ key: 'loyalty-hero-image', value: data.url });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(error.message || (language === 'en' ? 'Failed to upload image' : 'Erro ao enviar imagem'));
    },
  });

  // Update setting mutation
  const updateSettingMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      setIsUploading(false);
      toast.success(language === 'en' ? 'Hero image updated!' : 'Imagem hero atualizada!');
      refetchHeroImage();
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || (language === 'en' ? 'Failed to save image' : 'Erro ao salvar imagem'));
    },
  });

  // Upload tier image mutation
  const uploadTierImageMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      setIsUploadingTierImage(false);
      setSelectedTier((prev: any) => prev ? { ...prev, iconUrl: data.url } : null);
      toast.success(language === 'en' ? 'Tier image uploaded!' : 'Imagem do tier enviada!');
    },
    onError: (error: any) => {
      setIsUploadingTierImage(false);
      toast.error(error.message || (language === 'en' ? 'Failed to upload image' : 'Erro ao enviar imagem'));
    },
  });

  const formatPrice = (fils: number) => `${(fils / 100).toFixed(2)} AED`;

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const tierConfig: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-100', text: 'text-green-800' },
    silver: { bg: 'bg-gray-200', text: 'text-gray-800' },
    gold: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    platinum: { bg: 'bg-gray-800', text: 'text-white' },
  };

  // Display name mapping (platinum -> Black)
  const getTierDisplayName = (tier: string) => {
    if (tier === 'platinum') return 'Black';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  // Order for sorting tiers
  const tierOrder = ['green', 'silver', 'gold', 'platinum'];

  const getTierBadge = (tier: string) => {
    const config = tierConfig[tier] || tierConfig.green;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {getTierDisplayName(tier)}
      </span>
    );
  };

  const openDetail = (member: any) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const openEditTier = (tier: any) => {
    setSelectedTier({ ...tier });
    setIsEditTierOpen(true);
  };

  const handleSaveTier = () => {
    if (!selectedTier) return;
    updateTierMutation.mutate({
      tier: selectedTier.tier,
      displayName: selectedTier.displayName,
      minSpend: selectedTier.minSpend,
      maxSpend: selectedTier.maxSpend,
      color: selectedTier.color,
      iconUrl: selectedTier.iconUrl,
      freeStandardShipping: selectedTier.freeStandardShipping,
      freeExpressShipping: selectedTier.freeExpressShipping,
      earlyAccess: selectedTier.earlyAccess,
      earlyAccessHours: selectedTier.earlyAccessHours,
      birthdayReward: selectedTier.birthdayReward,
      exclusiveProducts: selectedTier.exclusiveProducts,
      prioritySupport: selectedTier.prioritySupport,
      personalConcierge: selectedTier.personalConcierge,
      eventInvites: selectedTier.eventInvites,
      surpriseGifts: selectedTier.surpriseGifts,
    });
  };

  const openChangeTier = () => {
    if (selectedMember?.member) {
      setNewTier(selectedMember.member.tier);
      setTierChangeReason('');
      setIsChangeTierOpen(true);
    }
  };

  const handleChangeMemberTier = () => {
    if (!selectedMember?.member?.id || !newTier || !tierChangeReason.trim()) {
      toast.error(language === 'en' ? 'Please provide a reason for the tier change' : 'Por favor, informe o motivo da alteração');
      return;
    }
    changeMemberTierMutation.mutate({
      memberId: selectedMember.member.id,
      newTier: newTier as 'green' | 'silver' | 'gold' | 'platinum',
      reason: tierChangeReason.trim(),
      sendEmail: sendUpgradeEmail,
    });
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `loyalty-hero-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  const handleTierImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTier) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploadingTierImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadTierImageMutation.mutate({
        fileName: `tier-${selectedTier.tier}-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      });
    };
    reader.onerror = () => {
      setIsUploadingTierImage(false);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          {language === 'en' ? 'Loyalty Program' : 'Programa de Fidelidade'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Manage members and view program statistics'
            : 'Gerencie membros e veja estatísticas do programa'}
        </p>
      </div>

      {/* Hero Image Upload */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {language === 'en' ? 'Page Hero Image' : 'Imagem Hero da Página'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'This image appears at the top of The Green World page'
                : 'Esta imagem aparece no topo da página The Green World'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Image Preview */}
          <div className="w-full md:w-1/2">
            <Label className="mb-2 block">{language === 'en' ? 'Current Image' : 'Imagem Atual'}</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
              {heroImageSetting?.value ? (
                <img
                  src={heroImageSetting.value}
                  alt="Loyalty Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">{language === 'en' ? 'No image set' : 'Nenhuma imagem definida'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full md:w-1/2">
            <Label className="mb-2 block">{language === 'en' ? 'Upload New Image' : 'Enviar Nova Imagem'}</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'en'
                  ? 'Recommended: 1920x1080px or larger'
                  : 'Recomendado: 1920x1080px ou maior'}
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Uploading...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Choose Image' : 'Escolher Imagem'}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en' ? 'Max 5MB. JPG, PNG or WebP' : 'Máx 5MB. JPG, PNG ou WebP'}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Text Section */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">
            {language === 'en' ? 'Hero Text' : 'Texto do Hero'}
          </h4>
          <div className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Title' : 'Título'}</Label>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder={language === 'en' ? 'Inside The Green World' : 'Inside The Green World'}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{language === 'en' ? 'Subtitle' : 'Subtítulo'}</Label>
              <Textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder={language === 'en'
                  ? 'A private universe where ritual, beauty, and time shape the art of living.'
                  : 'Um universo privado onde ritual, beleza e tempo moldam a arte de viver.'}
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              onClick={async () => {
                setIsSavingText(true);
                try {
                  await updateSettingMutation.mutateAsync({ key: 'loyalty-hero-title', value: heroTitle });
                  await updateSettingMutation.mutateAsync({ key: 'loyalty-hero-subtitle', value: heroSubtitle });
                  refetchHeroTitle();
                  refetchHeroSubtitle();
                  toast.success(language === 'en' ? 'Hero text saved!' : 'Texto do hero salvo!');
                } catch (error: any) {
                  toast.error(error.message || (language === 'en' ? 'Failed to save' : 'Erro ao salvar'));
                } finally {
                  setIsSavingText(false);
                }
              }}
              disabled={isSavingText}
            >
              {isSavingText ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Saving...' : 'Salvando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Save Text' : 'Salvar Texto'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Members' : 'Total Membros'}
              </p>
            </div>
            <p className="text-2xl font-bold">{stats.total_members || 0}</p>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50">
            <p className="text-sm text-green-700 mb-1">Green</p>
            <p className="text-2xl font-bold text-green-700">{stats.green_count || 0}</p>
          </Card>

          <Card className="p-4 border-gray-300 bg-gray-100">
            <p className="text-sm text-gray-700 mb-1">Silver</p>
            <p className="text-2xl font-bold text-gray-700">{stats.silver_count || 0}</p>
          </Card>

          <Card className="p-4 border-yellow-300 bg-yellow-50">
            <p className="text-sm text-yellow-700 mb-1">Gold</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.gold_count || 0}</p>
          </Card>

          <Card className="p-4 border-gray-700 bg-gray-800">
            <p className="text-sm text-gray-300 mb-1">Black</p>
            <p className="text-2xl font-bold text-white">{stats.platinum_count || 0}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Spent' : 'Total Gasto'}
              </p>
            </div>
            <p className="text-lg font-bold">{formatPrice(Number(stats.total_spent_all_time) || 0)}</p>
          </Card>
        </div>
      )}

      {/* Tier Cards with Image Upload */}
      {tiers && tiers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {language === 'en' ? 'Tier Cards' : 'Cartões dos Níveis'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en'
              ? 'Upload images for each tier card. These will appear on the loyalty page.'
              : 'Envie imagens para cada cartão de nível. Elas aparecerão na página de fidelidade.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...tiers].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)).map((tier) => (
              <TierCardWithUpload
                key={tier.id}
                tier={tier}
                language={language}
                onUpdate={() => refetchTiers()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tier Benefits Table */}
      {tiers && tiers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'en' ? 'Tier Configuration' : 'Configuração dos Níveis'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">{language === 'en' ? 'Tier' : 'Nível'}</th>
                  <th className="text-left py-2 px-3">{language === 'en' ? 'Spend Range' : 'Faixa de Gasto'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Free Shipping' : 'Frete Grátis'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Express' : 'Expresso'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Early Access' : 'Acesso Antec.'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Birthday' : 'Aniversário'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Concierge' : 'Concierge'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Actions' : 'Ações'}</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">{getTierBadge(tier.tier)}</td>
                    <td className="py-2 px-3">
                      {formatPrice(tier.minSpend)}
                      {tier.maxSpend ? ` - ${formatPrice(tier.maxSpend)}` : '+'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {tier.freeStandardShipping ? '✅' : '❌'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {tier.freeExpressShipping ? '✅' : '❌'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {tier.earlyAccessHours > 0 ? `${tier.earlyAccessHours}h` : '❌'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {tier.birthdayReward ? '✅' : '❌'}
                    </td>
                    <td className="text-center py-2 px-3">
                      {tier.personalConcierge ? '✅' : '❌'}
                    </td>
                    <td className="text-center py-2 px-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTier(tier)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Members List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {language === 'en' ? 'Members' : 'Membros'}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Add Member' : 'Adicionar Membro'}
            </Button>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Tiers' : 'Todos'}</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {membersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : membersData?.members && membersData.members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">{language === 'en' ? 'Member' : 'Membro'}</th>
                  <th className="text-left py-2 px-3">{language === 'en' ? 'Tier' : 'Nível'}</th>
                  <th className="text-right py-2 px-3">{language === 'en' ? 'This Year' : 'Este Ano'}</th>
                  <th className="text-right py-2 px-3">{language === 'en' ? 'All Time' : 'Total'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Orders' : 'Pedidos'}</th>
                  <th className="text-left py-2 px-3">{language === 'en' ? 'Joined' : 'Entrou'}</th>
                  <th className="text-center py-2 px-3">{language === 'en' ? 'Actions' : 'Ações'}</th>
                </tr>
              </thead>
              <tbody>
                {membersData.members.map((item: any) => (
                  <tr key={item.member.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-3">
                      <div>
                        <p className="font-medium">{item.user.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{item.user.email}</p>
                      </div>
                    </td>
                    <td className="py-2 px-3">{getTierBadge(item.member.tier)}</td>
                    <td className="text-right py-2 px-3 font-medium">
                      {formatPrice(item.member.totalSpentCurrentYear)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {formatPrice(item.member.totalSpentAllTime)}
                    </td>
                    <td className="text-center py-2 px-3">{item.member.totalOrders}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {formatDate(item.member.joinedAt)}
                    </td>
                    <td className="text-center py-2 px-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'en' ? 'No members found' : 'Nenhum membro encontrado'}</p>
          </div>
        )}

        {membersData && (
          <p className="text-sm text-muted-foreground mt-4">
            {language === 'en'
              ? `Showing ${membersData.members.length} of ${membersData.total} members`
              : `Mostrando ${membersData.members.length} de ${membersData.total} membros`}
          </p>
        )}
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              {language === 'en' ? 'Member Details' : 'Detalhes do Membro'}
            </DialogTitle>
          </DialogHeader>

          {memberDetail && (
            <div className="space-y-6">
              {/* Member Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{memberDetail.name || 'N/A'}</h3>
                    <p className="text-muted-foreground">{memberDetail.email}</p>
                    <div className="mt-1">{getTierBadge(memberDetail.tier)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={openChangeTier}>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Change Tier' : 'Alterar Nível'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(language === 'en' ? 'Are you sure you want to delete this member? This action cannot be undone.' : 'Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita.')) {
                        deleteMemberMutation.mutate({ memberId: selectedMember?.member?.id });
                      }
                    }}
                    disabled={deleteMemberMutation.isPending}
                  >
                    {deleteMemberMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    {language === 'en' ? 'Delete' : 'Excluir'}
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'This Year' : 'Este Ano'}
                  </p>
                  <p className="text-xl font-bold">{formatPrice(memberDetail.totalSpentCurrentYear)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'All Time' : 'Total'}
                  </p>
                  <p className="text-xl font-bold">{formatPrice(memberDetail.totalSpentAllTime)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Orders' : 'Pedidos'}
                  </p>
                  <p className="text-xl font-bold">{memberDetail.totalOrders}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Member Since' : 'Membro Desde'}
                  </p>
                  <p className="text-lg font-semibold">{formatDate(memberDetail.joinedAt)}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {memberDetail.birthday && (
                  <div>
                    <p className="text-muted-foreground">{language === 'en' ? 'Birthday' : 'Aniversário'}</p>
                    <p className="font-medium">{formatDate(memberDetail.birthday)}</p>
                  </div>
                )}
                {memberDetail.whatsappNumber && (
                  <div>
                    <p className="text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{memberDetail.whatsappNumber}</p>
                  </div>
                )}
                {memberDetail.tierUpgradedAt && (
                  <div>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'Last Tier Upgrade' : 'Última Promoção'}
                    </p>
                    <p className="font-medium">{formatDate(memberDetail.tierUpgradedAt)}</p>
                  </div>
                )}
              </div>

              {/* Activity Log */}
              {memberActivity && memberActivity.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">
                    {language === 'en' ? 'Recent Activity' : 'Atividade Recente'}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {memberActivity.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
                      >
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                        {activity.amountSpent && (
                          <span className="font-semibold text-green-600">
                            +{formatPrice(activity.amountSpent)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Tier Dialog */}
      <Dialog open={isEditTierOpen} onOpenChange={(open) => {
        setIsEditTierOpen(open);
        if (!open) setSelectedTier(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              {language === 'en' ? 'Edit Tier Configuration' : 'Editar Configuração do Nível'}
            </DialogTitle>
          </DialogHeader>

          {selectedTier && (
            <div className="space-y-6">
              {/* Tier Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                {getTierBadge(selectedTier.tier)}
                <div>
                  <p className="font-medium">{selectedTier.displayName || selectedTier.tier}</p>
                </div>
              </div>

              {/* Spend Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Minimum Spend (AED)' : 'Gasto Mínimo (AED)'}</Label>
                  <Input
                    type="number"
                    value={(selectedTier.minSpend / 100).toFixed(0)}
                    onChange={(e) => setSelectedTier({
                      ...selectedTier,
                      minSpend: parseInt(e.target.value || '0') * 100
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Maximum Spend (AED)' : 'Gasto Máximo (AED)'}</Label>
                  <Input
                    type="number"
                    value={selectedTier.maxSpend ? (selectedTier.maxSpend / 100).toFixed(0) : ''}
                    placeholder={language === 'en' ? 'No limit' : 'Sem limite'}
                    onChange={(e) => setSelectedTier({
                      ...selectedTier,
                      maxSpend: e.target.value ? parseInt(e.target.value) * 100 : null
                    })}
                  />
                </div>
              </div>

              {/* Tier Card Image */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {language === 'en' ? 'Tier Card Image' : 'Imagem do Cartão'}
                </Label>
                <div className="flex gap-4 items-start">
                  {/* Current Image Preview */}
                  <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
                    {selectedTier.iconUrl ? (
                      <img
                        src={selectedTier.iconUrl}
                        alt={`${selectedTier.tier} card`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-2xl"
                        style={{ background: selectedTier.cardGradient || selectedTier.cardColor }}
                      >
                        {tierConfig[selectedTier.tier]?.icon}
                      </div>
                    )}
                  </div>
                  {/* Upload */}
                  <div className="flex-1">
                    <input
                      ref={tierImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTierImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => tierImageInputRef.current?.click()}
                      disabled={isUploadingTierImage}
                    >
                      {isUploadingTierImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'en' ? 'Uploading...' : 'Enviando...'}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Upload Image' : 'Enviar Imagem'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'en'
                        ? 'Recommended: 400x240px. If no image, uses gradient color.'
                        : 'Recomendado: 400x240px. Sem imagem, usa cor gradiente.'}
                    </p>
                    {selectedTier.iconUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-600 hover:text-red-700"
                        onClick={() => setSelectedTier({ ...selectedTier, iconUrl: null })}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Remove Image' : 'Remover Imagem'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Benefits Toggles */}
              <div className="space-y-4">
                <h4 className="font-semibold">{language === 'en' ? 'Benefits' : 'Benefícios'}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Free Standard Shipping' : 'Frete Padrão Grátis'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'UAE only' : 'Apenas UAE'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.freeStandardShipping === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        freeStandardShipping: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Free Express Shipping' : 'Frete Expresso Grátis'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Worldwide' : 'Mundial'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.freeExpressShipping === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        freeExpressShipping: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Birthday Reward' : 'Presente de Aniversário'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Special gift' : 'Presente especial'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.birthdayReward === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        birthdayReward: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Priority Support' : 'Suporte Prioritário'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Faster response' : 'Resposta rápida'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.prioritySupport === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        prioritySupport: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Personal Concierge' : 'Concierge Pessoal'}</p>
                      <p className="text-sm text-muted-foreground">WhatsApp VIP</p>
                    </div>
                    <Switch
                      checked={selectedTier.personalConcierge === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        personalConcierge: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Event Invites' : 'Convites para Eventos'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Exclusive events' : 'Eventos exclusivos'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.eventInvites === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        eventInvites: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Surprise Gifts' : 'Presentes Surpresa'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Quarterly' : 'Trimestral'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.surpriseGifts === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        surpriseGifts: checked ? 1 : 0
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{language === 'en' ? 'Exclusive Products' : 'Produtos Exclusivos'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'en' ? 'Early access' : 'Acesso antecipado'}</p>
                    </div>
                    <Switch
                      checked={selectedTier.exclusiveProducts === 1}
                      onCheckedChange={(checked) => setSelectedTier({
                        ...selectedTier,
                        exclusiveProducts: checked ? 1 : 0
                      })}
                    />
                  </div>
                </div>

                {/* Early Access Hours */}
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Early Access Hours (0 = disabled)' : 'Horas de Acesso Antecipado (0 = desativado)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    value={selectedTier.earlyAccessHours || 0}
                    onChange={(e) => setSelectedTier({
                      ...selectedTier,
                      earlyAccessHours: parseInt(e.target.value || '0'),
                      earlyAccess: parseInt(e.target.value || '0') > 0 ? 1 : 0
                    })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsEditTierOpen(false);
                  setSelectedTier(null);
                }}>
                  <X className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button onClick={handleSaveTier} disabled={updateTierMutation.isPending}>
                  {updateTierMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {language === 'en' ? 'Save Changes' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Member Tier Dialog */}
      <Dialog open={isChangeTierOpen} onOpenChange={(open) => {
        setIsChangeTierOpen(open);
        if (!open) {
          setNewTier('');
          setTierChangeReason('');
          setSendUpgradeEmail(true);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              {language === 'en' ? 'Change Member Tier' : 'Alterar Nível do Membro'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{selectedMember?.user?.name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{selectedMember?.user?.email}</p>
              <div className="mt-2">
                {language === 'en' ? 'Current tier: ' : 'Nível atual: '}
                {getTierBadge(selectedMember?.member?.tier || 'green')}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'New Tier' : 'Novo Nível'}</Label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Reason for change (required)' : 'Motivo da alteração (obrigatório)'}</Label>
              <Textarea
                placeholder={language === 'en' ? 'E.g., VIP promotion, special customer, adjustment...' : 'Ex: Promoção VIP, cliente especial, ajuste...'}
                value={tierChangeReason}
                onChange={(e) => setTierChangeReason(e.target.value)}
                rows={3}
              />
            </div>

            {/* Send Email Option */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-sm">
                  {language === 'en' ? 'Send congratulations email' : 'Enviar email de parabéns'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'en'
                    ? 'Customer will receive an email about their new tier benefits'
                    : 'Cliente receberá um email sobre os benefícios do novo nível'}
                </p>
              </div>
              <Switch
                checked={sendUpgradeEmail}
                onCheckedChange={setSendUpgradeEmail}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsChangeTierOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                onClick={handleChangeMemberTier}
                disabled={changeMemberTierMutation.isPending || !newTier || !tierChangeReason.trim()}
              >
                {changeMemberTierMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Change Tier' : 'Alterar Nível'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={(open) => {
        setIsAddMemberOpen(open);
        if (!open) {
          setNewMemberEmail('');
          setNewMemberTier('green');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'en' ? 'Add Member' : 'Adicionar Membro'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Add an existing user to the loyalty program. The user must have an account.'
                : 'Adicione um usuário existente ao programa de fidelidade. O usuário deve ter uma conta.'}
            </p>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'User Email' : 'Email do Usuário'}</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Initial Tier' : 'Nível Inicial'}</Label>
              <Select value={newMemberTier} onValueChange={setNewMemberTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button
                onClick={() => addMemberMutation.mutate({ email: newMemberEmail, tier: newMemberTier as any })}
                disabled={addMemberMutation.isPending || !newMemberEmail.trim()}
              >
                {addMemberMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Users className="w-4 h-4 mr-2" />
                )}
                {language === 'en' ? 'Add Member' : 'Adicionar Membro'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
