import {enableVisualEditing} from '@sanity/visual-editing'
import {useEffect} from 'react'

const envFlag = import.meta.env.VITE_SANITY_VISUAL_EDITING === 'true'
const shouldDefaultEnable = import.meta.env.DEV || envFlag

function shouldEnableVisualEditing() {
  if (!shouldDefaultEnable) {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.has('sanityPreview') || params.has('preview')
  }
  return true
}

export function SanityVisualEditingOverlay() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!shouldEnableVisualEditing()) {
      return
    }

    const disable = enableVisualEditing({
      history: {
        subscribe: (navigate) => {
          const handler = () => {
            navigate({
              type: 'push',
              url: `${window.location.pathname}${window.location.search}`,
            })
          }

          window.addEventListener('popstate', handler)
          return () => window.removeEventListener('popstate', handler)
        },
        update: (update) => {
          switch (update.type) {
            case 'push':
              window.history.pushState(null, '', update.url)
              break
            case 'replace':
              window.history.replaceState(null, '', update.url)
              break
            case 'pop':
              window.history.back()
              break
            default:
              break
          }
        },
      },
      zIndex: 1300,
    })

    return () => {
      disable?.()
    }
  }, [])

  return null
}

