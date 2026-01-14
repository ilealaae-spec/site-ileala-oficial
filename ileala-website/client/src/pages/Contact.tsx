import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Mail, MapPin, Instagram, Facebook, Phone } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Contact() {
  const { t } = useLanguage();
  const { settings } = useSiteSettings();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t.contact.title}</h1>
            <p className="text-xl md:text-2xl font-light">
              We'd love to hear from you. Get in touch with us.
            </p>
          </div>
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
    </div>
  );
}
