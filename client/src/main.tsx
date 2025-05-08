import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize remixicon from CDN
const link = document.createElement("link");
link.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
link.rel = "stylesheet";
document.head.appendChild(link);

// Add meta tag for Arabic language and RTL
const metaLang = document.createElement("meta");
metaLang.name = "language";
metaLang.content = "ar";
document.head.appendChild(metaLang);

// Add title
const title = document.createElement("title");
title.textContent = "EticClients - نظام إدارة العملاء";
document.head.appendChild(title);

// Set document direction to RTL
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";

// Add Cairo font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
