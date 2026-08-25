import { useLanguage } from "../context/LanguageContext";

const LanguageToggle = ({ className = "", compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`lang-switcher-wrap ${compact ? "compact" : ""} ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        className={`lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        title="Switch to English"
        aria-pressed={language === "en"}
      >
        <span className="lang-flag" aria-hidden="true">🇬🇧</span>
        <span className="lang-name">{compact ? "EN" : "English"}</span>
      </button>

      <button
        type="button"
        className={`lang-btn ${language === "si" ? "active" : ""}`}
        onClick={() => setLanguage("si")}
        title="සිංහල භාෂාවට මාරු වන්න"
        aria-pressed={language === "si"}
      >
        <span className="lang-flag" aria-hidden="true">🇱🇰</span>
        <span className="lang-name">{compact ? "සිං" : "සිංහල"}</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
