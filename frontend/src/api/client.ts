import axios from "axios";
import type {
  Person,
  PersonCreate,
  Relationship,
  TreeView,
  UUID,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// People endpoints
export const peopleApi = {
  list: () => api.get<Person[]>("/people/"),
  get: (id: UUID) => api.get<Person>(`/people/${id}`),
  create: (data: PersonCreate) => api.post<Person>("/people", data),
  delete: (id: UUID) => api.delete(`/people/${id}`),
};

// Relationship endpoints
export const relationshipApi = {
  create: (parentId: UUID, childId: UUID) =>
    api.post<Relationship>("/relationships", null, {
      params: { parent_id: parentId, child_id: childId },
    }),
  delete: (parentId: UUID, childId: UUID) =>
    api.delete(`/relationships/${parentId}/${childId}`),
};

// Tree endpoints
export const treeApi = {
  get: () => api.get<TreeView>("/tree"),
};

export default api;
