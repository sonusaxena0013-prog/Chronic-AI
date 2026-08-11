import { useEffect, useState } from "react";

export default function AppearanceSection() {

  const COLORS = [
    "#2563EB",
    "#7C3AED",
    "#06B6D4",
    "#10B981",
    "#F97316",
    "#EF4444",
    "#EC4899",
    "#14B8A6",
  ];

  const THEMES = [
    {
      id: "dark",
      title: "Dark",
      desc: "Perfect for night work",
    },
    {
      id: "light",
      title: "Light",
      desc: "Bright clean interface",
    },
    {
      id: "system",
      title: "System",
      desc: "Follow device settings",
    },
  ];

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const [accent, setAccent] = useState(
    () => localStorage.getItem("accent") || COLORS[0]
  );

  const [glass, setGlass] = useState(
    () => JSON.parse(localStorage.getItem("glass") ?? "true")
  );

  const [animations, setAnimations] = useState(
    () => JSON.parse(localStorage.getItem("animations") ?? "true")
  );

  const [compact, setCompact] = useState(
    () => JSON.parse(localStorage.getItem("compact") ?? "false")
  );

  const [radius, setRadius] = useState(
    () => localStorage.getItem("radius") || "rounded"
  );

  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem("fontSize") || "medium"
  );

  /* =====================================================
     THEME
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    let actualTheme = theme;

    if (theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.setAttribute("data-theme", actualTheme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  /* =====================================================
     ACCENT
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--primary", accent);

    localStorage.setItem("accent", accent);
  }, [accent]);

  /* =====================================================
     GLASS
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-glass", String(glass));

    localStorage.setItem(
      "glass",
      JSON.stringify(glass)
    );
  }, [glass]);

  /* =====================================================
     ANIMATIONS
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(
      "data-animations",
      String(animations)
    );

    localStorage.setItem(
      "animations",
      JSON.stringify(animations)
    );
  }, [animations]);

  /* =====================================================
     COMPACT MODE
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(
      "data-compact",
      String(compact)
    );

    localStorage.setItem(
      "compact",
      JSON.stringify(compact)
    );
  }, [compact]);

  /* =====================================================
     RADIUS
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(
      "data-radius",
      radius
    );

    localStorage.setItem(
      "radius",
      radius
    );
  }, [radius]);

  /* =====================================================
     FONT SIZE
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute(
      "data-font",
      fontSize
    );

    localStorage.setItem(
      "fontSize",
      fontSize
    );

    const scaleMap = {
      small: "0.92",
      medium: "1",
      large: "1.08",
    };

    root.style.setProperty(
      "--font-scale",
      scaleMap[fontSize] || "1"
    );

  }, [fontSize]);

  /* =====================================================
     RESET
  ===================================================== */

  function resetAppearance() {

    setTheme("dark");
    setAccent(COLORS[0]);
    setGlass(true);
    setAnimations(true);
    setCompact(false);
    setRadius("rounded");
    setFontSize("medium");
  }

  return (
    <div className="settingsSection">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="settingsCard">

        <h2>Appearance</h2>

        <p>
          Personalize the look and feel of Chronic AI.
        </p>

      </div>

      {/* =================================================
          THEME
      ================================================= */}

      <div className="settingsCard">

        <h3>Choose Theme</h3>

        <p>
          Select your preferred theme.
        </p>

        <div className="themeGrid">

          {THEMES.map((item) => (

            <button
              key={item.id}
              type="button"
              className={`themeCard ${
                theme === item.id ? "active" : ""
              }`}
              onClick={() => setTheme(item.id)}
            >

              <div className="themePreview">

                {item.id === "dark" && (
                  <div className="darkPreview" />
                )}

                {item.id === "light" && (
                  <div className="lightPreview" />
                )}

                {item.id === "system" && (
                  <div className="systemPreview" />
                )}

              </div>

              <h4>
                {item.title}
              </h4>

              <p>
                {item.desc}
              </p>

            </button>

          ))}

        </div>

      </div>

      {/* =================================================
          ACCENT COLOR
      ================================================= */}

      <div className="settingsCard">

        <h3>Accent Color</h3>

        <p>
          Choose the primary color.
        </p>

        <div className="colorGrid">

          {COLORS.map((color) => (

            <button
              key={color}
              type="button"
              className={`colorBtn ${
                accent === color ? "selected" : ""
              }`}
              style={{
                backgroundColor: color,
              }}
              onClick={() => setAccent(color)}
              aria-label={`Select ${color}`}
            >

              {accent === color && "✓"}

            </button>

          ))}

        </div>

      </div>

      {/* =================================================
          INTERFACE PREFERENCES
      ================================================= */}

      <div className="settingsCard">

        <h3>
          Interface Preferences
        </h3>

        {/* Glass */}

        <div className="settingRow">

          <div>

            <h4>
              Glass Effect
            </h4>

            <span>
              Enable translucent interface.
            </span>

          </div>

          <label className="switch">

            <input
              type="checkbox"
              checked={glass}
              onChange={(e) =>
                setGlass(e.target.checked)
              }
            />

            <span className="slider" />

          </label>

        </div>

        {/* Animations */}

        <div className="settingRow">

          <div>

            <h4>
              Animations
            </h4>

            <span>
              Smooth UI transitions.
            </span>

          </div>

          <label className="switch">

            <input
              type="checkbox"
              checked={animations}
              onChange={(e) =>
                setAnimations(e.target.checked)
              }
            />

            <span className="slider" />

          </label>

        </div>

        {/* Compact */}

        <div className="settingRow">

          <div>

            <h4>
              Compact Mode
            </h4>

            <span>
              Reduce spacing across UI.
            </span>

          </div>

          <label className="switch">

            <input
              type="checkbox"
              checked={compact}
              onChange={(e) =>
                setCompact(e.target.checked)
              }
            />

            <span className="slider" />

          </label>

        </div>

      </div>

      {/* =================================================
          FONT SIZE
      ================================================= */}

      <div className="settingsCard">

        <h3>
          Font Size
        </h3>

        <div className="themeGrid">

          {["small", "medium", "large"].map((size) => (

            <button
              key={size}
              type="button"
              className={`themeCard ${
                fontSize === size ? "active" : ""
              }`}
              onClick={() => setFontSize(size)}
            >

              <h4>
                {size.charAt(0).toUpperCase() +
                  size.slice(1)}
              </h4>

            </button>

          ))}

        </div>

      </div>

      {/* =================================================
          CORNER RADIUS
      ================================================= */}

      <div className="settingsCard">

        <h3>
          Corner Radius
        </h3>

        <select
          className="premiumSelect"
          value={radius}
          onChange={(e) =>
            setRadius(e.target.value)
          }
        >

          <option value="rounded">
            Rounded
          </option>

          <option value="modern">
            Modern
          </option>

          <option value="sharp">
            Sharp
          </option>

        </select>

      </div>

      {/* =================================================
          LIVE PREVIEW
      ================================================= */}

      <div className="settingsCard">

        <h3>
          Live Preview
        </h3>

        <div className="previewCard">

          <div
            className="previewHeader"
            style={{
              background: accent,
            }}
          />

          <div className="previewBody">

            <h4>
              Chronic AI
            </h4>

            <p>
              This is how your selected appearance
              will look.
            </p>

            <button
              type="button"
              className="previewBtn"
              style={{
                background: accent,
              }}
            >
              Sample Button
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          RESET
      ================================================= */}

      <div className="settingsCard">

        <h3>
          Reset Appearance
        </h3>

        <p>
          Restore all appearance settings to default.
        </p>

        <button
          type="button"
          className="dangerBtn"
          onClick={resetAppearance}
        >
          Reset Appearance
        </button>

      </div>

    </div>
  );
}