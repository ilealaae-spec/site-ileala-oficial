import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Check, Mail, Calendar, Loader2, Home, ShoppingBag } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Link, useSearch } from 'wouter';

export default function GiftCardSuccess() {
  const { language } = useLanguage();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get('session_id');
  const giftCardId = params.get('gc');

  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [giftCardInfo, setGiftCardInfo] = useState<{
    code: string;
    recipientEmail: string;
    deliveryType: string;
  } | null>(null);

  const verifyMutation = trpc.giftCards.verifyPayment.useMutation();

  useEffect(() => {
    if (sessionId && giftCardId) {
      verifyMutation.mutateAsync({
        sessionId,
        giftCardId: parseInt(giftCardId),
      }).then((result) => {
        if (result.success) {
          setVerificationStatus('success');
          setGiftCardInfo({
            code: result.code || '',
            recipientEmail: result.recipientEmail || '',
            deliveryType: result.deliveryType || 'immediate',
          });
        } else {
          setVerificationStatus('error');
        }
      }).catch(() => {
        setVerificationStatus('error');
      });
    } else {
      setVerificationStatus('error');
    }
  }, [sessionId, giftCardId]);

  const content = {
    en: {
      loading: 'Verifying your payment...',
      successTitle: 'Gift Card Purchased!',
      successDesc: 'Your gift card has been created successfully.',
      errorTitle: 'Something went wrong',
      errorDesc: 'We couldn\'t verify your payment. Please contact support if you were charged.',
      codeLabel: 'Gift Card Code',
      sentTo: 'Will be sent to',
      deliveryImmediate: 'The gift card email has been sent!',
      deliveryScheduled: 'The gift card will be sent on the scheduled date.',
      homeButton: 'Back to Home',
      shopButton: 'Continue Shopping',
      buyAnother: 'Buy Another Gift Card',
    },
    pt: {
      loading: 'Verificando seu pagamento...',
      successTitle: 'Vale Presente Comprado!',
      successDesc: 'Seu vale presente foi criado com sucesso.',
      errorTitle: 'Algo deu errado',
      errorDesc: 'Não conseguimos verificar seu pagamento. Entre em contato com o suporte se foi cobrado.',
      codeLabel: 'Código do Vale Presente',
      sentTo: 'Será enviado para',
      deliveryImmediate: 'O email do vale presente foi enviado!',
      deliveryScheduled: 'O vale presente será enviado na data agendada.',
      homeButton: 'Voltar ao Início',
      shopButton: 'Continuar Comprando',
      buyAnother: 'Comprar Outro Vale Presente',
    },
  };

  const t = content[language];

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="container max-w-lg">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">{t.errorTitle}</h1>
            <p className="text-muted-foreground mb-8">{t.errorDesc}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  {t.homeButton}
                </Button>
              </Link>
              <Link href="/gift-card">
                <Button>
                  <Gift className="w-4 h-4 mr-2" />
                  {t.buyAnother}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container max-w-2xl">
        <Card className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-4">{t.successTitle}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t.successDesc}</p>

          {giftCardInfo && (
            <div className="space-y-6 mb-8">
              {/* Gift Card Code */}
              <div className="p-6 bg-gradient-to-br from-[#172d20] to-[#255238] rounded-xl text-white">
                <p className="text-white/60 text-sm uppercase tracking-wider mb-2">{t.codeLabel}</p>
                <p className="text-3xl font-bold font-mono tracking-widest">{giftCardInfo.code}</p>
              </div>

              {/* Recipient Info */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <span>{t.sentTo}: <strong>{giftCardInfo.recipientEmail}</strong></span>
              </div>

              {/* Delivery Status */}
              <div className="p-4 bg-muted/50 rounded-lg">
                {giftCardInfo.deliveryType === 'immediate' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span>{t.deliveryImmediate}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Calendar className="w-5 h-5" />
                    <span>{t.deliveryScheduled}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t.shopButton}
              </Button>
            </Link>
            <Link href="/gift-card">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Gift className="w-4 h-4 mr-2" />
                {t.buyAnother}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
