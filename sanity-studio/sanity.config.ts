import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool, defineLocations} from 'sanity/presentation'
import {schemaTypes} from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'anyz9zel'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ileala.ae')

const documentLocations = defineLocations({
  product: {
    select: {
      slug: 'slug.current',
      name: 'name',
    },
    resolve: ({slug, name}) => {
      if (!slug) {
        return {
          message: 'Defina o slug para habilitar o preview visual.',
          tone: 'caution',
        }
      }

      return {
        locations: [
          {
            title: name ? `Produto: ${name}` : 'Página do produto',
            href: `/sanity-products/${slug}`,
          },
          {
            title: 'Página de produtos',
            href: '/sanity-products',
          },
        ],
      }
    },
  },
})

export default defineConfig({
  name: 'default',
  title: 'ILE ALA',
  projectId,
  dataset,

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: previewOrigin,
      resolve: {
        locations: documentLocations,
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
