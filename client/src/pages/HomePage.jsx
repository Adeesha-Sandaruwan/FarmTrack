import { Link } from "react-router-dom";

import heroImage from "../../img_utils/main hero.jpg";
import flockImage from "../../img_utils/flock management.jpg";
import inventoryImage from "../../img_utils/inventory mgmt.jpg";
import productionImage from "../../img_utils/production.jpg";
import financeImage from "../../img_utils/Finance and analytics.jpg";
import healthImage from "../../img_utils/5. Veterinary  vaccination.jpg";
import closingImage from "../../img_utils/9. FarmTrack branded poster _main _hero.jpg";

const services = [
  { number: "01", title: "Flock management", text: "Keep every batch, population change, mortality record, and flock status in view.", image: flockImage },
  { number: "02", title: "Feed & inventory", text: "Know what is on hand, what is running low, and how supplies move through your farm.", image: inventoryImage },
  { number: "03", title: "Production & health", text: "Connect egg production, weights, vaccinations, and health incidents to the flock they belong to.", image: productionImage },
  { number: "04", title: "Finance & analytics", text: "Bring sales, expenses, profit, and farm performance into one clear operational picture.", image: financeImage },
];

const HomePage = () => (
  <main className="home-page">
    <header className="home-header">
      <Link className="home-logo" to="/" aria-label="FarmTrack home"><span className="logo-mark" />FarmTrack</Link>
      <nav className="home-nav" aria-label="Main navigation">
        <a href="#about">About us</a><a href="#services">Services</a><a href="#contact">Contact us</a>
      </nav>
      <div className="home-auth-links"><Link to="/login">Log in</Link><Link className="home-header-cta" to="/register">Get started</Link></div>
    </header>

    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-image" style={{ backgroundImage: `url("${heroImage}")` }} /><div className="hero-shade" />
      <div className="hero-content reveal-up">
        <p className="home-kicker">The connected farm record</p>
        <h1 id="home-title">Run your farm with <em>clarity.</em></h1>
        <p className="hero-copy">FarmTrack turns daily chicken farm operations into one living picture, so better decisions are always close at hand.</p>
        <div className="hero-actions"><Link className="solid-button" to="/register">Start tracking today <span>→</span></Link><a className="quiet-link" href="#services">Explore the system <span>↓</span></a></div>
      </div>
      <div className="hero-caption">Flocks / Inventory / Health / Performance</div><div className="scroll-cue" aria-hidden="true"><span /> Scroll to explore</div>
    </section>

    <section className="home-intro" id="about">
      <div className="section-label reveal-up">01 / Why FarmTrack</div>
      <div className="intro-grid"><h2 className="reveal-up">A better record of <em>every layer</em> of your operation.</h2><div className="intro-copy reveal-up"><p>FarmTrack replaces scattered notebooks and disconnected spreadsheets with reliable digital records built for the rhythm of a working poultry farm.</p><p>From the first chick to the final sale, your team can see the detail, patterns, and next action that keep the farm moving.</p></div></div>
      <div className="intro-stats"><div><strong>01</strong><span>Connected workspace</span></div><div><strong>04</strong><span>Core farm areas</span></div><div><strong>∞</strong><span>Stories in every record</span></div></div>
    </section>

    <section className="services-section" id="services">
      <div className="services-heading reveal-up"><div className="section-label">02 / What it does</div><h2>Everything your farm<br /><em>needs to know.</em></h2></div>
      <div className="service-list">{services.map((service) => <article className="service-card reveal-up" key={service.number}><div className="service-image" style={{ backgroundImage: `url("${service.image}")` }} /><div className="service-content"><span className="service-number">{service.number}</span><h3>{service.title}</h3><p>{service.text}</p><span className="service-arrow">↗</span></div></article>)}</div>
    </section>

    <section className="home-story"><div className="story-image" style={{ backgroundImage: `url("${healthImage}")` }} /><div className="story-content reveal-up"><p className="section-label">03 / Make informed moves</p><h2>See the signal<br />inside the <em>routine.</em></h2><p>Good farm management is built from small observations. FarmTrack makes those observations easy to capture and meaningful to compare.</p><Link className="outline-button" to="/register">Build your farm workspace <span>→</span></Link></div></section>

    <section className="home-contact" id="contact"><div className="contact-panel" style={{ backgroundImage: `url("${closingImage}")` }}><div className="contact-overlay" /><div className="contact-content reveal-up"><p className="section-label">04 / Start here</p><h2>Your farm has a story.<br /><em>Make it count.</em></h2><p>Bring your flock, team, and records into focus.</p><Link className="solid-button" to="/register">Create your account <span>→</span></Link></div></div></section>

    <footer className="home-footer"><Link className="home-logo" to="/" aria-label="FarmTrack home"><span className="logo-mark" />FarmTrack</Link><p>Every layer tells a story.</p><div><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a><Link to="/login">Log in</Link></div><span className="footer-copy">© {new Date().getFullYear()} FarmTrack</span></footer>
  </main>
);

export default HomePage;