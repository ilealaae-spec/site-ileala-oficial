import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Instagram, Facebook, Phone, Send, Loader2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// Default hero image
const DEFAULT_HERO_IMAGE = '/images/contact-hero.webp';

export default function Contact() {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();

  // Fetch contact page settings from database
  const { data: heroImageSetting, isLoading: isHeroLoading } = trpc.settings.get.useQuery({ key: 'contact-hero-image' });
  const { data: heroTitleENSetting } = trpc.settings.get.useQuery({ key: 'contact-hero-title-en' });
  const { data: heroTitlePTSetting } = trpc.settings.get.useQuery({ key: 'contact-hero-title-pt' });
  const { data: heroSubtitleENSetting } = trpc.settings.get.useQuery({ key: 'contact-hero-subtitle-en' });
  const { data: heroSubtitlePTSetting } = trpc.settings.get.useQuery({ key: 'contact-hero-subtitle-pt' });

  const heroImage = heroImageSetting?.value || DEFAULT_HERO_IMAGE;
  const heroTitle = language === 'en'
    ? (heroTitleENSetting?.value || t.contact.title)
    : (heroTitlePTSetting?.value || t.contact.title);
  const heroSubtitle = language === 'en'
    ? (heroSubtitleENSetting?.value || "We'd love to hear from you. Get in touch with us.")
    : (heroSubtitlePTSetting?.value || 'Adoraríamos ouvir de você. Entre em contato conosco.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create mailto link with form data
    const mailtoLink = `mailto:${settings.email}?subject=${encodeURIComponent(formData.subject || 'Contact from website')}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    // Open email client
    window.location.href = mailtoLink;

    // Reset form after a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(language === 'en' ? 'Opening your email client...' : 'Abrindo seu cliente de email...');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full">
      {/* Hero Section with Image */}
      <section
        className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90" style={{ fontFamily: 'Georgia, serif' }}>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.contact.location}</h3>
              <p className="text-muted-foreground">
                {settings.address}
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.contact.phone || 'Phone'}</h3>
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="text-primary hover:underline"
              >
                {settings.phone}
              </a>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.contact.email}</h3>
              <a
                href={`mailto:${settings.email}`}
                className="text-primary hover:underline"
              >
                {settings.email}
              </a>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Social Media</h3>
              <div className="flex gap-4 justify-center">
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-70 transition-opacity"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-70 transition-opacity"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {language === 'en' ? 'Send us a message' : 'Envie-nos uma mensagem'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'en'
                  ? 'Fill out the form below and we\'ll get back to you as soon as possible.'
                  : 'Preencha o formulário abaixo e retornaremos o mais breve possível.'}
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === 'en' ? 'Your Name' : 'Seu Nome'} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={language === 'en' ? 'John Doe' : 'João Silva'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'en' ? 'Your Email' : 'Seu Email'} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    {language === 'en' ? 'Subject' : 'Assunto'}
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={language === 'en' ? 'How can we help you?' : 'Como podemos ajudá-lo?'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {language === 'en' ? 'Message' : 'Mensagem'} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={language === 'en' ? 'Write your message here...' : 'Escreva sua mensagem aqui...'}
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'en' ? 'Sending...' : 'Enviando...'}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {language === 'en' ? 'Send Message' : 'Enviar Mensagem'}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
