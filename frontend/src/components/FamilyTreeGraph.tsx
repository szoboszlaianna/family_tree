import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Edge,
  type Node,
} from "reactflow";
import { useTree } from "../api/hooks";

const HORIZONTAL_GAP = 220;
const VERTICAL_GAP = 140;

type LayoutResult = {
  nodes: Node[];
  edges: Edge[];
};

function buildLayout(
  treeData: NonNullable<ReturnType<typeof useTree>["data"]>,
): LayoutResult {
  const personMap = new Map(
    treeData.people.map((person) => [person.id, person]),
  );
  const relationships = treeData.relationships.filter(
    (relationship) =>
      personMap.has(relationship.parent_id) &&
      personMap.has(relationship.child_id),
  );

  const childrenByParent = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const person of treeData.people) {
    indegree.set(person.id, 0);
    childrenByParent.set(person.id, []);
  }

  for (const relationship of relationships) {
    childrenByParent.get(relationship.parent_id)?.push(relationship.child_id);
    indegree.set(
      relationship.child_id,
      (indegree.get(relationship.child_id) ?? 0) + 1,
    );
  }

  const apiRoots = treeData.root_ids.filter((id) => personMap.has(id));
  const topoRoots = [...indegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id);
  const queue = (apiRoots.length > 0 ? apiRoots : topoRoots).slice();

  if (queue.length === 0) {
    queue.push(...treeData.people.map((person) => person.id));
  }

  const levelById = new Map<string, number>();
  for (const id of queue) {
    levelById.set(id, 0);
  }

  while (queue.length > 0) {
    const parentId = queue.shift();
    if (!parentId) continue;

    const parentLevel = levelById.get(parentId) ?? 0;
    const children = childrenByParent.get(parentId) ?? [];

    for (const childId of children) {
      const nextLevel = parentLevel + 1;
      const existingLevel = levelById.get(childId);

      if (existingLevel === undefined || nextLevel > existingLevel) {
        levelById.set(childId, nextLevel);
      }

      const nextInDegree = (indegree.get(childId) ?? 1) - 1;
      indegree.set(childId, nextInDegree);
      if (nextInDegree === 0) {
        queue.push(childId);
      }
    }
  }

  const levelGroups = new Map<number, string[]>();
  for (const person of treeData.people) {
    const level = levelById.get(person.id) ?? 0;
    const existing = levelGroups.get(level) ?? [];
    existing.push(person.id);
    levelGroups.set(level, existing);
  }

  const sortedLevels = [...levelGroups.keys()].sort((a, b) => a - b);

  const nodes: Node[] = [];
  for (const level of sortedLevels) {
    const idsAtLevel = levelGroups.get(level) ?? [];
    idsAtLevel.sort((a, b) => {
      const personA = personMap.get(a);
      const personB = personMap.get(b);
      return (personA?.name ?? "").localeCompare(personB?.name ?? "");
    });

    const startX = -((idsAtLevel.length - 1) * HORIZONTAL_GAP) / 2;
    idsAtLevel.forEach((id, index) => {
      const person = personMap.get(id);
      if (!person) return;

      nodes.push({
        id,
        position: {
          x: startX + index * HORIZONTAL_GAP,
          y: level * VERTICAL_GAP,
        },
        data: {
          label: (
            <div className="min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-sm">
              <p className="m-0 text-sm font-semibold text-slate-800">
                {person.name}
              </p>
              <p className="m-0 text-xs text-slate-600">
                Date of birth: {person.date_of_birth}
              </p>
            </div>
          ),
        },
        draggable: false,
      });
    });
  }

  const edges: Edge[] = relationships.map((relationship) => ({
    id: `${relationship.parent_id}-${relationship.child_id}`,
    source: relationship.parent_id,
    target: relationship.child_id,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: "#0f766e",
    },
    style: {
      stroke: "#0f766e",
      strokeWidth: 1.6,
    },
  }));

  return { nodes, edges };
}

export function FamilyTreeGraph() {
  const { data, isLoading, error, refetch } = useTree();

  const { nodes, edges } = useMemo(() => {
    if (!data) {
      return { nodes: [], edges: [] };
    }

    return buildLayout(data);
  }, [data]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(4,55,50,0.06)]">
      <div className="mb-3.5 flex items-center justify-between gap-2.5">
        <h2>Family Tree Graph</h2>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 active:translate-y-px"
        >
          Refresh Tree
        </button>
      </div>

      {isLoading && <p className="text-slate-600">Loading tree...</p>}
      {error && (
        <p className="m-0 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
          Tree fetch failed: {error.message}
        </p>
      )}

      {!isLoading && !error && data && data.people.length === 0 && (
        <p className="text-slate-600">
          No people in tree yet. Add people and relationships above.
        </p>
      )}

      {!isLoading && !error && data && data.people.length > 0 && (
        <div className="h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            minZoom={0.3}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <MiniMap
              pannable
              zoomable
              nodeColor="#0f766e"
              maskColor="rgba(15, 118, 110, 0.08)"
            />
            <Controls showInteractive={false} />
            <Background color="#d7e9e8" gap={18} />
          </ReactFlow>
        </div>
      )}
    </section>
  );
}
