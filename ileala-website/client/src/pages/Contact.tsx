import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, MapPin, Instagram, Facebook } from 'lucide-react';




export default function Contact() {
  const { t } = useLanguage();




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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.contact.location}</h3>
              <p className="text-muted-foreground">
                {t.contact.dubai}
              </p>
            </Card>




            <Card className="p-8 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.contact.email}</h3>
              <a 
                href="mailto:info@ileala.ae" 
                className="text-primary hover:underline"
              >
                info@ileala.ae
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
                  href="https://www.instagram.com/ileala.ae" 
                  target="_blank" 
