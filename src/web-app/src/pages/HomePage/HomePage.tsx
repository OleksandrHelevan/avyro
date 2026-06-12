import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Mail, Send } from "lucide-react";
import "./HomePage.css";

import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors.ts";
import { useSpecializations } from "../../domains/specializations/useSpecializations/useSpecializations.ts";
import Loader from "../../components/Loader/Loader.tsx";
import PlatformFeedbackModal from "../PlatformFeedbackModal/PlatformFeedbackModal.tsx";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSpec = searchParams.get("spec") || "Усі";
  const initialSearch = searchParams.get("search") || "";

  const [activeSpec, setActiveSpec] = useState(initialSpec);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔥 СТАН МОДАЛКИ
  const [isPlatformFeedbackOpen, setIsPlatformFeedbackOpen] = useState(false);

  const { data: doctors = [], isLoading: isLoadingDoctors } = useGetDoctors();
  const { data: apiSpecs = [], isLoading: isLoadingSpecs } =
    useSpecializations();

  // Синхронізація URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeSpec !== "Усі") params.set("spec", activeSpec);
    if (searchTerm.trim() !== "") params.set("search", searchTerm);
    setSearchParams(params, { replace: true });
  }, [activeSpec, searchTerm, setSearchParams]);

  const displaySpecs = useMemo(
    () => ["Усі", ...apiSpecs.map((s) => s.name)],
    [apiSpecs]
  );

  const slides = [
    {
      title: "Безкоштовна онлайн-консультація",
      desc: "Для нових пацієнтів до кінця місяця",
      color: "linear-gradient(135deg, #18c0c4, #7256a1)",
    },
    {
      title: "Комплексний чекап організму",
      desc: "Знижка 20% на всі аналізи",
      color: "linear-gradient(135deg, #7256a1, #18c0c4)",
    },
    {
      title: "Сімейний лікар у смартфоні",
      desc: "Зв'язок 24/7 у нашому додатку",
      color: "linear-gradient(135deg, #38bdf8, #6366f1)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const filteredDoctors = useMemo(() => {
    const selectedSpecObj: any = apiSpecs.find(
      (s) => s.name === activeSpec
    );
    const selectedSpecId = selectedSpecObj
      ? selectedSpecObj.id || selectedSpecObj._id
      : null;

    return doctors.filter((doc: any) => {
      const docSpecId = doc.specializationId || doc.specialization_id;
      const docSpecName = doc.specializationName;

      if (!docSpecId && !docSpecName) return false;

      const search = searchTerm.toLowerCase().trim();
      const specNameToSearch =
        docSpecName ||
        apiSpecs.find(
          (s: any) => (s.id || s._id) === docSpecId
        )?.name ||
        "";

      const matchesCategory =
        activeSpec === "Усі" ||
        docSpecId === selectedSpecId ||
        docSpecName === activeSpec ||
        specNameToSearch === activeSpec;

      const matchesSearch =
        !search ||
        doc.fullName?.toLowerCase().includes(search) ||
        doc.email?.toLowerCase().includes(search) ||
        specNameToSearch.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [doctors, activeSpec, searchTerm, apiSpecs]);

  return (
    <>
      <main className="main-content">
        {/* ===== SLIDER ===== */}
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
              style={{ background: slides[currentSlide].color }}
            >
              <div className="slide-content">
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].desc}</p>
                <button className="btn-white-glass">
                  Дізнатися більше
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ===== SPECIALIZATIONS ===== */}
        <motion.div
          className="specs-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
        >
          <h3 className="section-subtitle">Спеціалізації</h3>
          <div className="specs-scroll-wrapper">
            <div className="specs-group">
              {isLoadingSpecs ? (
                <Loader />
              ) : (
                displaySpecs.map((spec) => (
                  <button
                    key={spec}
                    className={`spec-tag-light ${
                      activeSpec === spec
                        ? "spec-active"
                        : "glass-light"
                    }`}
                    onClick={() => setActiveSpec(spec)}
                  >
                    {spec}
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== SEARCH ===== */}
        <motion.div
          className="search-section"
          initial="hidden"
          whileInView="visible"
          variants={fadeUpVariant}
        >
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

        {/* ===== DOCTORS GRID ===== */}
        <div className="results-section">
          <div className="doctors-grid">
            {isLoadingDoctors ? (
              <Loader />
            ) : filteredDoctors.length === 0 ? (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                За вашим запитом лікарів не знайдено.
              </p>
            ) : (
              filteredDoctors.map((doc: any, index) => {
                const docSpecId =
                  doc.specializationId || doc.specialization_id;
                const displaySpecName =
                  doc.specializationName ||
                  apiSpecs.find(
                    (s: any) =>
                      (s.id || s._id) === docSpecId
                  )?.name ||
                  "Загальний профіль";

                return (
                  <motion.div
                    key={doc.id || doc._id || index}
                    className="doctor-card-light glass-light"
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <div className="doctor-avatar-placeholder">
                        <img
                          src={doc.avatarUrl || DEFAULT_AVATAR}
                          alt="doc"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                      </div>
                      <div className="doctor-info-dark">
                        <h4>{doc.fullName || "Спеціаліст"}</h4>
                        <p className="spec-text-dark">
                          {displaySpecName}
                        </p>
                        <p className="email-hint">
                          <Mail size={12} /> {doc.email}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn-profile-light btn-outline"
                      onClick={() =>
                        navigate(
                          `/doctor/${doc.id || doc._id}`
                        )
                      }
                    >
                      Записатися на прийом
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
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
              <h2>
                MED<span className="logo-accent">.avyro</span>
              </h2>
            </div>
            <p>
              Ваш надійний провідник у світі сучасної медицини.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">
                <Send size={18} />
              </a>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* ===== FLOATING HELP BUTTON ===== */}
      <div className="help-fab-container">
        <button
          className="floating-chatbot"
          onClick={() => setIsPlatformFeedbackOpen(true)}
        >
          ?
          <div className="pulse-ring"></div>
        </button>
      </div>

      {/* ===== PLATFORM FEEDBACK MODAL ===== */}
      <AnimatePresence>
        {isPlatformFeedbackOpen && (
          <PlatformFeedbackModal
            onClose={() => setIsPlatformFeedbackOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;
