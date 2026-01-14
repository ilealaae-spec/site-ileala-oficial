import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="leading-relaxed">
                A ILE ALA respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta política de privacidade explica como coletamos, usamos e protegemos suas informações quando você visita nosso site ou utiliza nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
              <p className="leading-relaxed mb-4">Podemos coletar as seguintes informações:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Informações de contato:</strong> nome, endereço de e-mail, número de telefone, endereço de entrega</li>
                <li><strong>Informações de pagamento:</strong> dados de cartão de crédito processados de forma segura através de provedores de pagamento terceirizados</li>
                <li><strong>Informações de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas, tempo de permanência</li>
                <li><strong>Preferências:</strong> histórico de compras, preferências de produtos, comunicações de marketing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
              <p className="leading-relaxed mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processar e entregar seus pedidos</li>
                <li>Comunicar sobre o status do pedido e atualizações de entrega</li>
                <li>Fornecer atendimento ao cliente e suporte</li>
                <li>Melhorar nosso site e experiência do usuário</li>
                <li>Enviar newsletters e ofertas promocionais (com seu consentimento)</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
              <p className="leading-relaxed">
                Não vendemos suas informações pessoais. Podemos compartilhar seus dados com:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Provedores de serviços de pagamento para processar transações</li>
                <li>Empresas de entrega para envio de produtos</li>
                <li>Provedores de serviços de tecnologia que nos ajudam a operar nosso site</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies e Tecnologias Similares</h2>
              <p className="leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência de navegação, analisar o tráfego do site e personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Segurança dos Dados</h2>
              <p className="leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Seus Direitos</h2>
              <p className="leading-relaxed mb-4">Você tem o direito de:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Opor-se ao processamento de seus dados</li>
                <li>Retirar consentimento para comunicações de marketing</li>
                <li>Solicitar portabilidade de dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p className="leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Transferências Internacionais</h2>
              <p className="leading-relaxed">
                Seus dados podem ser transferidos e processados em países fora dos Emirados Árabes Unidos. Garantimos que tais transferências sejam realizadas de acordo com as leis de proteção de dados aplicáveis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="leading-relaxed">
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas através de nosso site ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
              <p className="leading-relaxed">
                Para exercer seus direitos ou fazer perguntas sobre esta política, entre em contato através de contact@ileala.ae
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              ILE ALA respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Contact information:</strong> name, email address, phone number, delivery address</li>
              <li><strong>Payment information:</strong> credit card data processed securely through third-party payment providers</li>
              <li><strong>Browsing information:</strong> IP address, browser type, pages visited, time spent</li>
              <li><strong>Preferences:</strong> purchase history, product preferences, marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process and deliver your orders</li>
              <li>Communicate about order status and delivery updates</li>
              <li>Provide customer service and support</li>
              <li>Improve our website and user experience</li>
              <li>Send newsletters and promotional offers (with your consent)</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Payment service providers to process transactions</li>
              <li>Delivery companies for product shipping</li>
              <li>Technology service providers who help us operate our website</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Similar Technologies</h2>
            <p className="leading-relaxed">
              We use cookies and similar technologies to improve your browsing experience, analyze website traffic, and personalize content. You can control cookie usage through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of internet transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
            <p className="leading-relaxed">
              Your data may be transferred to and processed in countries outside the United Arab Emirates. We ensure that such transfers are carried out in accordance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this policy periodically. We will notify you of significant changes through our website or by email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p className="leading-relaxed">
              To exercise your rights or ask questions about this policy, please contact us at contact@ileala.ae
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
