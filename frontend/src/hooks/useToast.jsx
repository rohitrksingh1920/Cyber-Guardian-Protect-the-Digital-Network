import { useState, useCallback, useEffect } from "react";

let _add = null;
let _id = 0;

export const toast = {
  success: (title, msg, ms = 3500) =>
    _add?.({ type: "success", title, msg, ms }),
  error: (title, msg, ms = 4000) => _add?.({ type: "error", title, msg, ms }),
  info: (title, msg, ms = 3000) => _add?.({ type: "info", title, msg, ms }),
  gold: (title, msg, ms = 4500) => _add?.({ type: "gold", title, msg, ms }),
};

const ICONS = { success: "✅", error: "❌", info: "ℹ️", gold: "🏅" };

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(({ type, title, msg, ms }) => {
    const id = _id++;
    setToasts((p) => [...p, { id, type, title, msg, out: false }]);
    setTimeout(() => {
      setToasts((p) => p.map((t) => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 300);
    }, ms);
  }, []);

  useEffect(() => {
    _add = add;
    return () => {
      _add = null;
    };
  }, [add]);

  const dismiss = (id) => {
    setToasts((p) => p.map((t) => (t.id === id ? { ...t, out: true } : t)));
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 300);
  };

  return (
    <div id="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}${t.out ? " out" : ""}`}
        >
          <span className="toast-icon">{ICONS[t.type]}</span>
          <div style={{ flex: 1 }}>
            {t.title && (
              <strong style={{ display: "block", marginBottom: 2 }}>
                {t.title}
              </strong>
            )}
            {t.msg && <span style={{ opacity: 0.85 }}>{t.msg}</span>}
          </div>
          <button className="toast-close" onClick={() => dismiss(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
