import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'admin_language';
const DEFAULT_LANGUAGE = 'pt';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;

    // Replace parameters like {count}, {current}, {total}, {letter}
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    });

    return text;
  };

  const switchLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const availableLanguages = Object.keys(translations);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: switchLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for play mode with specific language (not from localStorage)
export function usePlayLanguage(lang) {
  const t = (key, params = {}) => {
    const language = lang || DEFAULT_LANGUAGE;
    let text = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;

    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    });

    return text;
  };

  return { t, language: lang || DEFAULT_LANGUAGE };
}

export default LanguageContext;
