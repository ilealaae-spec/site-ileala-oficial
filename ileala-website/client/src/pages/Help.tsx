import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { HelpCircle, Package, RefreshCw, Truck, Users, Sparkles } from 'lucide-react';

export default function Help() {
  const { language } = useLanguage();

  const helpTopics = [
    {
      icon: HelpCircle,
      titleEN: 'Frequently Asked Questions',
      titlePT: 'Perguntas Frequentes',
      descEN: 'Find answers to common questions about our products and services',
      descPT: 'Encontre respostas para perguntas comuns sobre nossos produtos e serviços',
      link: '/faq'
    },
    {
      icon: Truck,
      titleEN: 'Shipping & Delivery',
      titlePT: 'Envio e Entrega',
      descEN: 'Learn about our shipping options, delivery times, and tracking',
      descPT: 'Saiba sobre nossas opções de envio, prazos de entrega e rastreamento',
      link: '/shipping'
    },
    {
      icon: RefreshCw,
      titleEN: 'Returns & Exchanges',
      titlePT: 'Devoluções e Trocas',
      descEN: 'Information about our return policy and exchange process',
      descPT: 'Informações sobre nossa política de devolução e processo de troca',
      link: '/returns'
    },
    {
      icon: Sparkles,
      titleEN: 'Product Care',
      titlePT: 'Cuidados com o Produto',
      descEN: 'Tips for maintaining and caring for your ILE ALA pieces',
      descPT: 'Dicas para manter e cuidar de suas peças ILE ALA',
      link: '/product-care'
    },
    {
      icon: Users,
      titleEN: 'Find a Retailer',
      titlePT: 'Encontre um Revendedor',
      descEN: 'Locate authorized ILE ALA retailers near you',
      descPT: 'Localize revendedores autorizados ILE ALA perto de você',
      link: '/find-retailer'
    },
    {
      icon: Package,
      titleEN: 'Contact Us',
      titlePT: 'Contate-nos',
      descEN: 'Get in touch with our customer service team',
      descPT: 'Entre em contato com nossa equipe de atendimento ao cliente',
      link: '/contact'
    }
  ];

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Como Podemos Ajudar?</h1>
            <p className="text-lg text-muted-foreground">
              Encontre respostas rápidas ou entre em contato com nossa equipe de suporte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Link key={index} href={topic.link}>
                  <a>
                    <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{topic.titlePT}</h3>
                        <p className="text-sm text-muted-foreground">{topic.descPT}</p>
                      </div>
                    </Card>
                  </a>
                </Link>
              );
            })}
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Ainda Precisa de Ajuda?</h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está pronta para ajudá-lo com qualquer dúvida ou questão
              </p>
              <div className="space-y-2">
                <p><strong>E-mail:</strong> contact@ileala.ae</p>
                <p><strong>Localização:</strong> Dubai, Emirados Árabes Unidos</p>
                <p><strong>Horário de Atendimento:</strong> Domingo a Quinta, 9h - 18h GST</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">How Can We Help?</h1>
          <p className="text-lg text-muted-foreground">
            Find quick answers or get in touch with our support team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <Link key={index} href={topic.link}>
                <a>
                  <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{topic.titleEN}</h3>
                      <p className="text-sm text-muted-foreground">{topic.descEN}</p>
                    </div>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>

        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is ready to assist you with any questions or concerns
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> contact@ileala.ae</p>
              <p><strong>Location:</strong> Dubai, United Arab Emirates</p>
              <p><strong>Business Hours:</strong> Sunday to Thursday, 9 AM - 6 PM GST</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
