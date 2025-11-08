import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

export default function FindRetailer() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Encontre um Revendedor</h1>
            <p className="text-lg text-muted-foreground">
              Descubra onde encontrar produtos ILE ALA perto de você
            </p>
          </div>

          <Card className="p-8 mb-12 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Loja Principal - Dubai</h2>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <p>Dubai, Emirados Árabes Unidos</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <p>info@ileala.ae</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <p>www.ileala.ae</p>
                </div>
              </div>
              <Button 
                className="mt-6"
                onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Informações sobre Revendedores'}
              >
                Entre em Contato
              </Button>
            </div>
          </Card>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Torne-se um Revendedor</h2>
            <Card className="p-8">
              <p className="text-lg mb-6 leading-relaxed">
                A ILE ALA está expandindo sua rede de revendedores autorizados. Se você tem uma loja de decoração, design de interiores ou produtos de luxo e deseja fazer parceria conosco, adoraríamos ouvir de você.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Benefícios da Parceria</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Produtos artesanais exclusivos de luxo</li>
                    <li>✓ Margens competitivas</li>
                    <li>✓ Suporte de marketing e materiais promocionais</li>
                    <li>✓ Treinamento sobre produtos</li>
                    <li>✓ Listagem em nosso site como revendedor autorizado</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Requisitos</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Loja física estabelecida</li>
                    <li>✓ Experiência em produtos de luxo/decoração</li>
                    <li>✓ Comprometimento com excelência no atendimento</li>
                    <li>✓ Alinhamento com os valores da marca ILE ALA</li>
                    <li>✓ Capacidade de manter estoque mínimo</li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <p className="mb-4 font-medium">Interessado em se tornar um revendedor ILE ALA?</p>
                <Button 
                  size="lg"
                  onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Proposta de Parceria - Revendedor'}
                >
                  Solicite Informações sobre Parceria
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Compre Online</h2>
            <Card className="p-8 text-center">
              <p className="text-lg mb-4 leading-relaxed">
                Não encontrou um revendedor perto de você? Visite nossa loja online para explorar toda a coleção ILE ALA e receber seus produtos diretamente em casa.
              </p>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/collections'}
              >
                Ver Coleções Online
              </Button>
            </Card>
          </div>

          <div className="mt-12 text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Perguntas sobre Revendedores?</h3>
            <p className="text-muted-foreground mb-4">
              Nossa equipe está pronta para ajudar com qualquer dúvida
            </p>
            <p className="font-medium">info@ileala.ae</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Find a Retailer</h1>
          <p className="text-lg text-muted-foreground">
            Discover where to find ILE ALA products near you
          </p>
        </div>

        <Card className="p-8 mb-12 bg-primary/5 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Main Store - Dubai</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <p>Dubai, United Arab Emirates</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <p>info@ileala.ae</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <p>www.ileala.ae</p>
              </div>
            </div>
            <Button 
              className="mt-6"
              onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Retailer Information'}
            >
              Contact Us
            </Button>
          </div>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Become a Retailer</h2>
          <Card className="p-8">
            <p className="text-lg mb-6 leading-relaxed">
              ILE ALA is expanding its network of authorized retailers. If you have a home decor, interior design, or luxury goods store and would like to partner with us, we'd love to hear from you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Partnership Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Exclusive luxury handcrafted products</li>
                  <li>✓ Competitive margins</li>
                  <li>✓ Marketing support and promotional materials</li>
                  <li>✓ Product training</li>
                  <li>✓ Listing on our website as authorized retailer</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Established physical store</li>
                  <li>✓ Experience in luxury/home decor products</li>
                  <li>✓ Commitment to service excellence</li>
                  <li>✓ Alignment with ILE ALA brand values</li>
                  <li>✓ Ability to maintain minimum stock</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-4 font-medium">Interested in becoming an ILE ALA retailer?</p>
              <Button 
                size="lg"
                onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Partnership Proposal - Retailer'}
              >
                Request Partnership Information
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center">Shop Online</h2>
          <Card className="p-8 text-center">
            <p className="text-lg mb-4 leading-relaxed">
              Can't find a retailer near you? Visit our online store to explore the full ILE ALA collection and have products delivered directly to your home.
            </p>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/collections'}
            >
              View Collections Online
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center p-6 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Questions About Retailers?</h3>
          <p className="text-muted-foreground mb-4">
            Our team is ready to help with any questions
          </p>
          <p className="font-medium">info@ileala.ae</p>
        </div>
      </div>
    </div>
  );
}
