import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import EcoplusHomepage from './EcoplusHomepage.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EcoplusHomepage />
  </React.StrictMode>
);
