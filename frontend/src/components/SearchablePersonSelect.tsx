import { useEffect, useRef, useState } from "react";
import type { Person } from "../api/types";

interface SearchablePersonSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: Person[];
  disabled: boolean;
  error?: string;
  emptyMessage: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function PersonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 16.25a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PersonOptionProps {
  person: Person;
  isSelected: boolean;
  onSelect: (person: Person) => void;
}

function PersonOption({ person, isSelected, onSelect }: PersonOptionProps) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect(person);
      }}
      className={
        isSelected
          ? "flex w-full items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-left text-sm font-medium text-teal-900"
          : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
      }
    >
      <span
        className={
          isSelected
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700"
            : "flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        }
      >
        <PersonIcon />
      </span>
      <span className="truncate">{person.name}</span>
    </button>
  );
}

export function SearchablePersonSelect({
  label,
  placeholder,
  value,
  options,
  disabled,
  error,
  emptyMessage,
  onChange,
  onBlur,
}: SearchablePersonSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.id === value);
  const inputValue = isOpen ? searchTerm : (selectedOption?.name ?? "");
  const filteredOptions = options.filter((option) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return option.name.toLowerCase().includes(normalizedQuery);
  });

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div ref={containerRef} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          onBlur={onBlur}
          onFocus={() => {
            if (!disabled) {
              setSearchTerm(selectedOption?.name ?? "");
              setIsOpen(true);
            }
          }}
          onChange={(event) => {
            const nextQuery = event.target.value;

            setSearchTerm(nextQuery);
            setIsOpen(true);

            if (value) {
              onChange("");
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setSearchTerm("");
            }
          }}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-10 text-sm transition outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-500">
          <PersonIcon />
        </span>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((open) => !open);
            }
          }}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label={`Toggle ${label.toLowerCase()} options`}
        >
          <ChevronIcon isOpen={isOpen} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <div className="max-h-56 overflow-y-auto p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.id === value;

                  return (
                    <div key={option.id} className="py-0.5">
                      <PersonOption
                        person={option}
                        isSelected={isSelected}
                        onSelect={(person) => {
                          onChange(person.id);
                          setSearchTerm(person.name);
                          setIsOpen(false);
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="m-0 text-sm text-rose-700">{error}</p>}
    </label>
  );
}
