import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { peopleApi, relationshipApi, treeApi } from "./client";
import type { PersonCreate, UUID } from "./types";

// Query keys
export const queryKeys = {
  all: ["api"] as const,
  people: ["api", "people"] as const,
  person: (id: UUID) => ["api", "people", id] as const,
  relationships: ["api", "relationships"] as const,
  tree: ["api", "tree"] as const,
};

// People queries
export const usePeopleList = () => {
  return useQuery({
    queryKey: queryKeys.people,
    queryFn: async () => {
      const response = await peopleApi.list();
      return response.data;
    },
  });
};

export const usePerson = (id: UUID | null) => {
  return useQuery({
    queryKey: id ? queryKeys.person(id) : ["disabled"],
    queryFn: async () => {
      if (!id) return null;
      const response = await peopleApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonCreate) => peopleApi.create(data),
    onSuccess: (response) => {
      // Invalidate people list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.people });
      // Invalidate tree to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      return response.data;
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => peopleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
    },
  });
};

// Relationship mutations
export const useCreateRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { parentId: UUID; childId: UUID }) =>
      relationshipApi.create(vars.parentId, vars.childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
    },
  });
};

export const useDeleteRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { parentId: UUID; childId: UUID }) =>
      relationshipApi.delete(vars.parentId, vars.childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
    },
  });
};

// Tree query
export const useTree = () => {
  return useQuery({
    queryKey: queryKeys.tree,
    queryFn: async () => {
      const response = await treeApi.get();
      return response.data;
    },
  });
};
