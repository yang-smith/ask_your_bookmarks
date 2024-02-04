import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.body;

// 创建一个新的 div 元素作为 React 应用的容器
const reactRootContainer = document.createElement('div');
reactRootContainer.id = 'extension-root';
rootElement.appendChild(reactRootContainer);

// 使用 reactRootContainer 作为挂载点
ReactDOM.createRoot(reactRootContainer).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
