import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentSuccess() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          
          <h1 className="font-display text-4xl text-sage-900 mb-4">
            {t('Payment Successful!')}
          </h1>
          
          <p className="text-lg text-sage-600 mb-2">
            {t('Thank you for your purchase')}
          </p>
          
          {sessionId && (
            <p className="text-sm text-sage-500">
              {t('Order ID')}: {sessionId.slice(-12)}
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
                {t('What happens next?')}
              </h2>
              <div className="space-y-3 text-sage-600">
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <span>{t('You will receive a confirmation email shortly with your order details')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <span>{t('Our team will prepare your order with care')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <span>{t('Your order will be shipped within 2-3 business days')}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <span>{t('You will receive tracking information once shipped')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t border-sage-200 pt-6">
            <p className="text-sm text-sage-600">
              {t('Questions about your order? Contact us at')}{' '}
              <a href="mailto:info@ileala.ae" className="text-sage-900 font-medium hover:underline">
                info@ileala.ae
              </a>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              {t('Continue Shopping')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-sage-600 hover:bg-sage-700">
              {t('Back to Home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
