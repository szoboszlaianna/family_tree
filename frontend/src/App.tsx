import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { usePeopleList } from "./api/hooks";
import { CreatePersonForm } from "./components/CreatePersonForm";
import { FamilyTreeGraph } from "./components/FamilyTreeGraph";
import { CreateRelationshipForm } from "./components/RelationshipCreateForm";

type ToastState = {
  message: string;
  kind: "success" | "error";
};

function AppContent() {
  const { data: people } = usePeopleList();
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const showSuccessToast = (message: string) => {
    setToast({ message, kind: "success" });
  };

  const showErrorToast = (message: string) => {
    setToast({ message, kind: "error" });
  };

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-12 pt-8 sm:px-6">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "fixed right-4 top-4 z-50 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-lg"
              : "fixed right-4 top-4 z-50 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 shadow-lg"
          }
        >
          {toast.message}
        </div>
      )}

      <header className="grid gap-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-teal-800">
          Family Tree
        </p>
        <h1>People Directory</h1>
      </header>

      <section className="grid gap-5 md:grid-cols-2 md:items-start">
        <CreatePersonForm
          onSuccessToast={showSuccessToast}
          onErrorToast={showErrorToast}
        />
        <CreateRelationshipForm
          people={people ?? []}
          onSuccessToast={showSuccessToast}
          onErrorToast={showErrorToast}
        />
      </section>
      <FamilyTreeGraph />
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
