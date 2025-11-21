import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [sessionIdState, setSessionIdState] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid);
    setSessionIdState(sid);
  }, [location]);

  // Verificar pagamento quando sessionId estiver disponível
  const { data: paymentData, isLoading: verifyingPayment } = trpc.payment.verifyPayment.useQuery(
    { sessionId: sessionIdState || '' },
    { 
      enabled: !!sessionIdState,
      retry: 2,
      onSuccess: (data) => {
        console.log('[PaymentSuccess] Payment verified:', data);
        if (data.paymentStatus === 'paid') {
          toast.success(language === 'en' ? 'Payment confirmed! Order created successfully.' : 'Pagamento confirmado! Pedido criado com sucesso.');
        }
        setLoading(false);
      },
      onError: (error) => {
        console.error('[PaymentSuccess] Error verifying payment:', error);
        toast.error(language === 'en' ? 'Failed to verify payment' : 'Falha ao verificar pagamento');
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    if (sessionIdState && !verifyingPayment && paymentData) {
      setLoading(false);
    } else if (sessionIdState && verifyingPayment) {
      setLoading(true);
    } else if (!sessionIdState) {
      setLoading(false);
    }
  }, [sessionIdState, verifyingPayment, paymentData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-sage-600 mx-auto mb-4" />
          <p className="text-sage-600">
            {language === 'en' ? 'Processing your payment...' : 'Processando seu pagamento...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          
          <h1 className="font-display text-4xl text-sage-900 mb-4">
            {language === 'en' ? 'Payment Successful!' : 'Pagamento Realizado com Sucesso!'}
          </h1>
          
          <p className="text-lg text-sage-600 mb-2">
            {language === 'en' ? 'Thank you for your purchase' : 'Obrigado pela sua compra'}
          </p>
          
          {sessionId && (
            <p className="text-sm text-sage-500">
              {language === 'en' ? 'Order ID' : 'ID do Pedido'}: {sessionId.slice(-12)}
            </p>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <Package className="w-12 h-12 text-sage-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-sage-900 mb-2">
                {language === 'en' ? 'What happens next?' : 'O que acontece agora?'}
              </h2>
              <div className="space-y-3 text-sage-600">
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <span>{language === 'en' ? 'You will receive a confirmation email shortly with your order details' : 'Você receberá um email de confirmação em breve com os detalhes do seu pedido'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <span>{language === 'en' ? 'Our team will prepare your order with care' : 'Nossa equipe preparará seu pedido com cuidado'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <span>{language === 'en' ? 'Your order will be shipped within 2-3 business days' : 'Seu pedido será enviado em 2-3 dias úteis'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <span>{language === 'en' ? 'You will receive tracking information once shipped' : 'Você receberá informações de rastreamento assim que for enviado'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-sage-200 pt-6">
            <p className="text-sm text-sage-600">
              {language === 'en' ? 'Questions about your order? Contact us at' : 'Dúvidas sobre seu pedido? Entre em contato conosco em'}{' '}
              <a href="mailto:info@ileala.ae" className="text-sage-900 font-medium hover:underline">
                info@ileala.ae
              </a>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {language === 'en' ? 'Continue Shopping' : 'Continuar Comprando'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-sage-600 hover:bg-sage-700">
              {language === 'en' ? 'Back to Home' : 'Voltar ao Início'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
