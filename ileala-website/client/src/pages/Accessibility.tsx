import { useLanguage } from '@/contexts/LanguageContext';

export default function Accessibility() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Declaração de Acessibilidade</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Nosso Compromisso</h2>
              <p className="leading-relaxed">
                A ILE ALA está comprometida em garantir que nosso site seja acessível a todas as pessoas, incluindo aquelas com deficiências. Acreditamos que todos devem ter a oportunidade de navegar, descobrir e adquirir nossos produtos de luxo de forma independente e com dignidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Padrões de Acessibilidade</h2>
              <p className="leading-relaxed">
                Nosso site foi desenvolvido seguindo as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, nível AA. Essas diretrizes internacionalmente reconhecidas ajudam a tornar o conteúdo web mais acessível para pessoas com deficiências visuais, auditivas, motoras e cognitivas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Recursos de Acessibilidade</h2>
              <p className="leading-relaxed mb-4">
                Implementamos os seguintes recursos para melhorar a acessibilidade:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Estrutura de cabeçalhos clara e hierárquica para navegação com leitores de tela</li>
                <li>Textos alternativos descritivos para todas as imagens de produtos</li>
                <li>Contraste de cores adequado entre texto e fundo</li>
                <li>Navegação por teclado completa em todas as páginas</li>
                <li>Formulários com rótulos claros e mensagens de erro descritivas</li>
                <li>Tamanhos de fonte legíveis e responsivos</li>
                <li>Links descritivos que fazem sentido fora do contexto</li>
                <li>Suporte para zoom de até 200% sem perda de funcionalidade</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Tecnologias Assistivas</h2>
              <p className="leading-relaxed">
                Nosso site é compatível com as principais tecnologias assistivas, incluindo leitores de tela (JAWS, NVDA, VoiceOver), navegação por teclado, software de reconhecimento de voz e ampliadores de tela.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitações Conhecidas</h2>
              <p className="leading-relaxed mb-4">
                Apesar de nossos esforços contínuos, algumas áreas do site podem ainda apresentar desafios de acessibilidade:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Alguns vídeos podem não ter legendas completas (estamos trabalhando para adicionar)</li>
                <li>Conteúdo de terceiros incorporado pode não atender totalmente aos padrões de acessibilidade</li>
                <li>Algumas imagens históricas podem ter descrições limitadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Melhorias Contínuas</h2>
              <p className="leading-relaxed">
                A acessibilidade é um processo contínuo. Realizamos auditorias regulares de acessibilidade e implementamos melhorias com base em feedback de usuários e nas melhores práticas mais recentes. Estamos constantemente trabalhando para melhorar a experiência de todos os nossos visitantes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Feedback e Assistência</h2>
              <p className="leading-relaxed mb-4">
                Valorizamos seu feedback sobre a acessibilidade do nosso site. Se você encontrar alguma barreira de acessibilidade ou tiver sugestões de melhoria, entre em contato conosco:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li><strong>E-mail:</strong> contact@ileala.ae</li>
                <li><strong>Assunto:</strong> "Acessibilidade do Site"</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Responderemos a todas as solicitações relacionadas à acessibilidade dentro de 5 dias úteis. Se você precisar de assistência para acessar informações em nosso site ou fazer um pedido, nossa equipe terá prazer em ajudá-lo por telefone ou e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Formatos Alternativos</h2>
              <p className="leading-relaxed">
                Se você precisar de informações do nosso site em um formato alternativo (como impressão em letra grande, áudio ou Braille), entre em contato conosco e faremos o possível para atender sua solicitação.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Avaliação e Testes</h2>
              <p className="leading-relaxed">
                Esta declaração de acessibilidade foi criada e revisada com base em testes internos, ferramentas automatizadas de verificação de acessibilidade e feedback de usuários. Última avaliação realizada em {new Date().toLocaleDateString('pt-BR')}.
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Accessibility Statement</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="leading-relaxed">
              ILE ALA is committed to ensuring that our website is accessible to all people, including those with disabilities. We believe everyone should have the opportunity to browse, discover, and purchase our luxury products independently and with dignity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Accessibility Standards</h2>
            <p className="leading-relaxed">
              Our website has been developed following the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These internationally recognized guidelines help make web content more accessible to people with visual, auditory, motor, and cognitive disabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
            <p className="leading-relaxed mb-4">
              We have implemented the following features to improve accessibility:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clear and hierarchical heading structure for screen reader navigation</li>
              <li>Descriptive alternative text for all product images</li>
              <li>Adequate color contrast between text and background</li>
              <li>Full keyboard navigation across all pages</li>
              <li>Forms with clear labels and descriptive error messages</li>
              <li>Readable and responsive font sizes</li>
              <li>Descriptive links that make sense out of context</li>
              <li>Support for zoom up to 200% without loss of functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Assistive Technologies</h2>
            <p className="leading-relaxed">
              Our website is compatible with major assistive technologies, including screen readers (JAWS, NVDA, VoiceOver), keyboard navigation, voice recognition software, and screen magnifiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Known Limitations</h2>
            <p className="leading-relaxed mb-4">
              Despite our ongoing efforts, some areas of the website may still present accessibility challenges:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Some videos may not have complete captions (we are working to add them)</li>
              <li>Embedded third-party content may not fully meet accessibility standards</li>
              <li>Some historical images may have limited descriptions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Continuous Improvement</h2>
            <p className="leading-relaxed">
              Accessibility is an ongoing process. We conduct regular accessibility audits and implement improvements based on user feedback and the latest best practices. We are constantly working to enhance the experience for all our visitors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Feedback and Assistance</h2>
            <p className="leading-relaxed mb-4">
              We value your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
            </p>
            <ul className="list-none space-y-2 ml-4">
              <li><strong>Email:</strong> contact@ileala.ae</li>
              <li><strong>Subject:</strong> "Website Accessibility"</li>
            </ul>
            <p className="leading-relaxed mt-4">
              We will respond to all accessibility-related requests within 5 business days. If you need assistance accessing information on our website or placing an order, our team will be happy to help you by phone or email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Alternative Formats</h2>
            <p className="leading-relaxed">
              If you need information from our website in an alternative format (such as large print, audio, or Braille), please contact us and we will do our best to accommodate your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Evaluation and Testing</h2>
            <p className="leading-relaxed">
              This accessibility statement was created and reviewed based on internal testing, automated accessibility checking tools, and user feedback. Last evaluation conducted on {new Date().toLocaleDateString('en-US')}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
