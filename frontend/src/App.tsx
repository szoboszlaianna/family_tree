import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { usePeopleList } from "./api/hooks";
import { CreatePersonForm } from "./components/CreatePersonForm";
import { FamilyTreeGraph } from "./components/FamilyTreeGraph";
import { CreateRelationshipForm } from "./components/RelationshipCreateForm";

function AppContent() {
  const { data: people } = usePeopleList();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toastMessage]);

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-12 pt-8 sm:px-6">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      <header className="grid gap-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-teal-800">
          Family Tree
        </p>
        <h1>People Directory</h1>
      </header>

      <section className="grid gap-5 md:grid-cols-2 md:items-start">
        <CreatePersonForm onSuccessToast={setToastMessage} />
        <CreateRelationshipForm
          people={people ?? []}
          onSuccessToast={setToastMessage}
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
