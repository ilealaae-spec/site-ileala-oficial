import { useLanguage } from '@/contexts/LanguageContext';

export default function AIPolicy() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Política de Uso de Inteligência Artificial</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p className="leading-relaxed">
                A ILE ALA está comprometida com a transparência no uso de tecnologias de inteligência artificial (IA) em nossos processos e serviços. Esta política descreve como utilizamos IA e como isso pode afetar sua experiência conosco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Uso de IA em Nossos Serviços</h2>
              <p className="leading-relaxed mb-4">
                A ILE ALA pode utilizar tecnologias de inteligência artificial para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Melhorar a experiência de navegação no site através de recomendações personalizadas</li>
                <li>Otimizar processos de atendimento ao cliente</li>
                <li>Análise de preferências para desenvolvimento de novos produtos</li>
                <li>Processamento de imagens para melhor apresentação de produtos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Transparência e Controle</h2>
              <p className="leading-relaxed">
                Todos os sistemas de IA utilizados pela ILE ALA são implementados com supervisão humana. Nossos artesãos e designers mantêm controle total sobre o processo criativo e a qualidade dos produtos. A IA é utilizada apenas como ferramenta de suporte, nunca substituindo o toque humano que define nossas criações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Proteção de Dados</h2>
              <p className="leading-relaxed">
                Quaisquer dados utilizados por sistemas de IA são processados de acordo com nossa Política de Privacidade e em conformidade com leis de proteção de dados aplicáveis. Não compartilhamos dados pessoais com sistemas de IA de terceiros sem consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Decisões Automatizadas</h2>
              <p className="leading-relaxed">
                A ILE ALA não utiliza IA para tomar decisões automatizadas que afetem significativamente seus direitos sem intervenção humana. Todas as decisões importantes relacionadas a pedidos, atendimento e relacionamento com clientes são revisadas por nossa equipe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Atualizações desta Política</h2>
              <p className="leading-relaxed">
                Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou requisitos legais. Notificaremos sobre alterações significativas através de nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contato</h2>
              <p className="leading-relaxed">
                Para questões sobre nossa política de IA, entre em contato através de info@ileala.ae
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Artificial Intelligence Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              ILE ALA is committed to transparency in the use of artificial intelligence (AI) technologies in our processes and services. This policy describes how we use AI and how it may affect your experience with us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use of AI in Our Services</h2>
            <p className="leading-relaxed mb-4">
              ILE ALA may use artificial intelligence technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Enhance website browsing experience through personalized recommendations</li>
              <li>Optimize customer service processes</li>
              <li>Analyze preferences for new product development</li>
              <li>Process images for better product presentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Transparency and Control</h2>
            <p className="leading-relaxed">
              All AI systems used by ILE ALA are implemented with human oversight. Our artisans and designers maintain full control over the creative process and product quality. AI is used only as a support tool, never replacing the human touch that defines our creations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Protection</h2>
            <p className="leading-relaxed">
              Any data used by AI systems is processed in accordance with our Privacy Policy and in compliance with applicable data protection laws. We do not share personal data with third-party AI systems without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Automated Decisions</h2>
            <p className="leading-relaxed">
              ILE ALA does not use AI to make automated decisions that significantly affect your rights without human intervention. All important decisions related to orders, service, and customer relationships are reviewed by our team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p className="leading-relaxed">
              This policy may be updated periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes through our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p className="leading-relaxed">
              For questions about our AI policy, please contact us at info@ileala.ae
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
