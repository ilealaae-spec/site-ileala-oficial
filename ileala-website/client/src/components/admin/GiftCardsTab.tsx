import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Gift, Copy, Mail, RefreshCw, XCircle, Calendar, User, CreditCard, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Clock, Save, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GiftCardStatus = 'all' | 'pending' | 'active' | 'used' | 'expired' | 'cancelled';

export default function GiftCardsTab() {
  const { language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<GiftCardStatus>('all');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingText, setIsSavingText] = useState(false);
  const [minValue, setMinValue] = useState('50');
  const [maxValue, setMaxValue] = useState('2000');
  // Text customization states
  const [cardTitle, setCardTitle] = useState('GIFT CARD');
  const [cardSubtitle, setCardSubtitle] = useState('ILE ALA');
  const [cardValueLabel, setCardValueLabel] = useState('VALUE');
  const [cardValidText, setCardValidText] = useState('Valid for 1 year');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: giftCards, isLoading } = trpc.admin.giftCards.list.useQuery({ status: statusFilter });
  const { data: stats } = trpc.admin.giftCards.stats.useQuery();

  // Fetch gift card settings
  const { data: giftCardImageSetting, refetch: refetchGiftCardImage } = trpc.settings.get.useQuery({ key: 'gift-card-image' });
  const { data: giftCardHeroImageSetting, refetch: refetchGiftCardHeroImage } = trpc.settings.get.useQuery({ key: 'gift-card-hero-image' });
  const { data: minValueSetting, refetch: refetchMinValue } = trpc.settings.get.useQuery({ key: 'gift-card-min-value' });
  const { data: maxValueSetting, refetch: refetchMaxValue } = trpc.settings.get.useQuery({ key: 'gift-card-max-value' });
  // Text customization settings
  const { data: cardTitleSetting, refetch: refetchCardTitle } = trpc.settings.get.useQuery({ key: 'gift-card-title' });
  const { data: cardSubtitleSetting, refetch: refetchCardSubtitle } = trpc.settings.get.useQuery({ key: 'gift-card-subtitle' });
  const { data: cardValueLabelSetting, refetch: refetchCardValueLabel } = trpc.settings.get.useQuery({ key: 'gift-card-value-label' });
  const { data: cardValidTextSetting, refetch: refetchCardValidText } = trpc.settings.get.useQuery({ key: 'gift-card-valid-text' });
  // Icon/logo setting
  const { data: cardIconSetting, refetch: refetchCardIcon } = trpc.settings.get.useQuery({ key: 'gift-card-icon' });

  // Initialize values from settings
  useEffect(() => {
    if (minValueSetting?.value) setMinValue(minValueSetting.value);
    if (maxValueSetting?.value) setMaxValue(maxValueSetting.value);
    if (cardTitleSetting?.value) setCardTitle(cardTitleSetting.value);
    if (cardSubtitleSetting?.value) setCardSubtitle(cardSubtitleSetting.value);
    if (cardValueLabelSetting?.value) setCardValueLabel(cardValueLabelSetting.value);
    if (cardValidTextSetting?.value) setCardValidText(cardValidTextSetting.value);
  }, [minValueSetting, maxValueSetting, cardTitleSetting, cardSubtitleSetting, cardValueLabelSetting, cardValidTextSetting]);

  const cancelMutation = trpc.admin.giftCards.cancel.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Gift card cancelled!' : 'Vale presente cancelado!');
      utils.admin.giftCards.list.invalidate();
      utils.admin.giftCards.stats.invalidate();
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resendMutation = trpc.admin.giftCards.resendEmail.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Email resent!' : 'Email reenviado!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.admin.giftCards.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Gift card deleted!' : 'Vale presente excluído!');
      utils.admin.giftCards.list.invalidate();
      utils.admin.giftCards.stats.invalidate();
      setIsDetailOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAllPendingMutation = trpc.admin.giftCards.deleteAllPending.useMutation({
    onSuccess: (data) => {
      toast.success(language === 'en' ? `${data.deleted} pending gift cards deleted!` : `${data.deleted} vales pendentes excluídos!`);
      utils.admin.giftCards.list.invalidate();
      utils.admin.giftCards.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Upload image mutation
  const uploadMutation = (trpc.admin as any).uploadImage.useMutation({
    onSuccess: (data: { url: string }) => {
      // After uploading, update the setting
      updateSettingMutation.mutate({ key: 'gift-card-image', value: data.url });
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
      toast.success(language === 'en' ? 'Gift card image updated!' : 'Imagem do vale presente atualizada!');
      refetchGiftCardImage();
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || (language === 'en' ? 'Failed to save image' : 'Erro ao salvar imagem'));
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `gift-card-${Date.now()}-${file.name}`,
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

  // Handle hero image upload
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Image must be less than 5MB' : 'Imagem deve ter menos de 5MB');
      return;
    }

    setIsUploadingHero(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `gift-card-hero-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      }, {
        onSuccess: (data: { url: string }) => {
          updateSettingMutation.mutate({ key: 'gift-card-hero-image', value: data.url }, {
            onSuccess: () => {
              setIsUploadingHero(false);
              toast.success(language === 'en' ? 'Hero image updated!' : 'Imagem principal atualizada!');
              refetchGiftCardHeroImage();
            },
            onError: () => {
              setIsUploadingHero(false);
              toast.error(language === 'en' ? 'Failed to save hero image' : 'Erro ao salvar imagem principal');
            }
          });
        },
        onError: () => {
          setIsUploadingHero(false);
          toast.error(language === 'en' ? 'Failed to upload hero image' : 'Erro ao enviar imagem principal');
        }
      });
    };
    reader.onerror = () => {
      setIsUploadingHero(false);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  // Handle icon upload
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'en' ? 'Please select an image file' : 'Selecione um arquivo de imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(language === 'en' ? 'Icon must be less than 2MB' : 'Ícone deve ter menos de 2MB');
      return;
    }

    setIsUploadingIcon(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        fileName: `gift-card-icon-${Date.now()}-${file.name}`,
        fileData: base64,
        contentType: file.type,
      }, {
        onSuccess: (data: { url: string }) => {
          updateSettingMutation.mutate({ key: 'gift-card-icon', value: data.url }, {
            onSuccess: () => {
              setIsUploadingIcon(false);
              toast.success(language === 'en' ? 'Icon updated!' : 'Ícone atualizado!');
              refetchCardIcon();
            },
            onError: () => {
              setIsUploadingIcon(false);
              toast.error(language === 'en' ? 'Failed to save icon' : 'Erro ao salvar ícone');
            }
          });
        },
        onError: () => {
          setIsUploadingIcon(false);
          toast.error(language === 'en' ? 'Failed to upload icon' : 'Erro ao enviar ícone');
        }
      });
    };
    reader.onerror = () => {
      setIsUploadingIcon(false);
      toast.error(language === 'en' ? 'Failed to read file' : 'Erro ao ler arquivo');
    };
    reader.readAsDataURL(file);
  };

  // Save min/max value settings
  const handleSaveValueSettings = async () => {
    const min = parseInt(minValue);
    const max = parseInt(maxValue);

    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      toast.error(language === 'en' ? 'Please enter valid values' : 'Digite valores válidos');
      return;
    }

    if (min >= max) {
      toast.error(language === 'en' ? 'Minimum must be less than maximum' : 'Mínimo deve ser menor que máximo');
      return;
    }

    setIsSavingSettings(true);
    try {
      await updateSettingMutation.mutateAsync({ key: 'gift-card-min-value', value: minValue });
      await updateSettingMutation.mutateAsync({ key: 'gift-card-max-value', value: maxValue });
      refetchMinValue();
      refetchMaxValue();
      toast.success(language === 'en' ? 'Value limits saved!' : 'Limites de valor salvos!');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Failed to save' : 'Erro ao salvar'));
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save text customization settings
  const handleSaveTextSettings = async () => {
    setIsSavingText(true);
    try {
      await updateSettingMutation.mutateAsync({ key: 'gift-card-title', value: cardTitle });
      await updateSettingMutation.mutateAsync({ key: 'gift-card-subtitle', value: cardSubtitle });
      await updateSettingMutation.mutateAsync({ key: 'gift-card-value-label', value: cardValueLabel });
      await updateSettingMutation.mutateAsync({ key: 'gift-card-valid-text', value: cardValidText });
      refetchCardTitle();
      refetchCardSubtitle();
      refetchCardValueLabel();
      refetchCardValidText();
      toast.success(language === 'en' ? 'Card text saved!' : 'Texto do cartão salvo!');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Failed to save' : 'Erro ao salvar'));
    } finally {
      setIsSavingText(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(language === 'en' ? 'Code copied!' : 'Código copiado!');
  };

  const formatPrice = (fils: number) => {
    return `${(fils / 100).toFixed(2)} AED`;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: { en: string; pt: string } }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: { en: 'Pending', pt: 'Pendente' } },
      active: { bg: 'bg-green-100', text: 'text-green-700', label: { en: 'Active', pt: 'Ativo' } },
      used: { bg: 'bg-blue-100', text: 'text-blue-700', label: { en: 'Fully Used', pt: 'Usado' } },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: { en: 'Expired', pt: 'Expirado' } },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: { en: 'Cancelled', pt: 'Cancelado' } },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text}`}>
        {language === 'en' ? config.label.en : config.label.pt}
      </span>
    );
  };

  // Email delivery status indicator
  const getEmailStatusBadge = (card: any) => {
    if (card.deliveredAt) {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700" title={`${language === 'en' ? 'Delivered' : 'Entregue'}: ${formatDate(card.deliveredAt)}`}>
          <CheckCircle className="w-3 h-3" />
          {language === 'en' ? 'Email Sent' : 'Email Enviado'}
        </span>
      );
    }
    if (card.deliveryType === 'scheduled' && card.scheduledDate) {
      const scheduledDate = new Date(card.scheduledDate);
      const now = new Date();
      if (scheduledDate > now) {
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-orange-100 text-orange-700" title={formatDate(card.scheduledDate)}>
            <Clock className="w-3 h-3" />
            {language === 'en' ? 'Scheduled' : 'Agendado'}
          </span>
        );
      }
    }
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" />
        {language === 'en' ? 'Not Sent' : 'Não Enviado'}
      </span>
    );
  };

  const handleCancel = (id: number, code: string) => {
    if (window.confirm(
      language === 'en'
        ? `Cancel gift card "${code}"? This action cannot be undone.`
        : `Cancelar vale presente "${code}"? Esta ação não pode ser desfeita.`
    )) {
      cancelMutation.mutate({ id });
    }
  };

  const handleResendEmail = (id: number) => {
    resendMutation.mutate({ id });
  };

  const handleDelete = (id: number, code: string) => {
    if (window.confirm(
      language === 'en'
        ? `Delete gift card "${code}"? This action cannot be undone.`
        : `Excluir vale presente "${code}"? Esta ação não pode ser desfeita.`
    )) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDeleteAllPending = () => {
    const pendingCount = giftCards?.filter(gc => gc.status === 'pending').length || 0;
    if (pendingCount === 0) {
      toast.info(language === 'en' ? 'No pending gift cards to delete' : 'Nenhum vale pendente para excluir');
      return;
    }
    if (window.confirm(
      language === 'en'
        ? `Delete all ${pendingCount} pending gift cards? This action cannot be undone.`
        : `Excluir todos os ${pendingCount} vales pendentes? Esta ação não pode ser desfeita.`
    )) {
      deleteAllPendingMutation.mutate();
    }
  };

  const openDetail = (card: any) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'en' ? 'Gift Cards' : 'Vales Presente'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Manage gift cards purchased by customers'
              : 'Gerencie vales presente comprados pelos clientes'}
          </p>
        </div>
        {stats && stats.pending > 0 && (
          <Button
            variant="outline"
            onClick={handleDeleteAllPending}
            disabled={deleteAllPendingMutation.isPending}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            {deleteAllPendingMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {language === 'en' ? `Delete ${stats.pending} Pending` : `Excluir ${stats.pending} Pendentes`}
          </Button>
        )}
      </div>

      {/* Hero Image Upload */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {language === 'en' ? 'Page Hero Image' : 'Imagem Principal da Página'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'This image appears at the top of the Gift Card page (hero section)'
                : 'Esta imagem aparece no topo da página de Vale Presente (seção hero)'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Hero Image Preview */}
          <div className="w-full md:w-1/2">
            <Label className="mb-2 block">{language === 'en' ? 'Current Hero Image' : 'Imagem Hero Atual'}</Label>
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted border">
              {giftCardHeroImageSetting?.value ? (
                <img
                  src={giftCardHeroImageSetting.value}
                  alt="Gift Card Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-primary text-primary-foreground">
                  <Gift className="w-12 h-12 mb-2 opacity-60" />
                  <span className="text-sm opacity-80">{language === 'en' ? 'Default color background' : 'Fundo de cor padrão'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="w-full md:w-1/2">
            <Label className="mb-2 block">{language === 'en' ? 'Upload New Hero Image' : 'Enviar Nova Imagem Hero'}</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'en'
                  ? 'Recommended: 1920x600px'
                  : 'Recomendado: 1920x600px'}
              </p>
              <Button
                onClick={() => heroInputRef.current?.click()}
                disabled={isUploadingHero}
                variant="outline"
              >
                {isUploadingHero ? (
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
      </Card>

      {/* Gift Card Design Image */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {language === 'en' ? 'Gift Card Design' : 'Design do Vale Presente'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'This image appears on the gift card page and email'
                : 'Esta imagem aparece na página do vale presente e no email'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Current Image Preview */}
          <div className="w-full md:w-1/2">
            <Label className="mb-2 block">{language === 'en' ? 'Current Image' : 'Imagem Atual'}</Label>
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted border">
              {giftCardImageSetting?.value ? (
                <img
                  src={giftCardImageSetting.value}
                  alt="Gift Card"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#172d20] to-[#255238] text-white">
                  <Gift className="w-12 h-12 mb-2 opacity-60" />
                  <span className="text-sm opacity-80">{language === 'en' ? 'Default gradient' : 'Gradiente padrão'}</span>
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
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'en'
                  ? 'Recommended: 800x500px'
                  : 'Recomendado: 800x500px'}
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
      </Card>

      {/* Icon/Logo Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {language === 'en' ? 'Card Icon/Logo' : 'Ícone/Logo do Cartão'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Upload a custom icon or logo to appear on the gift card (replaces default gift icon)'
                : 'Envie um ícone ou logo personalizado para aparecer no vale presente (substitui o ícone padrão)'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Current Icon Preview */}
          <div className="w-32">
            <Label className="mb-2 block">{language === 'en' ? 'Current Icon' : 'Ícone Atual'}</Label>
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
              {cardIconSetting?.value ? (
                <img
                  src={cardIconSetting.value}
                  alt="Card Icon"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Gift className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex-1">
            <Label className="mb-2 block">{language === 'en' ? 'Upload New Icon' : 'Enviar Novo Ícone'}</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'en'
                  ? 'Recommended: 100x100px, PNG with transparency'
                  : 'Recomendado: 100x100px, PNG com transparência'}
              </p>
              <Button
                onClick={() => iconInputRef.current?.click()}
                disabled={isUploadingIcon}
                variant="outline"
                size="sm"
              >
                {isUploadingIcon ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Uploading...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Choose Icon' : 'Escolher Ícone'}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en' ? 'Max 2MB. PNG, JPG or SVG' : 'Máx 2MB. PNG, JPG ou SVG'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Customization Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {language === 'en' ? 'Card Text Customization' : 'Personalização do Texto'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Customize the text that appears on the gift card'
                : 'Personalize o texto que aparece no vale presente'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-2 block">{language === 'en' ? 'Title (small text)' : 'Título (texto pequeno)'}</Label>
            <Input
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="GIFT CARD"
            />
          </div>
          <div>
            <Label className="mb-2 block">{language === 'en' ? 'Subtitle (brand name)' : 'Subtítulo (nome da marca)'}</Label>
            <Input
              value={cardSubtitle}
              onChange={(e) => setCardSubtitle(e.target.value)}
              placeholder="ILE ALA"
            />
          </div>
          <div>
            <Label className="mb-2 block">{language === 'en' ? 'Value Label' : 'Rótulo do Valor'}</Label>
            <Input
              value={cardValueLabel}
              onChange={(e) => setCardValueLabel(e.target.value)}
              placeholder="VALUE"
            />
          </div>
          <div>
            <Label className="mb-2 block">{language === 'en' ? 'Validity Text' : 'Texto de Validade'}</Label>
            <Input
              value={cardValidText}
              onChange={(e) => setCardValidText(e.target.value)}
              placeholder="Valid for 1 year"
            />
          </div>
        </div>

        <Button onClick={handleSaveTextSettings} disabled={isSavingText}>
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
      </Card>

      {/* Value Settings Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {language === 'en' ? 'Value Limits' : 'Limites de Valor'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en'
                ? 'Set minimum and maximum gift card values customers can purchase'
                : 'Defina os valores mínimo e máximo que clientes podem comprar'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <Label className="mb-2 block">{language === 'en' ? 'Minimum (AED)' : 'Mínimo (AED)'}</Label>
            <Input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              min="1"
              className="font-mono"
            />
          </div>
          <div className="w-40">
            <Label className="mb-2 block">{language === 'en' ? 'Maximum (AED)' : 'Máximo (AED)'}</Label>
            <Input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              min="1"
              className="font-mono"
            />
          </div>
          <Button
            onClick={handleSaveValueSettings}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'en' ? 'Saving...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Save Limits' : 'Salvar Limites'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total' : 'Total'}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4 border-green-200 bg-green-50">
            <p className="text-sm text-green-700">{language === 'en' ? 'Active' : 'Ativos'}</p>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </Card>
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <p className="text-sm text-yellow-700">{language === 'en' ? 'Pending' : 'Pendentes'}</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </Card>
          <Card className="p-4 border-blue-200 bg-blue-50">
            <p className="text-sm text-blue-700">{language === 'en' ? 'Used' : 'Usados'}</p>
            <p className="text-2xl font-bold text-blue-700">{stats.used}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Value' : 'Valor Total'}</p>
            <p className="text-lg font-bold">{formatPrice(stats.totalValue)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Redeemed' : 'Resgatado'}</p>
            <p className="text-lg font-bold">{formatPrice(stats.totalRedeemed)}</p>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GiftCardStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Status' : 'Todos os Status'}</SelectItem>
            <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Pendente'}</SelectItem>
            <SelectItem value="active">{language === 'en' ? 'Active' : 'Ativo'}</SelectItem>
            <SelectItem value="used">{language === 'en' ? 'Fully Used' : 'Usado'}</SelectItem>
            <SelectItem value="expired">{language === 'en' ? 'Expired' : 'Expirado'}</SelectItem>
            <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'Cancelado'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gift Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {giftCards && giftCards.length > 0 ? (
          giftCards.map((card) => (
            <Card
              key={card.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(card)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sage-100 rounded-lg">
                  <Gift className="w-6 h-6 text-sage-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg font-mono">{card.code}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(card.code);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-lg font-semibold text-sage-700">
                      {formatPrice(card.amount)}
                    </p>

                    {card.balanceRemaining !== card.amount && (
                      <p className="text-muted-foreground">
                        {language === 'en' ? 'Balance:' : 'Saldo:'} {formatPrice(card.balanceRemaining)}
                      </p>
                    )}

                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {card.recipientEmail}
                    </p>

                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {language === 'en' ? 'Expires:' : 'Expira:'} {formatDate(card.validUntil)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {getStatusBadge(card.status)}
                      {getEmailStatusBadge(card)}
                      {card.deliveryType === 'scheduled' && !card.deliveredAt && card.scheduledDate && new Date(card.scheduledDate) > new Date() && (
                        <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                          {language === 'en' ? 'Scheduled' : 'Agendado'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    {card.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(card.id)}
                          disabled={resendMutation.isPending}
                        >
                          {resendMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1" />
                              {language === 'en' ? 'Resend' : 'Reenviar'}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(card.id, card.code)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(card.status === 'pending' || card.status === 'cancelled') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(card.id, card.code)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            {language === 'en' ? 'Delete' : 'Excluir'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12">
            <div className="text-center text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'en' ? 'No gift cards found' : 'Nenhum vale presente encontrado'}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {language === 'en' ? 'Gift Card Details' : 'Detalhes do Vale Presente'}
            </DialogTitle>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-6">
              {/* Code and Status */}
              <div className="text-center p-6 bg-gradient-to-br from-sage-100 to-sage-50 rounded-xl">
                <p className="text-sm text-sage-700 mb-2">
                  {language === 'en' ? 'Gift Card Code' : 'Código do Vale'}
                </p>
                <p className="text-3xl font-bold font-mono text-sage-800">{selectedCard.code}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {getStatusBadge(selectedCard.status)}
                  {getEmailStatusBadge(selectedCard)}
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Original Value' : 'Valor Original'}
                  </p>
                  <p className="text-xl font-bold">{formatPrice(selectedCard.amount)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Current Balance' : 'Saldo Atual'}
                  </p>
                  <p className="text-xl font-bold">{formatPrice(selectedCard.balanceRemaining)}</p>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === 'en' ? 'Recipient' : 'Destinatário'}
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Email:</strong> {selectedCard.recipientEmail}</p>
                  {selectedCard.recipientName && (
                    <p><strong>{language === 'en' ? 'Name:' : 'Nome:'}</strong> {selectedCard.recipientName}</p>
                  )}
                  {selectedCard.senderName && (
                    <p><strong>{language === 'en' ? 'From:' : 'De:'}</strong> {selectedCard.senderName}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedCard.message && (
                <div className="p-4 bg-muted/50 rounded-lg italic">
                  "{selectedCard.message}"
                </div>
              )}

              {/* Dates */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {language === 'en' ? 'Dates' : 'Datas'}
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>{language === 'en' ? 'Purchased:' : 'Comprado:'}</strong> {formatDate(selectedCard.purchasedAt)}</p>
                  <p><strong>{language === 'en' ? 'Delivered:' : 'Entregue:'}</strong> {formatDate(selectedCard.deliveredAt) || (language === 'en' ? 'Not yet' : 'Ainda não')}</p>
                  <p><strong>{language === 'en' ? 'Valid Until:' : 'Válido Até:'}</strong> {formatDate(selectedCard.validUntil)}</p>
                  {selectedCard.deliveryType === 'scheduled' && selectedCard.scheduledDate && (
                    <p><strong>{language === 'en' ? 'Scheduled For:' : 'Agendado Para:'}</strong> {formatDate(selectedCard.scheduledDate)}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedCard.status === 'active' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleResendEmail(selectedCard.id)}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    {language === 'en' ? 'Resend Email' : 'Reenviar Email'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleCancel(selectedCard.id, selectedCard.code)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Cancel Card' : 'Cancelar Vale'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
