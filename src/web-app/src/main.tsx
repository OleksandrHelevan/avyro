import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // Ми прибрали <StrictMode>, щоб запобігти подвійному рендеру компонентів
  // та дублюванню сповіщень у Dev-режимі
  <App />
)
