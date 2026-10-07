"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = useCallback((message, type = "success") => {
    const options = { duration: 4000 };
    if (type === "error") toast.error(message, options);
    else toast.success(message, options);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="bottom-right" closeButton />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
