import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    // Informações Básicas
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief summary (max 160 characters)',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 10,
    }),
    
    // Preço
    defineField({
      name: 'price',
      title: 'Price (AED)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price (AED)',
      type: 'number',
      description: 'Leave empty if not on sale',
      validation: (Rule) => Rule.min(0),
    }),
    
    // Categoria e Coleção
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Tableware', value: 'tableware'},
          {title: 'Home & Décor', value: 'home-decor'},
          {title: 'Bags & Accessories', value: 'bags-accessories'},
          {title: 'Sleepwear', value: 'sleepwear'},
          {title: 'Pet Collection', value: 'pet-collection'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'string',
      description: 'e.g., Botanica, Clássica, Moderna',
    }),
    
    // Imagens
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Product Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
          ],
        },
      ],
      description: 'Additional product images (up to 10)',
      validation: (Rule) => Rule.max(10),
    }),
    
    // Especificações
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'e.g., 100% Linen, Egyptian Cotton',
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g., 150x200cm, 40x40cm',
    }),
    defineField({
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of available colors',
    }),
    defineField({
      name: 'careInstructions',
      title: 'Care Instructions',
      type: 'text',
      rows: 3,
      description: 'Washing and care instructions',
    }),
    defineField({
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      description: 'Product weight for shipping calculation',
      validation: (Rule) => Rule.min(0),
    }),
    
    // E-commerce
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit / Product Code',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      description: 'Number of items in stock',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'isNew',
      title: 'New Product',
      type: 'boolean',
      description: 'Show "New" badge',
      initialValue: false,
    }),
    defineField({
      name: 'onSale',
      title: 'On Sale',
      type: 'boolean',
      description: 'Show "Sale" badge',
      initialValue: false,
    }),
    
    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Title for search engines (max 60 characters)',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Description for search engines (max 160 characters)',
      validation: (Rule) => Rule.max(160),
    }),
  ],
  
  preview: {
    select: {
      title: 'name',
      media: 'mainImage',
      subtitle: 'category',
      price: 'price',
    },
    prepare(selection) {
      const {title, media, subtitle, price} = selection
      return {
        title: title,
        subtitle: `${subtitle} - AED ${price}`,
        media: media,
      }
    },
  },
})
