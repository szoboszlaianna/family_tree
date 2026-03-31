import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";
import "./App.css";
import { usePeopleList, useCreatePerson } from "./api/hooks";

function AppContent() {
  const { data: people, isLoading, error, refetch } = usePeopleList();
  const { mutate: createPerson, isPending } = useCreatePerson();
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    place_of_birth: "",
  });

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
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Family Tree App</h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>Add a Person</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ padding: "8px", fontSize: "14px" }}
          />
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            required
            style={{ padding: "8px", fontSize: "14px" }}
          />
          <input
            type="text"
            name="place_of_birth"
            placeholder="Place of Birth (optional)"
            value={formData.place_of_birth}
            onChange={handleInputChange}
            style={{ padding: "8px", fontSize: "14px" }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "10px",
              fontSize: "14px",
              cursor: isPending ? "not-allowed" : "pointer",
              backgroundColor: isPending ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {isPending ? "Creating..." : "Add Person"}
          </button>
        </form>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>People in Family Tree</h2>
          <button
            onClick={() => refetch()}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Refresh
          </button>
        </div>

        {isLoading && <p>Loading people...</p>}
        {error && (
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            Error loading people: {error.message}
          </div>
        )}

        {people && people.length === 0 && (
          <p style={{ color: "#666" }}>
            No people in the family tree yet. Add one above!
          </p>
        )}

        {people && people.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "15px",
            }}
          >
            {people.map((person) => (
              <div
                key={person.id}
                style={{
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#333" }}>{person.name}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>DOB:</strong> {person.date_of_birth}
                </p>
                {person.place_of_birth && (
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    <strong>Place:</strong> {person.place_of_birth}
                  </p>
                )}
                <p style={{ margin: "5px 0", fontSize: "12px", color: "#999" }}>
                  ID: {person.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
