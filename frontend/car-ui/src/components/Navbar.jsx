import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Item = ({ to, end = false, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      "ui-nav-item " + (isActive ? "ui-nav-item-active" : "")
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { isAuthed, email, logout } = useAuth();

  const themes = useMemo(
    () => [
      { id: "neo", label: "Indigo" },
      { id: "emerald", label: "Emerald" },
      { id: "midnight", label: "Dark" },
    ],
    []
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "neo"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const idx = themes.findIndex((t) => t.id === theme);
    const next = themes[(idx + 1) % themes.length].id;
    setTheme(next);
  };

  return (
    <div className="ui-nav">
      <div className="mx-auto flex max-w-8xl items-center justify-between px-9 py-6">
        <div className="ui-brand text-4xl">Car-Details System</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleTheme}
            className="ui-btn-secondary"
            title="Tema değiştir"
          >
            Tema: {themes.find((t) => t.id === theme)?.label}
          </button>

          <Item to="/" end>
            Ana Sayfa
          </Item>

          <Item to="/recommend">Bana Araç Öner</Item>
          <Item to="/predict">Tahmin</Item>

          {isAuthed ? (
            <>
              <Item to="/history">Geçmiş</Item>
              <span className="ui-soft mx-2 hidden text-xs sm:inline">
                {email}
              </span>
              <button onClick={logout} className="ui-btn-secondary">
                Çıkış
              </button>
            </>
          ) : (
            <div className="nav-auth-switch">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-auth-link ${isActive ? "nav-auth-link-active" : ""}`
                }
              >
                Giriş Yap
              </NavLink>

              <span className="nav-auth-separator">/</span>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `nav-auth-link ${isActive ? "nav-auth-link-active" : ""}`
                }
              >
                Kayıt Ol
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}