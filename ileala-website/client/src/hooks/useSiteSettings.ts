import { trpc } from '@/lib/trpc';

// Default values for site settings (used as fallback)
const DEFAULT_SETTINGS = {
  'contact-phone': '+971 50 174 2090',
  'contact-email': 'contact@ileala.ae',
  'contact-address': 'Dubai, United Arab Emirates',
  'social-instagram': 'https://instagram.com/ileala.ae',
  'social-facebook': 'https://www.facebook.com/share/17f63HzTAk/?mibextid=wwXIfr',
  'site-name': 'ILE ALA',
  'site-url': 'www.ileala.ae',
};

export type SiteSettingsKey = keyof typeof DEFAULT_SETTINGS;

/**
 * Hook to fetch site settings from the database.
 * Returns settings with fallback to default values.
 */
export function useSiteSettings() {
  const { data: settings, isLoading, error } = trpc.settings.public.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  /**
   * Get a setting value by key, with fallback to default
   */
  const getSetting = (key: SiteSettingsKey): string => {
    if (settings && settings[key]) {
      return settings[key];
    }
    return DEFAULT_SETTINGS[key] || '';
  };

  /**
   * Get all settings as an object
   */
  const allSettings = {
    phone: getSetting('contact-phone'),
    email: getSetting('contact-email'),
    address: getSetting('contact-address'),
    instagram: getSetting('social-instagram'),
    facebook: getSetting('social-facebook'),
    siteName: getSetting('site-name'),
    siteUrl: getSetting('site-url'),
  };

  return {
    settings: allSettings,
    getSetting,
    isLoading,
    error,
    raw: settings,
  };
}

export default useSiteSettings;
