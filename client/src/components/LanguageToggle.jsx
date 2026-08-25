import { useLanguage } from "../context/LanguageContext";

const UkFlagIcon = () => (
  <svg
    className="lang-flag-svg"
    viewBox="0 0 60 30"
    width="16"
    height="11"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const SriLankaFlagIcon = () => (
  <svg
    className="lang-flag-svg"
    viewBox="0 0 60 30"
    width="16"
    height="11"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#FFBE29" />
    <rect x="3" y="3" width="8" height="24" fill="#005A36" />
    <rect x="12" y="3" width="8" height="24" fill="#EB7E00" />
    <rect x="21" y="3" width="36" height="24" fill="#8D153A" />
    {/* Bo leaves in corners */}
    <circle cx="24" cy="6" r="1.3" fill="#FFBE29" />
    <circle cx="54" cy="6" r="1.3" fill="#FFBE29" />
    <circle cx="24" cy="24" r="1.3" fill="#FFBE29" />
    <circle cx="54" cy="24" r="1.3" fill="#FFBE29" />
    {/* Golden Lion */}
    <ellipse cx="38" cy="15" rx="6.5" ry="5" fill="#FFBE29" />
    <circle cx="44" cy="12" r="3.2" fill="#FFBE29" />
    <path d="M44 9 L49 6 L47 10 Z" fill="#FFBE29" />
    <circle cx="44.5" cy="11.5" r="0.8" fill="#8D153A" />
    <path d="M34 17 L31 23 M37 17 L36 23 M42 17 L44 23" stroke="#FFBE29" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M32 14 C30 11 31 7 34 6" stroke="#FFBE29" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const LanguageToggle = ({ className = "", compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`ft-lang-toggle ${compact ? "compact" : ""} ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        className={`ft-lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        title="Switch language to English"
        aria-pressed={language === "en"}
      >
        <span className="ft-lang-flag-box">
          <UkFlagIcon />
        </span>
        <span className="ft-lang-label">
          {compact ? "EN" : "English"}
        </span>
      </button>

      <button
        type="button"
        className={`ft-lang-btn ${language === "si" ? "active" : ""}`}
        onClick={() => setLanguage("si")}
        title="සිංහල භාෂාවට මාරු වන්න"
        aria-pressed={language === "si"}
      >
        <span className="ft-lang-flag-box">
          <SriLankaFlagIcon />
        </span>
        <span className="ft-lang-label ft-lang-label--si">
          {compact ? "සිංහල" : "සිංහල"}
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
