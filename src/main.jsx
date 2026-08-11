import "./styles/globals.css";
import "./styles/sidebar.css";
import "./styles/navbar.css";
import "./styles/chat.css";
import "./styles/home.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";


import { ChatProvider } from "./context/ChatContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";


/* =====================================================
   RESTORE SAVED APPEARANCE BEFORE APP LOADS
===================================================== */

const root = document.documentElement;

const savedTheme =
    localStorage.getItem("theme") || "dark";

const savedAccent =
    localStorage.getItem("accent") || "#2563EB";

const savedGlass =
    localStorage.getItem("glass") ?? "true";

const savedAnimations =
    localStorage.getItem("animations") ?? "true";

const savedCompact =
    localStorage.getItem("compact") ?? "false";

const savedRadius =
    localStorage.getItem("radius") || "rounded";

const savedFont =
    localStorage.getItem("fontSize") || "medium";


/* =====================================================
   THEME
===================================================== */

root.setAttribute(
    "data-theme",
    savedTheme
);


/* =====================================================
   ACCENT
===================================================== */

root.style.setProperty(
    "--primary",
    savedAccent
);

root.style.setProperty(
    "--accent",
    savedAccent
);


/* =====================================================
   OTHER APPEARANCE SETTINGS
===================================================== */

root.setAttribute(
    "data-glass",
    savedGlass === "true"
        ? "on"
        : "off"
);

root.setAttribute(
    "data-animations",
    savedAnimations === "true"
        ? "on"
        : "off"
);

root.setAttribute(
    "data-compact",
    savedCompact === "true"
        ? "on"
        : "off"
);

root.setAttribute(
    "data-radius",
    savedRadius
);

root.setAttribute(
    "data-font",
    savedFont
);


/* =====================================================
   APP
===================================================== */

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>

        <AuthProvider>

            <ProfileProvider>

                <ChatProvider>

                    <NotificationProvider>

                        <App />

                    </NotificationProvider>

                </ChatProvider>

            </ProfileProvider>

        </AuthProvider>

    </React.StrictMode>
);