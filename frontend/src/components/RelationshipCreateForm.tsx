import { useForm } from "react-hook-form";
import { useCreateRelationship } from "../api/hooks";
import type { Person } from "../api/types";

type RelationshipFormValues = {
  parentId: string;
  childId: string;
};

interface CreateRelationshipFormProps {
  people: Person[];
  onSuccessToast: (message: string) => void;
}

export function CreateRelationshipForm({
  people,
  onSuccessToast,
}: CreateRelationshipFormProps) {
  const {
    mutate: createRelationship,
    isPending,
    error: createError,
  } = useCreateRelationship();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RelationshipFormValues>({
    defaultValues: {
      parentId: "",
      childId: "",
    },
  });

  const createErrorMessage =
    createError instanceof Error
      ? createError.message
      : "Failed to create relationship.";

  const onSubmit = (data: RelationshipFormValues) => {
    createRelationship(data, {
      onSuccess: () => {
        reset();
        onSuccessToast("Relationship added successfully.");
      },
    });
  };

  const notEnoughPeople = people.length < 2;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
      <h2>Add a Relationship</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 grid max-w-[460px] gap-3"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-slate-800">Parent</span>
          <select
            {...register("parentId", { required: "Parent is required." })}
            disabled={notEnoughPeople || isPending}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value="">Select parent</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          {errors.parentId && (
            <p className="m-0 text-sm text-rose-700">
              {errors.parentId.message}
            </p>
          )}
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-slate-800">Child</span>
          <select
            {...register("childId", {
              required: "Child is required.",
              validate: (value, values) =>
                value !== values.parentId ||
                "Parent and child must be different people.",
            })}
            disabled={notEnoughPeople || isPending}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value="">Select child</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          {errors.childId && (
            <p className="m-0 text-sm text-rose-700">
              {errors.childId.message}
            </p>
          )}
        </label>

        {notEnoughPeople && (
          <p className="m-0 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            Add at least two people before creating a relationship.
          </p>
        )}

        {createError && (
          <p className="m-0 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            Create failed: {createErrorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={notEnoughPeople || isPending}
          className="rounded-xl bg-gradient-to-br from-teal-700 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-50 transition hover:opacity-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isPending ? "Creating..." : "Add Relationship"}
        </button>
      </form>
    </section>
  );
}
