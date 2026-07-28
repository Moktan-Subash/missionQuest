interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: Toast[];
  dismissToast: (id: number) => void;
}

function ToastContainer({ toasts, dismissToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span>{t.message}</span>
          <button type="button" className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
