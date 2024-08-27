// src/index.js
import React from 'react';
import {
    Route,
    Routes,
    BrowserRouter as Router,
} from "react-router-dom";
import ReactDOM from 'react-dom/client';
import App from './App';
import NotFound from './NotFound';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

/*const Headers = new Headers();
Headers.set("Cache-Control", "no-cache");
Headers.set("X-Frame-Options", "SAMEORIGIN");*/

root.render(
  <>
    <Router>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route exact path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </>
);
