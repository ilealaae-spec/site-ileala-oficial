import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Verificar se estamos em modo preview (visual editing)
const isPreview = typeof window !== 'undefined' && (
  window.location.search.includes('sanityPreview') ||
  window.location.search.includes('preview') ||
  import.meta.env.DEV ||
  import.meta.env.VITE_SANITY_VISUAL_EDITING === 'true'
);

// Configuração do cliente Sanity
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'anyz9zel',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: !isPreview, // Desabilitar CDN em modo preview para ver rascunhos
  apiVersion: '2024-11-10',
  token: import.meta.env.VITE_SANITY_TOKEN, // Token para operações autenticadas
  perspective: isPreview ? 'previewDrafts' : 'published', // Usar previewDrafts em modo preview
  stega: isPreview ? {
    enabled: true,
    studioUrl: import.meta.env.VITE_SANITY_STUDIO_URL || 'http://localhost:3333',
  } : undefined,
});

// Helper para gerar URLs de imagens otimizadas
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Tipos TypeScript para os produtos
export interface SanityProduct {
  _id: string;
  _type: 'product';
  name: string;
  slug: {
    current: string;
  };
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number;
  category: 'tableware' | 'home-decor' | 'bags-accessories' | 'sleepwear' | 'pet-collection';
  collection?: string;
  images: Array<{
    _key: string;
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  }>;
  mainImage: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  material?: string;
  dimensions?: string;
  colors?: string[];
  careInstructions?: string;
  weight?: number;
  sku?: string;
  inStock: boolean;
  stockQuantity?: number;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  seoTitle?: string;
  seoDescription?: string;
  _createdAt: string;
  _updatedAt: string;
}

// Função para buscar todos os produtos
export async function getAllProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && inStock == true] | order(_createdAt desc)`;
  return sanityClient.fetch(query);
}

// Função para buscar produtos por categoria
export async function getProductsByCategory(category: string): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && category == $category && inStock == true] | order(_createdAt desc)`;
  return sanityClient.fetch(query, { category });
}

// Função para buscar um produto por slug
export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  const query = `*[_type == "product" && slug.current == $slug][0]`;
  return sanityClient.fetch(query, { slug });
}

// Função para buscar produtos em destaque
export async function getFeaturedProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && featured == true && inStock == true] | order(_createdAt desc)[0...6]`;
  return sanityClient.fetch(query);
}

// Função para buscar produtos novos
export async function getNewProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && isNew == true && inStock == true] | order(_createdAt desc)[0...6]`;
  return sanityClient.fetch(query);
}

// Função para buscar produtos em promoção
export async function getSaleProducts(): Promise<SanityProduct[]> {
  const query = `*[_type == "product" && onSale == true && inStock == true] | order(_createdAt desc)`;
  return sanityClient.fetch(query);
}
