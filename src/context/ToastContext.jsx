import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((kind, message) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, kind, message }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4000);
  }, []);

  const toast = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
        {items.map((i) => (
          <div key={i.id}
            className={`pointer-events-auto rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lift ${i.kind === 'error' ? 'bg-red-600' : 'bg-ink-900'}`}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
