import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Truck, Package, Globe, Clock } from 'lucide-react';

export default function Shipping() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Envio e Entrega</h1>
          
          <div className="space-y-8 text-foreground">
            <section>
              <p className="leading-relaxed text-lg">
                Na ILE ALA, garantimos que seus produtos artesanais de luxo cheguem até você com segurança e no prazo. Trabalhamos com as melhores transportadoras para oferecer um serviço de entrega confiável.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Produtos em Estoque</h3>
                    <p className="text-sm text-muted-foreground">
                      Entrega imediata. Envio em 1-2 dias úteis após confirmação do pedido.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Encomendas Personalizadas</h3>
                    <p className="text-sm text-muted-foreground">
                      Prazo de até 45 dias para produção artesanal e entrega.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Opções de Envio</h2>
              
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Truck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Envio Nacional (EAU)</h3>
                      <p className="text-muted-foreground mb-2">
                        Entrega em 2-3 dias úteis para todo o território dos Emirados Árabes Unidos.
                      </p>
                      <p className="text-sm"><strong>Custo:</strong> Frete grátis para pedidos acima de 500 AED</p>
                      <p className="text-sm"><strong>Transportadora:</strong> Emirates Post, Aramex</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Envio Internacional</h3>
                      <p className="text-muted-foreground mb-2">
                        Enviamos para todo o mundo. Prazos de entrega variam de 5-15 dias úteis dependendo do destino.
                      </p>
                      <p className="text-sm"><strong>Regiões:</strong> GCC (3-5 dias), Europa (7-10 dias), Américas (10-15 dias), Ásia (5-10 dias)</p>
                      <p className="text-sm"><strong>Transportadoras:</strong> DHL, FedEx, UPS</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        *Taxas alfandegárias e impostos de importação são de responsabilidade do destinatário
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Rastreamento de Pedidos</h2>
              <p className="leading-relaxed mb-4">
                Assim que seu pedido for enviado, você receberá um e-mail de confirmação com:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                <li>Número de rastreamento</li>
                <li>Link para rastreamento online</li>
                <li>Data estimada de entrega</li>
                <li>Informações da transportadora</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Embalagem</h2>
              <p className="leading-relaxed">
                Todos os produtos ILE ALA são cuidadosamente embalados para garantir que cheguem em perfeitas condições. Utilizamos materiais de embalagem premium e sustentáveis sempre que possível. Cada item é protegido individualmente e acompanhado de instruções de cuidados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Problemas com a Entrega</h2>
              <p className="leading-relaxed mb-4">
                Se houver algum problema com sua entrega, entre em contato conosco imediatamente:
              </p>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <p><strong>E-mail:</strong> contact@ileala.ae</p>
                <p><strong>Assunto:</strong> "Problema com Entrega - [Número do Pedido]"</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Nossa equipe responderá dentro de 24 horas e trabalhará para resolver qualquer questão rapidamente.
                </p>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes sobre Envio</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Posso alterar o endereço de entrega após fazer o pedido?</h4>
                  <p className="text-muted-foreground text-sm">
                    Sim, se o pedido ainda não foi enviado. Entre em contato conosco imediatamente para fazer alterações.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">O que acontece se eu não estiver em casa na entrega?</h4>
                  <p className="text-muted-foreground text-sm">
                    A transportadora deixará um aviso e tentará uma segunda entrega. Você também pode entrar em contato com a transportadora para agendar uma nova tentativa ou retirar o pacote.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Vocês oferecem entrega expressa?</h4>
                  <p className="text-muted-foreground text-sm">
                    Sim, para pedidos nos EAU. Entre em contato conosco para mais informações sobre entrega expressa e custos adicionais.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Shipping & Delivery</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <p className="leading-relaxed text-lg">
              At ILE ALA, we ensure your luxury handcrafted products reach you safely and on time. We work with the best carriers to provide reliable delivery service.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">In-Stock Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Immediate delivery. Ships within 1-2 business days after order confirmation.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Custom Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Up to 45 days for handcrafted production and delivery.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Shipping Options</h2>
            
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Domestic Shipping (UAE)</h3>
                    <p className="text-muted-foreground mb-2">
                      Delivery within 2-3 business days across the United Arab Emirates.
                    </p>
                    <p className="text-sm"><strong>Cost:</strong> Free shipping on orders above 500 AED</p>
                    <p className="text-sm"><strong>Carriers:</strong> Emirates Post, Aramex</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">International Shipping</h3>
                    <p className="text-muted-foreground mb-2">
                      We ship worldwide. Delivery times vary from 5-15 business days depending on destination.
                    </p>
                    <p className="text-sm"><strong>Regions:</strong> GCC (3-5 days), Europe (7-10 days), Americas (10-15 days), Asia (5-10 days)</p>
                    <p className="text-sm"><strong>Carriers:</strong> DHL, FedEx, UPS</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      *Customs duties and import taxes are the responsibility of the recipient
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Order Tracking</h2>
            <p className="leading-relaxed mb-4">
              Once your order ships, you will receive a confirmation email with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
              <li>Tracking number</li>
              <li>Link for online tracking</li>
              <li>Estimated delivery date</li>
              <li>Carrier information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Packaging</h2>
            <p className="leading-relaxed">
              All ILE ALA products are carefully packaged to ensure they arrive in perfect condition. We use premium and sustainable packaging materials whenever possible. Each item is individually protected and comes with care instructions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Delivery Issues</h2>
            <p className="leading-relaxed mb-4">
              If there is any problem with your delivery, please contact us immediately:
            </p>
            <Card className="p-6 bg-primary/5 border-primary/20">
              <p><strong>Email:</strong> contact@ileala.ae</p>
              <p><strong>Subject:</strong> "Delivery Issue - [Order Number]"</p>
              <p className="text-sm text-muted-foreground mt-4">
                Our team will respond within 24 hours and work to resolve any issues quickly.
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Shipping FAQs</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Can I change the delivery address after placing an order?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes, if the order has not yet shipped. Please contact us immediately to make changes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What happens if I'm not home for delivery?</h4>
                <p className="text-muted-foreground text-sm">
                  The carrier will leave a notice and attempt a second delivery. You can also contact the carrier to schedule a new attempt or pick up the package.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do you offer express delivery?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes, for orders within the UAE. Contact us for more information about express delivery and additional costs.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
