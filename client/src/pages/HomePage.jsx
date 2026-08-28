import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

import heroImage from "../../img_utils/main hero.jpg";
import flockImage from "../../img_utils/flock management.jpg";
import inventoryImage from "../../img_utils/inventory mgmt.jpg";
import productionImage from "../../img_utils/production.jpg";
import financeImage from "../../img_utils/Finance and analytics.jpg";
import healthImage from "../../img_utils/5. Veterinary  vaccination.jpg";
import closingImage from "../../img_utils/9. FarmTrack branded poster _main _hero.jpg";

const HomePage = () => {
  const { t } = useLanguage();

  const services = [
    {
      number: t("home.service1Number", "01"),
      title: t("home.service1Title", "Flock management"),
      text: t(
        "home.service1Text",
        "Keep every batch, population change, mortality record, and flock status in view."
      ),
      image: flockImage,
    },
    {
      number: t("home.service2Number", "02"),
      title: t("home.service2Title", "Feed & inventory"),
      text: t(
        "home.service2Text",
        "Know what is on hand, what is running low, and how supplies move through your farm."
      ),
      image: inventoryImage,
    },
    {
      number: t("home.service3Number", "03"),
      title: t("home.service3Title", "Production & health"),
      text: t(
        "home.service3Text",
        "Connect egg production, weights, vaccinations, and health incidents to the flock they belong to."
      ),
      image: productionImage,
    },
    {
      number: t("home.service4Number", "04"),
      title: t("home.service4Title", "Finance & analytics"),
      text: t(
        "home.service4Text",
        "Bring sales, expenses, profit, and farm performance into one clear operational picture."
      ),
      image: financeImage,
    },
  ];

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="home-logo" to="/" aria-label="FarmTrack home">
          <span className="logo-mark" />
          FarmTrack
        </Link>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#about">{t("home.about", "About us")}</a>
          <a href="#services">{t("home.services", "Services")}</a>
          <a href="#contact">{t("home.contact", "Contact us")}</a>
        </nav>
        <div className="home-auth-links">
          <LanguageToggle compact />
          <Link to="/login">{t("nav.logIn", "Log in")}</Link>
          <Link className="home-header-cta" to="/register">
            {t("nav.getStarted", "Get started")}
          </Link>
        </div>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div
          className="hero-image"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div className="hero-shade" />
        <div className="hero-content reveal-up">
          <p className="home-kicker">
            {t("home.kicker", "The connected farm record")}
          </p>
          <h1 id="home-title">
            {t("home.titleMain", "Run your farm with")}{" "}
            <em>{t("home.titleEm", "clarity.")}</em>
          </h1>
          <p className="hero-copy">
            {t(
              "home.heroCopy",
              "FarmTrack turns daily chicken farm operations into one living picture, so better decisions are always close at hand."
            )}
          </p>
          <div className="hero-actions">
            <Link className="solid-button" to="/register">
              {t("home.startTrackingToday", "Start tracking today")}{" "}
              <span>→</span>
            </Link>
            <a className="quiet-link" href="#services">
              {t("home.exploreTheSystem", "Explore the system")} <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-caption">
          {t("home.heroCaption", "Flocks / Inventory / Health / Performance")}
        </div>
        <div className="scroll-cue" aria-hidden="true">
          <span /> {t("home.scrollToExplore", "Scroll to explore")}
        </div>
      </section>

      <section className="home-intro" id="about">
        <div className="section-label reveal-up">
          {t("home.whySection", "01 / Why FarmTrack")}
        </div>
        <div className="intro-grid">
          <h2 className="reveal-up">
            {t("home.whyTitleMain", "A better record of")}{" "}
            <em>{t("home.whyTitleEm", "every layer")}</em>{" "}
            {t("home.whyTitleEnd", "of your operation.")}
          </h2>
          <div className="intro-copy reveal-up">
            <p>
              {t(
                "home.whyText1",
                "FarmTrack replaces scattered notebooks and disconnected spreadsheets with reliable digital records built for the rhythm of a working poultry farm."
              )}
            </p>
            <p>
              {t(
                "home.whyText2",
                "From the first chick to the final sale, your team can see the detail, patterns, and next action that keep the farm moving."
              )}
            </p>
          </div>
        </div>
        <div className="intro-stats">
          <div>
            <strong>{t("home.stat1", "01")}</strong>
            <span>{t("home.stat1Label", "Connected workspace")}</span>
          </div>
          <div>
            <strong>{t("home.stat2", "04")}</strong>
            <span>{t("home.stat2Label", "Core farm areas")}</span>
          </div>
          <div>
            <strong>{t("home.stat3", "∞")}</strong>
            <span>{t("home.stat3Label", "Stories in every record")}</span>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="services-heading reveal-up">
          <div className="section-label">
            {t("home.servicesSection", "02 / What it does")}
          </div>
          <h2>
            {t("home.servicesTitleMain", "Everything your farm")}
            <br />
            <em>{t("home.servicesTitleEm", "needs to know.")}</em>
          </h2>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-card reveal-up" key={service.number}>
              <div
                className="service-image"
                style={{ backgroundImage: `url("${service.image}")` }}
              />
              <div className="service-content">
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <span className="service-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-story">
        <div
          className="story-image"
          style={{ backgroundImage: `url("${healthImage}")` }}
        />
        <div className="story-content reveal-up">
          <p className="section-label">
            {t("home.storySection", "03 / Make informed moves")}
          </p>
          <h2>
            {t("home.storyTitleMain", "See the signal")}
            <br />
            {t("home.storyTitleMid", "inside the")}{" "}
            <em>{t("home.storyTitleEm", "routine.")}</em>
          </h2>
          <p>
            {t(
              "home.storyText",
              "Good farm management is built from small observations. FarmTrack makes those observations easy to capture and meaningful to compare."
            )}
          </p>
          <Link className="outline-button" to="/register">
            {t("home.buildWorkspace", "Build your farm workspace")} <span>→</span>
          </Link>
        </div>
      </section>

      <section className="home-contact" id="contact">
        <div
          className="contact-panel"
          style={{ backgroundImage: `url("${closingImage}")` }}
        >
          <div className="contact-overlay" />
          <div className="contact-content reveal-up">
            <p className="section-label">
              {t("home.contactSection", "04 / Start here")}
            </p>
            <h2>
              {t("home.contactTitleMain", "Your farm has a story.")}
              <br />
              <em>{t("home.contactTitleEm", "Make it count.")}</em>
            </h2>
            <p>
              {t(
                "home.contactText",
                "Bring your flock, team, and records into focus."
              )}
            </p>
            <Link className="solid-button" to="/register">
              {t("home.createAccount", "Create your account")} <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="egotech-footer-intro">
          <p className="footer-eyebrow">EgoTECHWORLD PVT LTD</p>
          <h2>{t("home.egotechTitle", "What EgoTECH Does")}</h2>
          <p>
            {t(
              "home.egotechIntro",
              "From software development to education — we cover the full spectrum of IT."
            )}
          </p>
        </div>

        <div className="egotech-services">
          <article>
            <span className="egotech-icon" aria-hidden="true">💻</span>
            <h3>{t("home.egotechSoftwareTitle", "Custom Software")}</h3>
            <p>
              {t(
                "home.egotechSoftwareText",
                "We design and build tailored software solutions — from POS systems and ERP tools to web platforms and mobile apps — built specifically for your business needs."
              )}
            </p>
            <a href="https://www.egotechworld.com/about.php">Learn more <span aria-hidden="true">↗</span></a>
          </article>
          <article>
            <span className="egotech-icon" aria-hidden="true">🎓</span>
            <h3>{t("home.egotechCoursesTitle", "IT Courses & Training")}</h3>
            <p>
              {t(
                "home.egotechCoursesText",
                "EgoTECH offers 20+ free and paid online IT courses covering programming, web development, AI, and career skills — for students and professionals across Sri Lanka."
              )}
            </p>
          </article>
          <article>
            <span className="egotech-icon" aria-hidden="true">💼</span>
            <h3>{t("home.egotechJobsTitle", "IT Job Board")}</h3>
            <p>
              {t(
                "home.egotechJobsText",
                "We run one of Sri Lanka's most active IT job boards — connecting tech talent with employers locally and internationally."
              )}
            </p>
            <a href="https://egotechworld.com/jobs.php">Visit job board <span aria-hidden="true">↗</span></a>
          </article>
          <article>
            <span className="egotech-icon" aria-hidden="true">🛠️</span>
            <h3>{t("home.egotechServicesTitle", "IT Services")}</h3>
            <p>
              {t(
                "home.egotechServicesText",
                "We provide website hosting consultation, domain setup, software debugging, database design, and technical support for businesses and individual developers."
              )}
            </p>
          </article>
        </div>

        <div className="egotech-contact">
          <div>
            <p className="footer-eyebrow">Get in touch</p>
            <h2>{t("home.egotechContactTitle", "Have a project in mind?")}</h2>
            <p>Reach out to learn more about our software and courses.</p>
          </div>
          <div className="egotech-contact-links">
            <a href="tel:+94743126123"><span aria-hidden="true">☎</span> +94 743 126 123</a>
            <a href="https://wa.me/94743126123"><span aria-hidden="true">◌</span> WhatsApp Us</a>
            <a href="mailto:contact@egotechworld.com"><span aria-hidden="true">✉</span> contact@egotechworld.com</a>
          </div>
        </div>

        <div className="home-footer-base">
          <div>
            <Link className="home-logo" to="/" aria-label="FarmTrack home">
              <span className="logo-mark" />
              FarmTrack
            </Link>
            <p>{t("home.footerTagline", "Every layer tells a story.")}</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#about">{t("home.about", "About")}</a>
            <a href="#services">{t("home.services", "Services")}</a>
            <a href="#contact">{t("home.contact", "Contact")}</a>
            <Link to="/login">{t("nav.logIn", "Log in")}</Link>
          </nav>
          <div className="egotech-legal">
            <p>EgoTECHWORLD PVT LTD — A registered software development company in Sri Lanka. ROC No: PV00352315.</p>
            <span><a href="https://www.egotechworld.com/privacy.php">Privacy Policy</a><a href="https://www.egotechworld.com/terms.php">Terms</a></span>
          </div>
          <span className="footer-copy">
            © {new Date().getFullYear()} {t("home.allRightsReserved", "FarmTrack. All rights reserved.")}
          </span>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;