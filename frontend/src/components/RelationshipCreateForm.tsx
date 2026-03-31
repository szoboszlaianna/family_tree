import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { getApiErrorMessage } from "../api/client";
import { useCreateRelationship } from "../api/hooks";
import type { Person } from "../api/types";
import { SearchablePersonSelect } from "./SearchablePersonSelect";

type RelationshipFormValues = {
  parentId: string;
  childId: string;
};

interface CreateRelationshipFormProps {
  people: Person[];
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export function CreateRelationshipForm({
  people,
  onSuccessToast,
  onErrorToast,
}: CreateRelationshipFormProps) {
  const {
    mutate: createRelationship,
    isPending,
    error: createError,
  } = useCreateRelationship();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RelationshipFormValues>({
    defaultValues: {
      parentId: "",
      childId: "",
    },
  });

  const createErrorMessage = getApiErrorMessage(
    createError,
    "Failed to create relationship.",
  );

  const onSubmit = (data: RelationshipFormValues) => {
    createRelationship(data, {
      onSuccess: () => {
        reset();
        onSuccessToast("Relationship added successfully.");
      },
      onError: (error) => {
        onErrorToast(
          getApiErrorMessage(error, "Failed to create relationship."),
        );
      },
    });
  };

  const notEnoughPeople = people.length < 2;
  const selectedParentId = useWatch({ control, name: "parentId" });
  const selectedChildId = useWatch({ control, name: "childId" });
  const childOptions = people.filter(
    (person) => person.id !== selectedParentId,
  );
  const isChildDisabled = notEnoughPeople || isPending || !selectedParentId;

  useEffect(() => {
    if (!selectedChildId) {
      return;
    }

    const childStillValid = childOptions.some(
      (person) => person.id === selectedChildId,
    );

    if (!childStillValid) {
      setValue("childId", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [childOptions, selectedChildId, setValue]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
      <h2>Add a Relationship</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 grid max-w-[460px] gap-3"
      >
        <Controller
          name="parentId"
          control={control}
          rules={{ required: "Parent is required." }}
          render={({ field }) => (
            <SearchablePersonSelect
              label="Parent"
              placeholder="Search parent"
              value={field.value}
              options={people}
              disabled={notEnoughPeople || isPending}
              error={errors.parentId?.message}
              emptyMessage="No parent matches your search."
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          name="childId"
          control={control}
          rules={{
            required: "Child is required.",
            validate: (value, values) =>
              value !== values.parentId ||
              "Parent and child must be different people.",
          }}
          render={({ field }) => (
            <SearchablePersonSelect
              label="Child"
              placeholder={
                selectedParentId ? "Search child" : "Select a parent first"
              }
              value={field.value}
              options={childOptions}
              disabled={isChildDisabled}
              error={errors.childId?.message}
              emptyMessage={
                selectedParentId
                  ? "No child matches your search."
                  : "Select a parent to see child options."
              }
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

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
