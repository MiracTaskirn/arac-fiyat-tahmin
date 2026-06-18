import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowUp } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register(email, password);
      nav("/", { replace: true });
    } catch (e2) {
      const d = e2?.response?.data;
      const msg =
        (typeof d === "string" && d) ||
        d?.detail ||
        d?.message ||
        "Kayıt başarısız.";
      setErr(msg);
    }
  };

  return (
    <div className="auth-page mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center justify-center px-4 py-10">
      <div className="auth-card w-full max-w-[560px] ui-card p-10 md:p-12">
        <h1 className="ui-title text-4xl font-bold">Kayıt Ol</h1>
        <p className="ui-muted mt-3 text-lg">
          Lütfen kayıt olmak için email ve şifre giriniz.
        </p>

        {err ? <div className="mt-5 ui-alert-danger">{err}</div> : null}

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <input
            className="ui-input auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <div className="relative">
            <input
              className="ui-input auth-input auth-input-password"
              placeholder="Şifre"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCapsOn(!!e.getModifierState?.("CapsLock"))}
              onKeyDown={(e) => setCapsOn(!!e.getModifierState?.("CapsLock"))}
              autoComplete="new-password"
            />

            {capsOn ? (
              <div className="caps-indicator" title="Caps Lock açık">
                <ArrowUp size={13} />
                <span>Caps</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="password-toggle-btn"
              title={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="w-full ui-btn-primary auth-submit-btn">
            Kayıt Ol
          </button>
        </form>

        <div className="ui-muted mt-6 text-base">
          Zaten hesabın var mı?{" "}
          <Link className="ui-link font-semibold" to="/login">
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}