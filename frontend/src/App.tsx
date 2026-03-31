import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";
import { usePeopleList, useCreatePerson } from "./api/hooks";

function AppContent() {
  const { data: people, isLoading, error, refetch } = usePeopleList();
  const {
    mutate: createPerson,
    isPending,
    error: createError,
  } = useCreatePerson();
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    place_of_birth: "",
  });

  const createErrorMessage =
    createError instanceof Error
      ? createError.message
      : "Failed to create person.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPerson(
      {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        place_of_birth: formData.place_of_birth || undefined,
      },
      {
        onSuccess: () => {
          setFormData({ name: "", date_of_birth: "", place_of_birth: "" });
        },
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-12 pt-8 sm:px-6">
      <header className="grid gap-1.5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-teal-800">
          Family Tree
        </p>
        <h1>People Directory</h1>
        <p className="max-w-[56ch] text-slate-600">
          Add a person and verify backend fetch/create quickly.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
        <h2>Add a Person</h2>
        <form onSubmit={handleSubmit} className="mt-3 grid max-w-[460px] gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-800">Name</span>
            <input
              type="text"
              name="name"
              placeholder="e.g. Ada Lovelace"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Date of Birth
            </span>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Place of Birth
            </span>
            <input
              type="text"
              name="place_of_birth"
              placeholder="optional"
              value={formData.place_of_birth}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
            />
          </label>
          {createError && (
            <p className="m-0 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
              Create failed: {createErrorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-br from-teal-700 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-50 transition hover:opacity-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isPending ? "Creating..." : "Add Person"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          <h2>People in Family Tree</h2>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 active:translate-y-px"
          >
            Refresh
          </button>
        </div>

        {isLoading && <p className="text-slate-600">Loading people...</p>}
        {error && (
          <p className="m-0 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            Fetch failed: {error.message}
          </p>
        )}

        {people && people.length === 0 && (
          <p className="text-slate-600">No people yet. Add one above.</p>
        )}

        {people && people.length > 0 && (
          <div className="mt-2 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {people.map((person) => (
              <article
                key={person.id}
                className="rounded-xl border border-slate-200 bg-teal-50/40 p-3.5"
              >
                <h3 className="mb-2 text-lg font-semibold text-slate-800">
                  {person.name}
                </h3>
                <p className="my-1 text-slate-600">
                  <strong>DOB:</strong> {person.date_of_birth}
                </p>
                {person.place_of_birth && (
                  <p className="my-1 text-slate-600">
                    <strong>Place:</strong> {person.place_of_birth}
                  </p>
                )}
                <p className="my-1 break-all text-xs text-slate-500">
                  ID: {person.id}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
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
