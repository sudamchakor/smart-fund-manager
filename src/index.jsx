import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css"; // Updated import
import "./styles/theme.css"; // New import
import App from "./App";
import { HashRouter } from "react-router-dom"; // Changed to HashRouter

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter> {/* Changed to HashRouter and removed basename */}
      <App />
    </HashRouter>
  </React.StrictMode>,
);
