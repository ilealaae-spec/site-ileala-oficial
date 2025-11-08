import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const { language } = useLanguage();

  const faqsEN = [
    {
      category: "Products",
      questions: [
        {
          q: "What materials are used in ILE ALA products?",
          a: "Our products are crafted from premium materials including high-quality textiles, natural fibers, and carefully selected fabrics. Each piece is handcrafted using traditional techniques from various cultures including Indian, Japanese, Thai, and Moroccan artisanship."
        },
        {
          q: "Are your products handmade?",
          a: "Yes, all ILE ALA products are handcrafted by skilled artisans. This means each piece is unique and may have slight variations in color, pattern, and texture, which adds to their authentic charm and character."
        },
        {
          q: "Can I customize products?",
          a: "We offer customization options for certain products. Please contact us at info@ileala.ae with your specific requirements, and our team will be happy to discuss possibilities and pricing."
        }
      ]
    },
    {
      category: "Orders & Payment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. All payments are processed securely through encrypted payment gateways."
        },
        {
          q: "Is VAT included in the prices?",
          a: "Yes, all prices displayed on our website include 5% VAT as required by UAE law."
        },
        {
          q: "Can I cancel or modify my order?",
          a: "Orders can be cancelled or modified within 24 hours of placement. After this period, as production may have already begun, cancellations may not be possible. Please contact us immediately if you need to make changes."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          q: "How long does delivery take?",
          a: "For in-stock items, delivery within the UAE typically takes 2-3 business days. Custom orders require up to 45 days for production and delivery. International shipping times vary by destination."
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship worldwide. International shipping costs and delivery times vary depending on the destination. Please contact us for specific shipping quotes to your location."
        },
        {
          q: "How can I track my order?",
          a: "Once your order ships, you will receive a tracking number via email. You can use this number to track your package through the courier's website."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      questions: [
        {
          q: "What is your return policy?",
          a: "Due to the handcrafted and personalized nature of our products, we accept returns only in case of manufacturing defects or shipping errors. Returns must be requested within 7 days of receipt."
        },
        {
          q: "Can I exchange a product?",
          a: "Exchanges are possible for defective items or if you received the wrong product. Please contact us within 7 days of receipt to arrange an exchange."
        },
        {
          q: "How do I initiate a return?",
          a: "Contact our customer service team at info@ileala.ae with your order number, photos of the item, and a description of the issue. We will guide you through the return process."
        }
      ]
    },
    {
      category: "Care & Maintenance",
      questions: [
        {
          q: "How do I care for textile products?",
          a: "Hand wash in cold water with mild detergent. Avoid bleach and harsh chemicals. Lay flat to dry or hang in shade. Iron on low heat while slightly damp for best results."
        },
        {
          q: "How should I store my ILE ALA products?",
          a: "Store in a cool, dry place away from direct sunlight. Use acid-free tissue paper between folded items. Avoid plastic bags to allow fabrics to breathe."
        }
      ]
    }
  ];

  const faqsPT = [
    {
      category: "Produtos",
      questions: [
        {
          q: "Quais materiais são usados nos produtos ILE ALA?",
          a: "Nossos produtos são confeccionados com materiais premium incluindo têxteis de alta qualidade, fibras naturais e tecidos cuidadosamente selecionados. Cada peça é artesanal usando técnicas tradicionais de várias culturas incluindo artesanato indiano, japonês, tailandês e marroquino."
        },
        {
          q: "Seus produtos são feitos à mão?",
          a: "Sim, todos os produtos ILE ALA são artesanais feitos por artesãos qualificados. Isso significa que cada peça é única e pode ter pequenas variações em cor, padrão e textura, o que adiciona ao seu charme e caráter autênticos."
        },
        {
          q: "Posso personalizar produtos?",
          a: "Oferecemos opções de personalização para certos produtos. Entre em contato conosco em info@ileala.ae com seus requisitos específicos, e nossa equipe terá prazer em discutir possibilidades e preços."
        }
      ]
    },
    {
      category: "Pedidos e Pagamento",
      questions: [
        {
          q: "Quais métodos de pagamento vocês aceitam?",
          a: "Aceitamos os principais cartões de crédito (Visa, Mastercard, American Express), cartões de débito e transferências bancárias. Todos os pagamentos são processados de forma segura através de gateways de pagamento criptografados."
        },
        {
          q: "O VAT está incluído nos preços?",
          a: "Sim, todos os preços exibidos em nosso site incluem 5% de VAT conforme exigido pela lei dos EAU."
        },
        {
          q: "Posso cancelar ou modificar meu pedido?",
          a: "Pedidos podem ser cancelados ou modificados dentro de 24 horas após a realização. Após esse período, como a produção pode já ter começado, cancelamentos podem não ser possíveis. Entre em contato conosco imediatamente se precisar fazer alterações."
        }
      ]
    },
    {
      category: "Envio e Entrega",
      questions: [
        {
          q: "Quanto tempo leva a entrega?",
          a: "Para itens em estoque, a entrega nos EAU normalmente leva 2-3 dias úteis. Pedidos personalizados requerem até 45 dias para produção e entrega. Os prazos de envio internacional variam de acordo com o destino."
        },
        {
          q: "Vocês fazem envios internacionais?",
          a: "Sim, enviamos para todo o mundo. Os custos e prazos de envio internacional variam dependendo do destino. Entre em contato conosco para cotações específicas de envio para sua localização."
        },
        {
          q: "Como posso rastrear meu pedido?",
          a: "Assim que seu pedido for enviado, você receberá um número de rastreamento por e-mail. Você pode usar este número para rastrear seu pacote através do site da transportadora."
        }
      ]
    },
    {
      category: "Devoluções e Trocas",
      questions: [
        {
          q: "Qual é a política de devolução?",
          a: "Devido à natureza artesanal e personalizada de nossos produtos, aceitamos devoluções apenas em caso de defeitos de fabricação ou erros de envio. As devoluções devem ser solicitadas dentro de 7 dias após o recebimento."
        },
        {
          q: "Posso trocar um produto?",
          a: "Trocas são possíveis para itens defeituosos ou se você recebeu o produto errado. Entre em contato conosco dentro de 7 dias após o recebimento para organizar uma troca."
        },
        {
          q: "Como inicio uma devolução?",
          a: "Entre em contato com nossa equipe de atendimento ao cliente em info@ileala.ae com seu número de pedido, fotos do item e uma descrição do problema. Nós o guiaremos através do processo de devolução."
        }
      ]
    },
    {
      category: "Cuidados e Manutenção",
      questions: [
        {
          q: "Como cuido dos produtos têxteis?",
          a: "Lave à mão em água fria com detergente suave. Evite alvejante e produtos químicos agressivos. Seque na horizontal ou pendure à sombra. Passe em temperatura baixa enquanto levemente úmido para melhores resultados."
        },
        {
          q: "Como devo armazenar meus produtos ILE ALA?",
          a: "Guarde em local fresco e seco, longe da luz solar direta. Use papel de seda livre de ácido entre itens dobrados. Evite sacos plásticos para permitir que os tecidos respirem."
        }
      ]
    }
  ];

  const faqs = language === 'pt' ? faqsPT : faqsEN;

  return (
    <div className="w-full py-20">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            {language === 'en' ? 'Frequently Asked Questions' : 'Perguntas Frequentes'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'en' 
              ? 'Find answers to common questions about ILE ALA products and services'
              : 'Encontre respostas para perguntas comuns sobre produtos e serviços ILE ALA'}
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-semibold mb-4 text-primary">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, qIndex) => (
                  <AccordionItem key={qIndex} value={`item-${catIndex}-${qIndex}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">
            {language === 'en' ? "Didn't find what you're looking for?" : 'Não encontrou o que procura?'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'en' 
              ? 'Contact our customer service team for personalized assistance'
              : 'Entre em contato com nossa equipe de atendimento para assistência personalizada'}
          </p>
          <p className="font-medium">info@ileala.ae</p>
        </div>
      </div>
    </div>
  );
}
