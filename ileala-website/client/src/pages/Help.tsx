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
