import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Gift, Copy, Mail, RefreshCw, XCircle, Calendar, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
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

  const utils = trpc.useUtils();
  const { data: giftCards, isLoading } = trpc.admin.giftCards.list.useQuery({ status: statusFilter });
  const { data: stats } = trpc.admin.giftCards.stats.useQuery();

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
      </div>

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
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-700" />
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
                    <p className="text-lg font-semibold text-purple-700">
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

                    <div className="flex items-center gap-2 pt-2">
                      {getStatusBadge(card.status)}
                      {card.deliveryType === 'scheduled' && !card.deliveredAt && (
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
              <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-2">
                  {language === 'en' ? 'Gift Card Code' : 'Código do Vale'}
                </p>
                <p className="text-3xl font-bold font-mono text-purple-800">{selectedCard.code}</p>
                <div className="mt-4">{getStatusBadge(selectedCard.status)}</div>
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
