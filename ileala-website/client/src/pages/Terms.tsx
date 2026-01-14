import { useLanguage } from '@/contexts/LanguageContext';

export default function Terms() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Termos e Condições</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="leading-relaxed">
                Ao acessar e usar o site da ILE ALA, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Produtos e Serviços</h2>
              <p className="leading-relaxed mb-4">
                A ILE ALA oferece produtos artesanais de luxo para casa e mesa, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Jogos americanos e guardanapos de alta qualidade</li>
                <li>Anéis de guardanapo e acessórios para mesa</li>
                <li>Almofadas e têxteis decorativos</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Todos os produtos são feitos sob encomenda ou em quantidades limitadas. As cores e padrões podem variar ligeiramente devido à natureza artesanal de nossos produtos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Pedidos e Pagamentos</h2>
              <p className="leading-relaxed">
                Os pedidos estão sujeitos à disponibilidade e confirmação do preço. Para produtos em estoque, a entrega é imediata. Para encomendas personalizadas, o prazo de entrega é de até 45 dias. Os preços estão sujeitos a alteração sem aviso prévio. Aceitamos diversas formas de pagamento e todos os preços incluem VAT de 5%.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Entrega</h2>
              <p className="leading-relaxed">
                Realizamos entregas nos Emirados Árabes Unidos e internacionalmente. Os prazos de entrega variam de acordo com a localização e disponibilidade do produto. Produtos em estoque são enviados imediatamente, enquanto encomendas personalizadas levam até 45 dias para produção e entrega.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Política de Devolução</h2>
              <p className="leading-relaxed">
                Devido à natureza artesanal e personalizada de nossos produtos, aceitamos devoluções apenas em caso de defeito de fabricação ou erro no envio. As devoluções devem ser solicitadas dentro de 7 dias após o recebimento. Produtos personalizados não são elegíveis para devolução, exceto em caso de defeito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="leading-relaxed">
                Todo o conteúdo deste site, incluindo textos, imagens, designs e logotipos, é propriedade da ILE ALA e está protegido por leis de direitos autorais. É proibida a reprodução sem autorização expressa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="leading-relaxed">
                A ILE ALA não será responsável por quaisquer danos indiretos, incidentais ou consequenciais decorrentes do uso de nossos produtos ou serviços. Nossa responsabilidade está limitada ao valor pago pelo produto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Alterações nos Termos</h2>
              <p className="leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Lei Aplicável</h2>
              <p className="leading-relaxed">
                Estes termos são regidos pelas leis dos Emirados Árabes Unidos. Quaisquer disputas serão resolvidas nos tribunais de Dubai.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
              <p className="leading-relaxed">
                Para questões sobre estes termos, entre em contato através de contact@ileala.ae
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the ILE ALA website, you agree to comply with and be bound by the following terms and conditions of use. If you do not agree with any part of these terms, you should not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
            <p className="leading-relaxed mb-4">
              ILE ALA offers luxury handcrafted products for home and table, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>High-quality placemats and napkins</li>
              <li>Napkin rings and table accessories</li>
              <li>Cushions and decorative textiles</li>
            </ul>
            <p className="leading-relaxed mt-4">
              All products are made to order or in limited quantities. Colors and patterns may vary slightly due to the handcrafted nature of our products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Orders and Payments</h2>
            <p className="leading-relaxed">
              Orders are subject to availability and price confirmation. For in-stock products, delivery is immediate. For custom orders, delivery time is up to 45 days. Prices are subject to change without notice. We accept various payment methods and all prices include 5% VAT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Delivery</h2>
            <p className="leading-relaxed">
              We deliver within the United Arab Emirates and internationally. Delivery times vary according to location and product availability. In-stock products are shipped immediately, while custom orders take up to 45 days for production and delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Return Policy</h2>
            <p className="leading-relaxed">
              Due to the handcrafted and personalized nature of our products, we accept returns only in case of manufacturing defect or shipping error. Returns must be requested within 7 days of receipt. Personalized products are not eligible for return except in case of defect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this website, including text, images, designs, and logos, is the property of ILE ALA and is protected by copyright laws. Reproduction without express permission is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              ILE ALA shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the amount paid for the product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting on the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
            <p className="leading-relaxed">
              These terms are governed by the laws of the United Arab Emirates. Any disputes will be resolved in the courts of Dubai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="leading-relaxed">
              For questions about these terms, please contact us at contact@ileala.ae
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
