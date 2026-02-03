import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  
  // Render مباشراً بدون تأخير غير ضروري لضمان سرعة استجابة PWA
  root.render(
    <HashRouter>
      <App />
    </HashRouter>
  );
  
  // إخفاء الشاشة الافتتاحية بمجرد تحميل المكونات
  window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => { splash.style.display = 'none'; }, 500);
      }, 500);
    }
  });
}

