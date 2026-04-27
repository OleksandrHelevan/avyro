import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "./HomePage.css";

// Анімація для блоку (з'являється знизу вгору)
const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Анімація для контейнера, щоб його дочірні елементи з'являлися по черзі (stagger)
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const HomePage = () => {
  const [activeSpec, setActiveSpec] = useState("Неврологія");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Дані
  const slides = [
    { title: "Безкоштовна онлайн-консультація", desc: "Для нових пацієнтів до кінця місяця", color: "linear-gradient(135deg, rgba(24,192,196,0.8), rgba(114,86,161,0.8))" },
    { title: "Комплексний чекап організму", desc: "Знижка 20% на всі аналізи", color: "linear-gradient(135deg, rgba(114,86,161,0.8), rgba(24,192,196,0.8))" },
    { title: "Сімейний лікар у смартфоні", desc: "Зв'язок 24/7 у нашому додатку", color: "linear-gradient(135deg, rgba(56,189,248,0.8), rgba(99,102,241,0.8))" }
  ];

  const doctors = [
    { id: 1, name: "Др. Олександр Петренко", spec: "Кардіолог", rank: "Вища категорія", bonus: "+100 балів", active: false },
    { id: 2, name: "Др. Ірина Коваленко", spec: "Кардіолог", rank: "К.м.н.", bonus: "+100 балів", active: true },
    { id: 3, name: "Др. Василь Мельник", spec: "Невролог", rank: "10 років досвіду", bonus: "+50 балів", active: false },
    { id: 4, name: "Др. Олена Сергієнко", spec: "Педіатр", rank: "15 років досвіду", bonus: "+75 балів", active: false }
  ];

  const specs = ["Усі", "Кардіологія", "Неврологія", "Педіатрія"];

  const steps = [
    { num: "01", title: "Знайдіть лікаря", desc: "Оберіть спеціаліста за рейтингом та відгуками" },
    { num: "02", title: "Оберіть час", desc: "Забронюйте зручний слот у розкладі онлайн" },
    { num: "03", title: "Отримайте допомогу", desc: "Прийдіть у клініку або почніть відеодзвінок" }
  ];

  const reviews = [
    { id: 1, author: "Марія В.", role: "Пацієнтка", text: "Дуже зручний сервіс! Знайшла чудового кардіолога за 5 хвилин. Консультація онлайн пройшла на вищому рівні." },
    { id: 2, author: "Андрій К.", role: "Пацієнт", text: "Завдяки MED.avyro я забув про черги в реєстратурі. Зручний запис, нагадування про візит — 10/10!" }
  ];

  // Слайдер
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="aero-viewport light-theme">
      {/* ФОН */}
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      {/* --- ПЛАВАЮЧІ МЕДИЧНІ СТІКЕРИ --- */}
      <div className="floating-icons-container">
        <div className="bg-icon icon-heart"></div>
        <div className="bg-icon icon-cross"></div>
        <div className="bg-icon icon-pill"></div>
        <div className="bg-icon icon-heart2"></div>
        <div className="bg-icon icon-plus"></div>
      </div>
      {/* ------------------------------- */}

      {/* НАВБАР (З'являється одразу) */}
      <motion.nav
        className="white-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="nav-content">
          <div className="logo-group">
            <div className="logo-icon-med"></div>
            <h1><span className="logo-accent">Avyro</span></h1>
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link active-link">Знайти лікаря</a>
            <a href="#" className="nav-link">Мої записи</a>
            <a href="#" className="nav-link">Мій кабінет</a>
          </div>
          <div className="user-profile">
            <span className="user-name">Олена М.</span>
            <div className="user-avatar"></div>
          </div>
        </div>
      </motion.nav>

      <main className="main-content">

        {/* СЛАЙДЕР (З'являється одразу) */}
        <motion.div
          className="slider-container"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="slide-card glass-light"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              style={{ background: slides[currentSlide].color }}
            >
              <div className="slide-content">
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].desc}</p>
                <button className="btn-white-glass">Дізнатися більше</button>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="slider-dots">
            {slides.map((_, idx) => (
              <div key={idx} className={`dot ${idx === currentSlide ? 'dot-active' : ''}`} onClick={() => setCurrentSlide(idx)}></div>
            ))}
          </div>
        </motion.div>

        {/* ПОШУК (Анімація при скролі) */}
        <motion.div
          className="search-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUpVariant}
        >
          <h2 className="med-title-dark">Знайдіть потрібного спеціаліста</h2>
          <div className="search-bar-white">
            <input type="text" placeholder="Ім'я лікаря або спеціалізація..." />
            <button className="btn-search-dark">Знайти</button>
          </div>
        </motion.div>

        {/* СТАТИСТИКА (По черзі при скролі) */}
        <motion.div
          className="stats-row"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUpVariant} className="stat-item glass-light"><span className="stat-num">500+</span> Лікарів</motion.div>
          <motion.div variants={fadeUpVariant} className="stat-item glass-light"><span className="stat-num">12k+</span> Пацієнтів</motion.div>
          <motion.div variants={fadeUpVariant} className="stat-item glass-light"><span className="stat-num">4.9</span> Середня оцінка</motion.div>
        </motion.div>

        {/* ЯК ЦЕ ПРАЦЮЄ */}
        <motion.div
          className="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h3 variants={fadeUpVariant} className="section-subtitle text-center">Як це працює?</motion.h3>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="step-card glass-light">
                <div className="step-number">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ФІЛЬТРИ */}
        <motion.div
          className="specs-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={fadeUpVariant}
        >
          <h3 className="section-subtitle">Спеціалізації</h3>
          <div className="specs-group">
            {specs.map(spec => (
              <button
                key={spec}
                className={`spec-tag-light ${activeSpec === spec ? 'spec-active' : 'glass-light'}`}
                onClick={() => setActiveSpec(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </motion.div>

        {/* СІТКА ЛІКАРІВ */}
        <motion.div
          className="results-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <motion.h3 variants={fadeUpVariant} className="section-subtitle">Результати пошуку (12)</motion.h3>
          <div className="doctors-grid">
            {doctors.map((doc) => (
              <motion.div
                key={doc.id}
                variants={fadeUpVariant}
                className={`doctor-card-light glass-light ${doc.active ? 'card-border-active' : ''}`}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="card-header">
                  <div className="doctor-avatar-placeholder"></div>
                  <div className="doctor-info-dark">
                    <h4>{doc.name}</h4>
                    <p className="spec-text-dark">{doc.spec} • {doc.rank}</p>
                  </div>
                  <div className="bonus-tag-light">{doc.bonus}</div>
                </div>
                <button className={`btn-profile-light ${doc.active ? 'btn-active-fill' : 'btn-outline'}`}>
                  Переглянути профіль
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ВІДГУКИ */}
        <motion.div
          className="reviews-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h3 variants={fadeUpVariant} className="section-subtitle">Що кажуть наші пацієнти</motion.h3>
          <div className="reviews-grid">
            {reviews.map((rev) => (
              <motion.div key={rev.id} variants={fadeUpVariant} className="review-card glass-light">
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">"{rev.text}"</p>
                <div className="review-author">
                  <div className="author-avatar"></div>
                  <div>
                    <strong>{rev.author}</strong>
                    <span>{rev.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </main>

      {/* ФУТЕР */}
      <motion.footer
        className="aero-footer glass-light"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeUpVariant}
      >
        <div className="footer-content">
          <div className="footer-col brand-col">
            <div className="logo-group">
              <div className="logo-icon-med"></div>
              <h2>MED<span className="logo-accent">.avyro</span></h2>
            </div>
            <p>Сучасний сервіс пошуку лікарів та онлайн-консультацій. Ваше здоров'я — наш пріоритет.</p>
          </div>
          <div className="footer-col">
            <h4>Пацієнтам</h4>
            <a href="#">Лікарі</a>
            <a href="#">Клініки</a>
            <a href="#">Аналізи</a>
          </div>
          <div className="footer-col">
            <h4>Партнерам</h4>
            <a href="#">Реєстрація лікаря</a>
            <a href="#">Для клінік</a>
            <a href="#">Реклама</a>
          </div>
          <div className="footer-col">
            <h4>Завантажити</h4>
            <div className="app-buttons">
              <button className="btn-app">App Store</button>
              <button className="btn-app">Google Play</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MED.avyro. Всі права захищено.</p>
        </div>
      </motion.footer>

      {/* ПЛАВАЮЧИЙ ЧАТ-БОТ */}
      <motion.button
        className="floating-chatbot"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <span className="pulse-ring"></span>
        💬
      </motion.button>

    </div>
  );
};

export default HomePage;
