import { createContext, useContext, useEffect, useState } from "react";
import en from "../translations/en";
import si from "../translations/si";

const translations = { en, si };

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("farmtrack_lang");
    return saved === "si" ? "si" : "en";
  });

  const setLanguage = (lang) => {
    const valid = lang === "si" ? "si" : "en";
    setLanguageState(valid);
    localStorage.setItem("farmtrack_lang", valid);
    document.documentElement.lang = valid;
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "si" : "en");
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath, fallback = "") => {
    if (!keyPath) return fallback;

    const keys = keyPath.split(".");
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && current !== null && typeof current === "string") {
      return current;
    }

    // Fallback to English dictionary if key is missing in Sinhala
    let englishFallback = translations.en;
    for (const key of keys) {
      if (englishFallback && typeof englishFallback === "object" && key in englishFallback) {
        englishFallback = englishFallback[key];
      } else {
        englishFallback = undefined;
        break;
      }
    }

    if (englishFallback !== undefined && englishFallback !== null && typeof englishFallback === "string") {
      return englishFallback;
    }

    return fallback || keyPath;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
