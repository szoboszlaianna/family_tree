import { useForm } from "react-hook-form";
import { getApiErrorMessage } from "../api/client";
import { useCreatePerson } from "../api/hooks";
import type { PersonCreate } from "../api/types";

const DOB_ERROR_PHRASES = ["date of birth", "future"];

interface CreatePersonFormProps {
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export function CreatePersonForm({
  onSuccessToast,
  onErrorToast,
}: CreatePersonFormProps) {
  const { mutate: createPerson, isPending } = useCreatePerson();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PersonCreate>({
    defaultValues: {
      name: "",
      date_of_birth: "",
      place_of_birth: "",
    },
  });

  const onSubmit = (data: PersonCreate) => {
    createPerson(
      {
        ...data,
        place_of_birth: data.place_of_birth || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onSuccessToast("Person added successfully.");
        },
        onError: (error) => {
          const message = getApiErrorMessage(error, "Failed to create person.");
          const isDobError = DOB_ERROR_PHRASES.some((phrase) =>
            message.toLowerCase().includes(phrase),
          );
          if (isDobError) {
            setError("date_of_birth", { message });
          } else {
            onErrorToast(message);
          }
        },
      },
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
      <h2>Add a Person</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 grid max-w-[460px] gap-3"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-slate-800">Name</span>
          <input
            type="text"
            placeholder="e.g. Ada Lovelace"
            {...register("name", { required: "Name is required." })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
          />
          {errors.name && (
            <p className="m-0 text-sm text-rose-700">{errors.name.message}</p>
          )}
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-slate-800">
            Date of Birth
          </span>
          <input
            type="date"
            {...register("date_of_birth", {
              required: "Date of birth is required.",
            })}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
          />
          {errors.date_of_birth && (
            <p className="m-0 text-sm text-rose-700">
              {errors.date_of_birth.message}
            </p>
          )}
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-slate-800">
            Place of Birth
          </span>
          <input
            type="text"
            placeholder="optional"
            {...register("place_of_birth")}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gradient-to-br from-teal-700 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-50 transition hover:opacity-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isPending ? "Creating..." : "Add Person"}
        </button>
      </form>
    </section>
  );
}
