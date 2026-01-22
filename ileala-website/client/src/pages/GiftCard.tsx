import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Gift, Mail, Calendar, Loader2, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

export default function GiftCard() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: 100, // Default 100 AED
    recipientEmail: '',
    recipientName: '',
    senderName: '',
    message: '',
    deliveryType: 'immediate' as 'immediate' | 'scheduled',
    scheduledDate: '',
  });

  // Fetch gift card settings
  const { data: giftCardImageSetting } = trpc.settings.get.useQuery({ key: 'gift-card-image' });
  const { data: minValueSetting } = trpc.settings.get.useQuery({ key: 'gift-card-min-value' });
  const { data: maxValueSetting } = trpc.settings.get.useQuery({ key: 'gift-card-max-value' });

  const giftCardImage = giftCardImageSetting?.value;
  const minValue = minValueSetting?.value ? parseInt(minValueSetting.value) : 50;
  const maxValue = maxValueSetting?.value ? parseInt(maxValueSetting.value) : 2000;

  const purchaseMutation = trpc.giftCards.purchase.useMutation();
  const checkoutMutation = trpc.giftCards.createCheckoutSession.useMutation();

  // Generate preset amounts based on min/max
  const presetAmounts = [minValue, 100, 200, 500, maxValue].filter((v, i, arr) =>
    v >= minValue && v <= maxValue && arr.indexOf(v) === i
  ).sort((a, b) => a - b).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount < minValue || formData.amount > maxValue) {
      toast.error(language === 'en'
        ? `Amount must be between ${minValue} and ${maxValue.toLocaleString()} AED`
        : `O valor deve estar entre ${minValue} e ${maxValue.toLocaleString()} AED`);
      return;
    }

    if (!formData.recipientEmail) {
      toast.error(language === 'en'
        ? 'Please enter recipient email'
        : 'Por favor, insira o email do destinatário');
      return;
    }

    if (formData.deliveryType === 'scheduled' && !formData.scheduledDate) {
      toast.error(language === 'en'
        ? 'Please select a delivery date'
        : 'Por favor, selecione uma data de entrega');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the gift card
      const giftCard = await purchaseMutation.mutateAsync({
        amount: Math.round(formData.amount * 100), // Convert to fils
        recipientEmail: formData.recipientEmail,
        recipientName: formData.recipientName || undefined,
        senderName: formData.senderName || undefined,
        message: formData.message || undefined,
        deliveryType: formData.deliveryType,
        scheduledDate: formData.scheduledDate || undefined,
      });

      // Create Stripe checkout session
      const checkout = await checkoutMutation.mutateAsync({
        giftCardId: giftCard.giftCardId,
      });

      // Redirect to Stripe checkout
      if (checkout.url) {
        window.location.href = checkout.url;
      }
    } catch (error: any) {
      const errorMessage = error?.message || (language === 'en' ? 'Something went wrong' : 'Algo deu errado');
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const content = {
    en: {
      title: 'Gift Card',
      subtitle: 'Give the gift of choice',
      description: 'Send a digital gift card to someone special. They\'ll receive it via email and can use it on any purchase.',
      amountLabel: 'Select Amount (AED)',
      customAmount: 'Custom Amount',
      minMax: `Min ${minValue} AED - Max ${maxValue.toLocaleString()} AED`,
      recipientEmail: 'Recipient Email',
      recipientEmailPlaceholder: 'friend@email.com',
      recipientName: 'Recipient Name (Optional)',
      recipientNamePlaceholder: 'Friend\'s name',
      yourName: 'Your Name (Optional)',
      yourNamePlaceholder: 'Your name',
      message: 'Personal Message (Optional)',
      messagePlaceholder: 'Write a personal message to include with the gift card...',
      deliveryType: 'Delivery Type',
      immediate: 'Send Immediately',
      immediateDesc: 'Email will be sent right after payment',
      scheduled: 'Schedule for Later',
      scheduledDesc: 'Choose a date to send the gift card',
      scheduledDate: 'Delivery Date',
      preview: 'Gift Card Preview',
      buyButton: 'Purchase Gift Card',
      processing: 'Processing...',
      features: [
        'Valid for 1 year from purchase',
        'Can be used on any product',
        'Remaining balance saved for future use',
        'Sent instantly via email',
      ],
    },
    pt: {
      title: 'Vale Presente',
      subtitle: 'Dê o presente da escolha',
      description: 'Envie um vale presente digital para alguém especial. Eles receberão por email e podem usar em qualquer compra.',
      amountLabel: 'Selecione o Valor (AED)',
      customAmount: 'Valor Personalizado',
      minMax: `Mín ${minValue} AED - Máx ${maxValue.toLocaleString('pt-BR')} AED`,
      recipientEmail: 'Email do Destinatário',
      recipientEmailPlaceholder: 'amigo@email.com',
      recipientName: 'Nome do Destinatário (Opcional)',
      recipientNamePlaceholder: 'Nome do amigo',
      yourName: 'Seu Nome (Opcional)',
      yourNamePlaceholder: 'Seu nome',
      message: 'Mensagem Pessoal (Opcional)',
      messagePlaceholder: 'Escreva uma mensagem pessoal para incluir com o vale presente...',
      deliveryType: 'Tipo de Entrega',
      immediate: 'Enviar Imediatamente',
      immediateDesc: 'Email será enviado logo após o pagamento',
      scheduled: 'Agendar para Depois',
      scheduledDesc: 'Escolha uma data para enviar o vale presente',
      scheduledDate: 'Data de Entrega',
      preview: 'Prévia do Vale Presente',
      buyButton: 'Comprar Vale Presente',
      processing: 'Processando...',
      features: [
        'Válido por 1 ano a partir da compra',
        'Pode ser usado em qualquer produto',
        'Saldo restante guardado para uso futuro',
        'Enviado instantaneamente por email',
      ],
    },
  };

  const t = content[language];

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t.title}</h1>
            <p className="text-xl md:text-2xl font-light mb-4">{t.subtitle}</p>
            <p className="text-lg opacity-90">{t.description}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">{t.amountLabel}</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={formData.amount === amount ? 'default' : 'outline'}
                          className="h-12"
                          onClick={() => setFormData(prev => ({ ...prev, amount }))}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">{t.customAmount}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">AED</span>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          min={minValue}
                          max={maxValue}
                          step={1}
                          value={formData.amount}
                          onChange={handleChange}
                          className="pl-14 text-lg h-12"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{t.minMax}</p>
                    </div>
                  </div>

                  {/* Recipient Email */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">
                      <Mail className="inline w-4 h-4 mr-2" />
                      {t.recipientEmail} *
                    </Label>
                    <Input
                      id="recipientEmail"
                      name="recipientEmail"
                      type="email"
                      value={formData.recipientEmail}
                      onChange={handleChange}
                      placeholder={t.recipientEmailPlaceholder}
                      required
                    />
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">{t.recipientName}</Label>
                    <Input
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      placeholder={t.recipientNamePlaceholder}
                    />
                  </div>

                  {/* Sender Name */}
                  <div className="space-y-2">
                    <Label htmlFor="senderName">{t.yourName}</Label>
                    <Input
                      id="senderName"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      placeholder={t.yourNamePlaceholder}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">{t.message}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t.messagePlaceholder}
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {formData.message.length}/500
                    </p>
                  </div>

                  {/* Delivery Type */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">{t.deliveryType}</Label>
                    <RadioGroup
                      value={formData.deliveryType}
                      onValueChange={(value: 'immediate' | 'scheduled') =>
                        setFormData(prev => ({ ...prev, deliveryType: value }))
                      }
                    >
                      <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
                        <div>
                          <Label htmlFor="immediate" className="font-medium cursor-pointer">
                            {t.immediate}
                          </Label>
                          <p className="text-sm text-muted-foreground">{t.immediateDesc}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="scheduled" id="scheduled" className="mt-1" />
                        <div>
                          <Label htmlFor="scheduled" className="font-medium cursor-pointer">
                            <Calendar className="inline w-4 h-4 mr-2" />
                            {t.scheduled}
                          </Label>
                          <p className="text-sm text-muted-foreground">{t.scheduledDesc}</p>
                        </div>
                      </div>
                    </RadioGroup>

                    {formData.deliveryType === 'scheduled' && (
                      <div className="space-y-2 pl-8">
                        <Label htmlFor="scheduledDate">{t.scheduledDate}</Label>
                        <Input
                          id="scheduledDate"
                          name="scheduledDate"
                          type="date"
                          min={minDate}
                          value={formData.scheduledDate}
                          onChange={handleChange}
                          required={formData.deliveryType === 'scheduled'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        {t.buyButton} - AED {formData.amount.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Preview & Features */}
            <div className="space-y-8">
              {/* Gift Card Preview */}
              <div>
                <h3 className="text-xl font-semibold mb-4">{t.preview}</h3>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background: Image or Gradient */}
                  {giftCardImage ? (
                    <div className="relative">
                      <img
                        src={giftCardImage}
                        alt="Gift Card"
                        className="w-full h-auto"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute inset-0 p-8 text-white flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white/80 text-sm uppercase tracking-widest">Gift Card</p>
                            <h2 className="text-3xl font-bold mt-1">ILE ALA</h2>
                          </div>
                          <Gift className="w-10 h-10 text-white/60" />
                        </div>

                        <div className="text-center">
                          <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Value</p>
                          <p className="text-5xl font-bold">AED {formData.amount.toFixed(2)}</p>
                        </div>

                        <div className="text-sm text-white/80 flex justify-between">
                          <span>Code: GC-XXXXXXXXXXXX</span>
                          <span>Valid for 1 year</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-[#172d20] to-[#255238] p-8 text-white">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-white/60 text-sm uppercase tracking-widest">Gift Card</p>
                          <h2 className="text-3xl font-bold mt-1">ILE ALA</h2>
                        </div>
                        <Gift className="w-10 h-10 text-white/40" />
                      </div>

                      <div className="text-center py-8">
                        <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Value</p>
                        <p className="text-5xl font-bold">AED {formData.amount.toFixed(2)}</p>
                      </div>

                      {formData.recipientName && (
                        <div className="mt-6 pt-6 border-t border-white/20">
                          <p className="text-white/60 text-sm">For:</p>
                          <p className="text-lg font-medium">{formData.recipientName}</p>
                        </div>
                      )}

                      {formData.message && (
                        <div className="mt-4 p-4 bg-white/10 rounded-lg">
                          <p className="text-sm italic">"{formData.message}"</p>
                          {formData.senderName && (
                            <p className="text-sm text-white/60 mt-2 text-right">— {formData.senderName}</p>
                          )}
                        </div>
                      )}

                      <div className="mt-8 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm text-white/60">
                          <span>Code: GC-XXXXXXXXXXXX</span>
                          <span>Valid for 1 year</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'en' ? 'Gift Card Benefits' : 'Benefícios do Vale Presente'}
                </h3>
                <ul className="space-y-3">
                  {t.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
