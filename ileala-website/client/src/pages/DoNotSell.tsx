import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DoNotSell() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Não Venda Minhas Informações Pessoais</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Seu Direito à Privacidade</h2>
              <p className="leading-relaxed">
                A ILE ALA respeita profundamente sua privacidade e seus direitos sobre suas informações pessoais. Esta página permite que você exerça seu direito de optar por não ter suas informações pessoais vendidas ou compartilhadas para fins comerciais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Nossa Política</h2>
              <p className="leading-relaxed mb-4">
                <strong>A ILE ALA NÃO vende suas informações pessoais.</strong> Nunca vendemos, alugamos ou comercializamos dados pessoais de nossos clientes a terceiros para fins de marketing ou publicidade.
              </p>
              <p className="leading-relaxed">
                Compartilhamos informações apenas quando estritamente necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Processar e entregar seus pedidos (com empresas de pagamento e entrega)</li>
                <li>Fornecer serviços essenciais do site (provedores de hospedagem e tecnologia)</li>
                <li>Cumprir obrigações legais quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Informações que Coletamos</h2>
              <p className="leading-relaxed mb-4">
                As informações pessoais que coletamos incluem:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nome e informações de contato</li>
                <li>Endereço de entrega e cobrança</li>
                <li>Informações de pagamento (processadas de forma segura)</li>
                <li>Histórico de compras e preferências</li>
                <li>Dados de navegação e uso do site</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Protegemos Suas Informações</h2>
              <p className="leading-relaxed">
                Implementamos medidas rigorosas de segurança técnica e organizacional para proteger suas informações pessoais contra acesso não autorizado, uso indevido ou divulgação. Todos os nossos parceiros de serviços são cuidadosamente selecionados e obrigados a manter os mesmos padrões de proteção de dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Seus Direitos</h2>
              <p className="leading-relaxed mb-4">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Saber quais informações pessoais coletamos e como as usamos</li>
                <li>Solicitar acesso às suas informações pessoais</li>
                <li>Solicitar correção de informações imprecisas</li>
                <li>Solicitar exclusão de suas informações pessoais</li>
                <li>Optar por não receber comunicações de marketing</li>
                <li>Retirar consentimento a qualquer momento</li>
              </ul>
            </section>

            <Card className="p-8 bg-primary/5 border-primary/20 mt-8">
              <h3 className="text-xl font-semibold mb-4">Exercer Seus Direitos</h3>
              <p className="leading-relaxed mb-6">
                Para exercer qualquer um desses direitos ou fazer perguntas sobre como tratamos suas informações pessoais, entre em contato conosco:
              </p>
              <div className="space-y-2 mb-6">
                <p><strong>E-mail:</strong> info@ileala.ae</p>
                <p><strong>Assunto:</strong> "Privacidade de Dados - Não Vender Informações"</p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Responderemos a todas as solicitações dentro de 30 dias. Podemos solicitar informações adicionais para verificar sua identidade antes de processar sua solicitação.
              </p>
              <Button 
                onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Privacidade de Dados - Não Vender Informações'}
                className="w-full md:w-auto"
              >
                Entrar em Contato
              </Button>
            </Card>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Cookies e Rastreamento</h2>
              <p className="leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar sua experiência. Você pode controlar o uso de cookies através das configurações do seu navegador. Para mais informações, consulte nossa Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Alterações nesta Política</h2>
              <p className="leading-relaxed">
                Se alterarmos nossas práticas de compartilhamento de dados, atualizaremos esta página e notificaremos você através de nosso site ou por e-mail. Recomendamos que você revise esta página periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Conformidade Legal</h2>
              <p className="leading-relaxed">
                Esta página foi criada em conformidade com leis de proteção de dados aplicáveis, incluindo GDPR (Europa), CCPA (Califórnia) e outras regulamentações de privacidade relevantes. Mantemos os mais altos padrões de proteção de dados independentemente de sua localização.
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Do Not Sell My Personal Information</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Right to Privacy</h2>
            <p className="leading-relaxed">
              ILE ALA deeply respects your privacy and your rights over your personal information. This page allows you to exercise your right to opt out of having your personal information sold or shared for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Policy</h2>
            <p className="leading-relaxed mb-4">
              <strong>ILE ALA DOES NOT sell your personal information.</strong> We never sell, rent, or trade our customers' personal data to third parties for marketing or advertising purposes.
            </p>
            <p className="leading-relaxed">
              We share information only when strictly necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Process and deliver your orders (with payment and delivery companies)</li>
              <li>Provide essential website services (hosting and technology providers)</li>
              <li>Comply with legal obligations when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              The personal information we collect includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name and contact information</li>
              <li>Delivery and billing address</li>
              <li>Payment information (securely processed)</li>
              <li>Purchase history and preferences</li>
              <li>Browsing and website usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Protect Your Information</h2>
            <p className="leading-relaxed">
              We implement rigorous technical and organizational security measures to protect your personal information against unauthorized access, misuse, or disclosure. All our service partners are carefully selected and required to maintain the same data protection standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Know what personal information we collect and how we use it</li>
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <Card className="p-8 bg-primary/5 border-primary/20 mt-8">
            <h3 className="text-xl font-semibold mb-4">Exercise Your Rights</h3>
            <p className="leading-relaxed mb-6">
              To exercise any of these rights or ask questions about how we handle your personal information, please contact us:
            </p>
            <div className="space-y-2 mb-6">
              <p><strong>Email:</strong> info@ileala.ae</p>
              <p><strong>Subject:</strong> "Data Privacy - Do Not Sell Information"</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We will respond to all requests within 30 days. We may request additional information to verify your identity before processing your request.
            </p>
            <Button 
              onClick={() => window.location.href = 'mailto:info@ileala.ae?subject=Data Privacy - Do Not Sell Information'}
              className="w-full md:w-auto"
            >
              Contact Us
            </Button>
          </Card>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="leading-relaxed">
              We use essential cookies for website functionality and analytical cookies to improve your experience. You can control cookie usage through your browser settings. For more information, please see our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="leading-relaxed">
              If we change our data sharing practices, we will update this page and notify you through our website or by email. We recommend that you review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Legal Compliance</h2>
            <p className="leading-relaxed">
              This page was created in compliance with applicable data protection laws, including GDPR (Europe), CCPA (California), and other relevant privacy regulations. We maintain the highest data protection standards regardless of your location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
