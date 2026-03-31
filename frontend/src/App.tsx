import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { usePeopleList } from "./api/hooks";
import { CreatePersonForm } from "./components/CreatePersonForm";
import { FamilyTreeGraph } from "./components/FamilyTreeGraph";
import { CreateRelationshipForm } from "./components/RelationshipCreateForm";

function AppContent() {
  const { data: people } = usePeopleList();

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-12 pt-8 sm:px-6">
      <header className="grid gap-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-teal-800">
          Family Tree
        </p>
        <h1>People Directory</h1>
      </header>

      <section className="grid gap-5 md:grid-cols-2 md:items-start">
        <CreatePersonForm />
        <CreateRelationshipForm people={people ?? []} />
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
