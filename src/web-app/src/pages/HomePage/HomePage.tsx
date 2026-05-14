import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Send } from "lucide-react";
import "./HomePage.css";

// Хуки та сервіси
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors.ts";
import { useSpecializations } from "../../domains/users/useSpecializations/useSpecializations.ts";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [activeSpec, setActiveSpec] = useState("Усі");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Завантаження даних
  const { data: doctors = [], isLoading: isLoadingDoctors } = useGetDoctors();
  const { data: apiSpecs = [], isLoading: isLoadingSpecs } = useSpecializations();

  // Список назв спеціалізацій для кнопок-фільтрів
  const displaySpecs = useMemo(() => ["Усі", ...apiSpecs.map(s => s.name)], [apiSpecs]);

  // Слайди для банера
  const slides = [
    { title: "Безкоштовна онлайн-консультація", desc: "Для нових пацієнтів до кінця місяця", color: "linear-gradient(135deg, #18c0c4, #7256a1)" },
    { title: "Комплексний чекап організму", desc: "Знижка 20% на всі аналізи", color: "linear-gradient(135deg, #7256a1, #18c0c4)" },
    { title: "Сімейний лікар у смартфоні", desc: "Зв'язок 24/7 у нашому додатку", color: "linear-gradient(135deg, #38bdf8, #6366f1)" }
  ];

  // ЛОГІКА ФІЛЬТРАЦІЇ
  const filteredDoctors = useMemo(() => {
    // Додаємо : any ось тут:
    const selectedSpecObj: any = apiSpecs.find(s => s.name === activeSpec);
    const selectedSpecId = selectedSpecObj ? (selectedSpecObj.id || selectedSpecObj._id) : null;

    return doctors.filter((doc: any) => {
      const search = searchTerm.toLowerCase().trim();

      const docSpecId = doc.specializationId || doc.specialization_id;
      const docSpecName = doc.specializationName;

      const matchesCategory =
        activeSpec === "Усі" ||
        docSpecId === selectedSpecId ||
        docSpecName === activeSpec;

      // ВИПРАВЛЕНО: s.id || s._id
      const specNameToSearch = docSpecName || apiSpecs.find((s: any) => (s.id || s._id) === docSpecId)?.name || "";
      const matchesSearch = !search ||
        doc.fullName?.toLowerCase().includes(search) ||
        doc.email?.toLowerCase().includes(search) ||
        specNameToSearch.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [doctors, activeSpec, searchTerm, apiSpecs]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="aero-viewport light-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      <main className="main-content">
        {/* Банер-слайдер */}
        <motion.div className="slider-container" initial="hidden" animate="visible" variants={fadeUpVariant}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="slide-card glass-light"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: slides[currentSlide].color }}
            >
              <div className="slide-content">
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].desc}</p>
                <button className="btn-white-glass">Дізнатися більше</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Скрол-секція спеціалізацій */}
        <motion.div className="specs-section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
          <h3 className="section-subtitle">Спеціалізації</h3>
          <div className="specs-scroll-wrapper">
            <div className="specs-group">
              {isLoadingSpecs ? (
                <div className="loading-dots">...</div>
              ) : (
                displaySpecs.map(spec => (
                  <button
                    key={spec}
                    className={`spec-tag-light ${activeSpec === spec ? 'spec-active' : 'glass-light'}`}
                    onClick={() => setActiveSpec(spec)}
                  >
                    {spec}
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Пошук */}
        <motion.div className="search-section" initial="hidden" whileInView="visible" variants={fadeUpVariant}>
          <h2 className="med-title-dark">Знайдіть свого лікаря</h2>
          <div className="search-bar-white">
            <Search size={20} color="#6b7280" />
            <input
              type="text"
              placeholder="Ім'я, спеціальність або пошта..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-search-dark">Знайти</button>
          </div>
        </motion.div>

        {/* Сітка лікарів БЕЗ анімації появи */}
        <div className="results-section">
          <div className="doctors-grid">
            {isLoadingDoctors ? (
              <p>Завантаження спеціалістів...</p>
            ) : filteredDoctors.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#000000' }}>
                За вашим запитом лікарів не знайдено.
              </p>
            ) : filteredDoctors.map((doc: any, index) => {

              const docSpecId = doc.specializationId || doc.specialization_id;
              // ВИПРАВЛЕНО: s.id || s._id
              const displaySpecName = doc.specializationName || apiSpecs.find((s: any) => (s.id || s._id) === docSpecId)?.name || "Загальний профіль";

              return (
                <motion.div
                  key={doc.id || doc._id || index}
                  className="doctor-card-light glass-light"
                  whileHover={{ y: -5 }} // Анімація при наведенні мишки залишається
                >
                  <div className="card-header">
                    <div className="doctor-avatar-placeholder">
                      <img
                        src={doc.avatarUrl || DEFAULT_AVATAR}
                        alt="doc"
                        onError={(e) => {(e.currentTarget.src = DEFAULT_AVATAR)}}
                      />
                    </div>
                    <div className="doctor-info-dark">
                      <h4>{doc.fullName || "Спеціаліст"}</h4>
                      <p className="spec-text-dark">{displaySpecName}</p>
                      <p className="email-hint"><Mail size={12} /> {doc.email}</p>
                    </div>
                    <div className="bonus-tag-light">Top Rated</div>
                  </div>
                  <button
                    className="btn-profile-light btn-outline"
                    onClick={() => navigate(`/doctor/${doc.id || doc._id}`)}
                  >
                    Записатися на прийом
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Футер */}
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
            <p>Ваш надійний провідник у світі сучасної медицини. Записуйтесь до найкращих спеціалістів онлайн за лічені хвилини.</p>
            <div className="social-links">
              <a href="#" className="social-icon"><Send size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Пацієнтам</h4>
            <a href="#">Знайти лікаря</a>
            <a href="#">Спеціалізації</a>
            <a href="#">Як це працює</a>
            <a href="#">Відгуки</a>
          </div>

          <div className="footer-col">
            <h4>Лікарям</h4>
            <a href="/login">Увійти в кабінет</a>
            <a href="/sign-up">Реєстрація спеціаліста</a>
            <a href="#">Партнерська програма</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>© 2026 MED.avyro. Всі права захищено.</p>
            <div className="footer-legal">
              <a href="#">Політика конфіденційності</a>
              <a href="#">Умови використання</a>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Плаваюча кнопка допомоги */}
      <div className="help-fab-container">
        <button className="floating-chatbot" onClick={() => setIsHelpOpen(!isHelpOpen)}>
          {isHelpOpen ? "✕" : "?"}
          <div className="pulse-ring"></div>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
