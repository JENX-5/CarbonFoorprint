/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";

const ToastContext = createContext(null);

let idCounter = 0;
const DEFAULT_TOAST_DURATION_MS = 4500;

/**
 * ToastProvider component which provides context for dispatching notifications (toasts).
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = ++idCounter;
      const duration = toast.duration || DEFAULT_TOAST_DURATION_MS;
      setToasts((current) => [
        ...current,
        { id, variant: "default", ...toast },
      ]);
      const timer = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        className="toast-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.variant === "error" ? "toast--error" : ""} ${toast.variant === "achievement" ? "toast--achievement" : ""}`}
          >
            <div className="toast__body">
              {toast.icon ? (
                <span className="toast__icon" aria-hidden="true">
                  {toast.icon}
                </span>
              ) : null}
              <div>
                <p className="toast__title">{toast.title}</p>
                {toast.description ? (
                  <p className="toast__description">{toast.description}</p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
