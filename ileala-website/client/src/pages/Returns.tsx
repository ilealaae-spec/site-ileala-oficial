import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function Returns() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Devoluções e Trocas</h1>
          
          <div className="space-y-8 text-foreground">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Política de Devolução</h3>
                  <p className="text-muted-foreground">
                    Devido à natureza artesanal e personalizada de nossos produtos, aceitamos devoluções apenas em caso de defeito de fabricação ou erro no envio. As devoluções devem ser solicitadas dentro de 7 dias após o recebimento.
                  </p>
                </div>
              </div>
            </Card>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Quando Você Pode Devolver</h2>
              
              <div className="space-y-4">
                <Card className="p-6 border-green-200 bg-green-50/50">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-green-900">Devoluções Aceitas</h3>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Produto com defeito de fabricação</li>
                        <li>• Item errado foi enviado</li>
                        <li>• Produto danificado durante o transporte</li>
                        <li>• Produto significativamente diferente da descrição</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-red-200 bg-red-50/50">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-red-900">Devoluções Não Aceitas</h3>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li>• Mudança de opinião ou preferência</li>
                        <li>• Produtos personalizados sem defeito</li>
                        <li>• Itens usados ou lavados</li>
                        <li>• Produtos sem embalagem original</li>
                        <li>• Solicitações após 7 dias do recebimento</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Solicitar uma Devolução</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Entre em Contato</h4>
                    <p className="text-sm text-muted-foreground">
                      Envie um e-mail para contact@ileala.ae dentro de 7 dias após o recebimento com seu número de pedido e descrição do problema.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Forneça Evidências</h4>
                    <p className="text-sm text-muted-foreground">
                      Inclua fotos claras do produto mostrando o defeito ou dano. Mantenha todas as embalagens originais.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Aguarde Aprovação</h4>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe revisará sua solicitação e responderá dentro de 48 horas com instruções.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Envie o Produto</h4>
                    <p className="text-sm text-muted-foreground">
                      Se aprovado, enviaremos instruções de devolução. Embale o produto com segurança na embalagem original.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Receba Reembolso ou Troca</h4>
                    <p className="text-sm text-muted-foreground">
                      Após recebermos e inspecionarmos o produto, processaremos o reembolso ou enviaremos a substituição.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Trocas</h2>
              <p className="leading-relaxed mb-4">
                Trocas são possíveis para:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                <li>Produtos com defeito de fabricação</li>
                <li>Item errado foi enviado</li>
                <li>Tamanho ou cor incorretos (se aplicável)</li>
              </ul>
              <p className="leading-relaxed">
                Entre em contato conosco dentro de 7 dias após o recebimento para solicitar uma troca. A disponibilidade de produtos para troca está sujeita ao estoque.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Reembolsos</h2>
              <p className="leading-relaxed mb-4">
                Após a aprovação da devolução:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                <li>Reembolsos são processados dentro de 5-7 dias úteis após recebermos o produto</li>
                <li>O valor será creditado no método de pagamento original</li>
                <li>Custos de envio não são reembolsáveis, exceto em caso de erro nosso</li>
                <li>Você receberá um e-mail de confirmação quando o reembolso for processado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Custos de Envio para Devolução</h2>
              <Card className="p-6">
                <p className="mb-4">
                  <strong>Defeito de fabricação ou erro nosso:</strong> Cobriremos todos os custos de envio de devolução.
                </p>
                <p>
                  <strong>Outros casos:</strong> O cliente é responsável pelos custos de envio de devolução.
                </p>
              </Card>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Quanto tempo leva para processar um reembolso?</h4>
                  <p className="text-muted-foreground text-sm">
                    Processamos reembolsos dentro de 5-7 dias úteis após recebermos e inspecionarmos o produto devolvido. O tempo para o valor aparecer em sua conta pode variar dependendo do seu banco.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Posso devolver um produto personalizado?</h4>
                  <p className="text-muted-foreground text-sm">
                    Produtos personalizados só podem ser devolvidos se houver defeito de fabricação ou erro no pedido.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">E se o produto foi danificado durante o transporte?</h4>
                  <p className="text-muted-foreground text-sm">
                    Entre em contato conosco imediatamente com fotos do dano e da embalagem. Trabalharemos com a transportadora e providenciaremos uma substituição ou reembolso.
                  </p>
                </div>
              </div>
            </section>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-semibold mb-4">Precisa de Ajuda?</h3>
              <p className="mb-4">Entre em contato com nossa equipe de atendimento ao cliente:</p>
              <p><strong>E-mail:</strong> contact@ileala.ae</p>
              <p><strong>Assunto:</strong> "Devolução/Troca - [Número do Pedido]"</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Returns & Exchanges</h1>
        
        <div className="space-y-8 text-foreground">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Return Policy</h3>
                <p className="text-muted-foreground">
                  Due to the handcrafted and personalized nature of our products, we accept returns only in case of manufacturing defect or shipping error. Returns must be requested within 7 days of receipt.
                </p>
              </div>
            </div>
          </Card>

          <section>
            <h2 className="text-2xl font-semibold mb-4">When You Can Return</h2>
            
            <div className="space-y-4">
              <Card className="p-6 border-green-200 bg-green-50/50">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-900">Returns Accepted</h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Product with manufacturing defect</li>
                      <li>• Wrong item was shipped</li>
                      <li>• Product damaged during shipping</li>
                      <li>• Product significantly different from description</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-red-200 bg-red-50/50">
                <div className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900">Returns Not Accepted</h3>
                    <ul className="space-y-2 text-sm text-red-800">
                      <li>• Change of mind or preference</li>
                      <li>• Personalized products without defect</li>
                      <li>• Used or washed items</li>
                      <li>• Products without original packaging</li>
                      <li>• Requests after 7 days of receipt</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Request a Return</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Contact Us</h4>
                  <p className="text-sm text-muted-foreground">
                    Email contact@ileala.ae within 7 days of receipt with your order number and description of the issue.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Provide Evidence</h4>
                  <p className="text-sm text-muted-foreground">
                    Include clear photos of the product showing the defect or damage. Keep all original packaging.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Wait for Approval</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your request and respond within 48 hours with instructions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ship the Product</h4>
                  <p className="text-sm text-muted-foreground">
                    If approved, we'll send return instructions. Pack the product securely in original packaging.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Receive Refund or Exchange</h4>
                  <p className="text-sm text-muted-foreground">
                    After we receive and inspect the product, we'll process the refund or send the replacement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
            <p className="leading-relaxed mb-4">
              Exchanges are possible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
              <li>Products with manufacturing defects</li>
              <li>Wrong item was shipped</li>
              <li>Incorrect size or color (if applicable)</li>
            </ul>
            <p className="leading-relaxed">
              Contact us within 7 days of receipt to request an exchange. Product availability for exchange is subject to stock.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Refunds</h2>
            <p className="leading-relaxed mb-4">
              After return approval:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
              <li>Refunds are processed within 5-7 business days after we receive the product</li>
              <li>Amount will be credited to the original payment method</li>
              <li>Shipping costs are non-refundable except in case of our error</li>
              <li>You will receive a confirmation email when the refund is processed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Return Shipping Costs</h2>
            <Card className="p-6">
              <p className="mb-4">
                <strong>Manufacturing defect or our error:</strong> We will cover all return shipping costs.
              </p>
              <p>
                <strong>Other cases:</strong> Customer is responsible for return shipping costs.
              </p>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How long does it take to process a refund?</h4>
                <p className="text-muted-foreground text-sm">
                  We process refunds within 5-7 business days after receiving and inspecting the returned product. The time for the amount to appear in your account may vary depending on your bank.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I return a personalized product?</h4>
                <p className="text-muted-foreground text-sm">
                  Personalized products can only be returned if there is a manufacturing defect or order error.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What if the product was damaged during shipping?</h4>
                <p className="text-muted-foreground text-sm">
                  Contact us immediately with photos of the damage and packaging. We will work with the carrier and provide a replacement or refund.
                </p>
              </div>
            </div>
          </section>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <p className="mb-4">Contact our customer service team:</p>
            <p><strong>Email:</strong> contact@ileala.ae</p>
            <p><strong>Subject:</strong> "Return/Exchange - [Order Number]"</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
