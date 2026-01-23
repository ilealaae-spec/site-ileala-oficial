import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get initial language from localStorage or default to 'en'
function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ileala-language');
    if (stored === 'en' || stored === 'pt') {
      return stored;
    }
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const t = getTranslation(language);

  // Persist language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ileala-language', lang);
    }
  };

  // Sync language on mount (for SSR compatibility)
  useEffect(() => {
    const stored = localStorage.getItem('ileala-language');
    if (stored === 'en' || stored === 'pt') {
      setLanguageState(stored);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
