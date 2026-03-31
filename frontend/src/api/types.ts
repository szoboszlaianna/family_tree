export type UUID = string;

export interface Person {
  id: UUID;
  name: string;
  date_of_birth: string;
  place_of_birth?: string | null;
  created_at: string;
}

export interface PersonCreate {
  name: string;
  date_of_birth: string;
  place_of_birth?: string | null;
}

export interface Relationship {
  parent_id: UUID;
  child_id: UUID;
  created_at: string;
}

export interface TreeView {
  people: Person[];
  relationships: Relationship[];
  root_ids: UUID[];
}
