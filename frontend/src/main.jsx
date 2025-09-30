import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App.jsx";
import "./utils/initFirebase"; // Initialize Firebase

createRoot(document.getElementById("root")).render(<App />);
