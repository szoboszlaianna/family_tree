# API Integration Guide

Your frontend is now configured with a complete API integration layer for communicating with the FastAPI backend.

## Architecture

### Files Created:

1. **`src/api/types.ts`** - TypeScript types matching your backend models
   - `Person`, `PersonCreate`, `Relationship`, `TreeView`, `UUID`

2. **`src/api/client.ts`** - Axios HTTP client with pre-configured endpoints
   - `peopleApi` - CRUD operations for people
   - `relationshipApi` - Create/delete relationships
   - `treeApi` - Fetch complete tree view
   - Uses `VITE_API_URL` environment variable (defaults to `http://127.0.0.1:8000`)

3. **`src/api/hooks.ts`** - React Query custom hooks
   - `usePeopleList()` - Fetch all people
   - `usePerson(id)` - Fetch single person
   - `useCreatePerson()` - Create new person (mutation)
   - `useDeletePerson()` - Delete person (mutation)
   - `useCreateRelationship()` - Create parent-child link (mutation)
   - `useDeleteRelationship()` - Delete relationship (mutation)
   - `useTree()` - Fetch complete tree with people, relationships, and root IDs

4. **`src/lib/queryClient.ts`** - React Query configuration
   - 5 minute stale time
   - 10 minute garbage collection time
   - Auto-refetch on error and focus

5. **`src/App.tsx`** - Updated to wrap app with `QueryClientProvider`

## Environment Setup

Create a `.env` file in the `frontend/` directory:

```
VITE_API_URL=http://127.0.0.1:8000
```

The `.env.example` file shows the available variables.

## Usage Examples

### Fetching People

```typescript
import { usePeopleList } from '@/api/hooks';

function PeopleList() {
  const { data: people, isLoading, error } = usePeopleList();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {people?.map((person) => (
        <li key={person.id}>{person.name} ({person.date_of_birth})</li>
      ))}
    </ul>
  );
}
```

### Creating a Person

```typescript
import { useCreatePerson } from '@/api/hooks';

function CreatePersonForm() {
  const { mutate, isPending, error } = useCreatePerson();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    mutate({
      name: formData.get('name') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      place_of_birth: formData.get('place_of_birth') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="date_of_birth" type="date" required />
      <input name="place_of_birth" />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Person'}
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
}
```

### Viewing the Tree

```typescript
import { useTree } from '@/api/hooks';

function FamilyTree() {
  const { data: treeView, isLoading, error } = useTree();

  if (isLoading) return <p>Loading tree...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>People: {treeView?.people.length}</h2>
      <h2>Relationships: {treeView?.relationships.length}</h2>
      <h2>Root People: {treeView?.root_ids.length}</h2>
    </div>
  );
}
```

### Creating Relationships

```typescript
import { useCreateRelationship } from '@/api/hooks';

function LinkFamilyMembers() {
  const { mutate, isPending, error } = useCreateRelationship();

  const handleLink = () => {
    mutate({
      parentId: 'parent-uuid-here',
      childId: 'child-uuid-here',
    });
  };

  return (
    <div>
      <button onClick={handleLink} disabled={isPending}>
        Link Parent to Child
      </button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

## Key Features

- **Type-safe**: Full TypeScript support with types matching your backend
- **Automatic caching**: React Query caches data and reuses fresh results
- **Error handling**: Built-in error states for all queries and mutations
- **Auto-refetch**: Queries automatically refetch on specific triggers
- **Optimistic updates**: Mutations can be configured for optimistic UI updates
- **Environment variables**: Easy configuration for different API endpoints

## Running the Frontend

```bash
cd frontend
npm run dev
```

The dev server runs on `http://localhost:5173` by default. Make sure your FastAPI backend is running on `http://127.0.0.1:8000`.

## Next Steps

- Create pages for displaying people and relationships
- Build a form for creating new family members
- Implement the tree visualization component (React Flow or custom)
- Add error boundaries and better error messaging
- Consider adding authentication if needed
