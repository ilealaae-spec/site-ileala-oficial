import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';

export default function ProductCare() {
  const { language } = useLanguage();

  if (language === 'pt') {
    return (
      <div className="w-full py-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Cuidados com o Produto</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Preserve a beleza e longevidade das suas peças ILE ALA com nossos guias de cuidados detalhados
          </p>

          <div className="space-y-8">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Têxteis e Tecidos</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Lavagem</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Lave à mão em água fria (máximo 30°C)</li>
                        <li>Use detergente neutro e suave</li>
                        <li>Evite alvejante, amaciante e produtos químicos agressivos</li>
                        <li>Não torça ou esfregue com força</li>
                        <li>Enxágue completamente em água fria</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Secagem</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Seque na horizontal sobre uma superfície limpa</li>
                        <li>Ou pendure à sombra em local ventilado</li>
                        <li>Evite luz solar direta que pode desbotar as cores</li>
                        <li>Nunca use secadora automática</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Passagem</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Passe em temperatura baixa a média (máximo 150°C)</li>
                        <li>Passe enquanto o tecido ainda está levemente úmido</li>
                        <li>Use um pano de proteção para tecidos delicados</li>
                        <li>Para bordados, passe pelo lado avesso</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Peças Bordadas</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Lavagem Especial</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Lavagem delicada à mão ou limpeza a seco apenas</li>
                        <li>Use água fria e detergente muito suave</li>
                        <li>Nunca torça, esfregue ou retorça</li>
                        <li>Pressione suavemente para remover o excesso de água</li>
                        <li>Considere limpeza profissional para peças valiosas</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Passagem de Bordados</h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Sempre passe pelo lado avesso</li>
                        <li>Use ferro a vapor em temperatura baixa</li>
                        <li>Coloque um pano de proteção entre o ferro e o bordado</li>
                        <li>Nunca pressione diretamente sobre o bordado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Armazenamento</h2>
                  
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Guarde em local fresco, seco e bem ventilado</li>
                    <li>Proteja da luz solar direta para evitar desbotamento</li>
                    <li>Use papel de seda livre de ácido entre itens dobrados</li>
                    <li>Evite sacos plásticos - prefira tecidos respiráveis</li>
                    <li>Mantenha longe de fontes de calor e umidade</li>
                    <li>Verifique periodicamente por sinais de mofo ou danos</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-4">Dicas Gerais</h2>
                  
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Trate manchas imediatamente absorvendo (não esfregando) suavemente</li>
                    <li>Teste qualquer método de limpeza em uma pequena área escondida primeiro</li>
                    <li>Leia sempre as etiquetas de cuidados específicas de cada produto</li>
                    <li>Para peças valiosas ou antigas, considere limpeza profissional</li>
                    <li>Evite produtos químicos agressivos e solventes</li>
                    <li>Mantenha longe de animais de estimação e crianças pequenas</li>
                    <li>Em caso de dúvida, entre em contato conosco para orientação</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Precisa de Mais Orientação?</h3>
              <p className="text-muted-foreground mb-4">
                Nossa equipe está pronta para ajudar com dúvidas específicas sobre cuidados
              </p>
              <p className="font-medium">info@ileala.ae</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Product Care</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Preserve the beauty and longevity of your ILE ALA pieces with our detailed care guides
        </p>

        <div className="space-y-8">
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">Textiles & Linens</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Washing</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Hand wash in cold water (maximum 30°C)</li>
                      <li>Use mild, gentle detergent</li>
                      <li>Avoid bleach, fabric softener, and harsh chemicals</li>
                      <li>Do not wring or scrub vigorously</li>
                      <li>Rinse thoroughly in cold water</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Drying</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Lay flat to dry on a clean surface</li>
                      <li>Or hang in shade in a well-ventilated area</li>
                      <li>Avoid direct sunlight which can fade colors</li>
                      <li>Never use automatic dryer</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ironing</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Iron on low to medium heat (maximum 150°C)</li>
                      <li>Iron while fabric is still slightly damp</li>
                      <li>Use a pressing cloth for delicate fabrics</li>
                      <li>For embroidery, iron on reverse side</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">Embroidered Pieces</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Special Washing</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Delicate hand wash or dry clean only</li>
                      <li>Use cold water and very mild detergent</li>
                      <li>Never wring, scrub, or twist</li>
                      <li>Press gently to remove excess water</li>
                      <li>Consider professional cleaning for valuable pieces</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ironing Embroidery</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Always iron on reverse side</li>
                      <li>Use steam iron on low temperature</li>
                      <li>Place a pressing cloth between iron and embroidery</li>
                      <li>Never press directly on embroidery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">Storage</h2>
                
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Store in cool, dry, well-ventilated place</li>
                  <li>Protect from direct sunlight to prevent fading</li>
                  <li>Use acid-free tissue paper between folded items</li>
                  <li>Avoid plastic bags - prefer breathable fabrics</li>
                  <li>Keep away from heat sources and moisture</li>
                  <li>Check periodically for signs of mold or damage</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-4">General Tips</h2>
                
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Treat stains immediately by blotting (not rubbing) gently</li>
                  <li>Test any cleaning method on a small hidden area first</li>
                  <li>Always read specific care labels on each product</li>
                  <li>For valuable or antique pieces, consider professional cleaning</li>
                  <li>Avoid harsh chemicals and solvents</li>
                  <li>Keep away from pets and small children</li>
                  <li>When in doubt, contact us for guidance</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Need More Guidance?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is ready to help with specific care questions
            </p>
            <p className="font-medium">info@ileala.ae</p>
          </div>
        </div>
      </div>
    </div>
  );
}
