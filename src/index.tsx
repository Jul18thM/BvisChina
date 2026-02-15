import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 等待 DOM 加载完成
function initApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element to mount to");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 确保 DOM 已加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}