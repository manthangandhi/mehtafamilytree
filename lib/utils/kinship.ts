/**
 * Kinship / Relationship Path Algorithm
 * Computes human-readable relationship between two persons given persons + relationships data.
 * Supports father/mother/spouse/child + bidirectional.
 *
 * Examples: "Father", "Daughter", "Wife", "First Cousin", "Second Cousin once removed", "Great Uncle", "Not directly related"
 */

export interface PersonNode {
  id: string;
  full_name?: string | null;
  gender?: string | null;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
}

export interface RelationshipEdge {
  person_id: string;
  related_person_id: string;
  relationship_type: 'father' | 'mother' | 'spouse' | 'child' | 'sibling' | 'guardian' | 'other';
}

type Graph = Map<string, { parents: string[]; children: string[]; spouses: string[] }>;

function buildGraph(persons: PersonNode[], rels: RelationshipEdge[]): Graph {
  const g: Graph = new Map();

  persons.forEach(p => {
    g.set(p.id, { parents: [], children: [], spouses: [] });
  });

  // From explicit columns
  persons.forEach(p => {
    const entry = g.get(p.id)!;
    if (p.father_id && g.has(p.father_id)) {
      entry.parents.push(p.father_id);
      const f = g.get(p.father_id)!; f.children.push(p.id);
    }
    if (p.mother_id && g.has(p.mother_id)) {
      entry.parents.push(p.mother_id);
      const m = g.get(p.mother_id)!; m.children.push(p.id);
    }
    if (p.spouse_id && g.has(p.spouse_id)) {
      entry.spouses.push(p.spouse_id);
      const s = g.get(p.spouse_id)!; if (!s.spouses.includes(p.id)) s.spouses.push(p.id);
    }
  });

  // From relationships table (more flexible)
  rels.forEach(r => {
    const a = g.get(r.person_id);
    const b = g.get(r.related_person_id);
    if (!a || !b) return;

    if (r.relationship_type === 'spouse') {
      if (!a.spouses.includes(r.related_person_id)) a.spouses.push(r.related_person_id);
      if (!b.spouses.includes(r.person_id)) b.spouses.push(r.person_id);
    } else if (r.relationship_type === 'child') {
      // person_id = parent, related = child
      if (!a.children.includes(r.related_person_id)) a.children.push(r.related_person_id);
      if (!b.parents.includes(r.person_id)) b.parents.push(r.person_id);
    } else if (r.relationship_type === 'father' || r.relationship_type === 'mother') {
      if (!b.parents.includes(r.person_id)) b.parents.push(r.person_id);
      const arr = r.relationship_type === 'father' ? 'children' : 'children';
      if (!a[arr].includes(r.related_person_id)) a[arr].push(r.related_person_id);
    }
  });

  return g;
}

function getAncestorsWithDist(start: string, g: Graph): Map<string, number> {
  const dist = new Map<string, number>();
  const q: Array<{ id: string; d: number }> = [{ id: start, d: 0 }];
  const seen = new Set<string>();
  dist.set(start, 0);

  while (q.length) {
    const { id, d } = q.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    const node = g.get(id);
    if (!node) continue;

    for (const p of node.parents) {
      if (!dist.has(p) || dist.get(p)! > d + 1) {
        dist.set(p, d + 1);
        q.push({ id: p, d: d + 1 });
      }
    }
  }
  return dist;
}

function getGenerationLabel(distance: number, gender?: string | null): string {
  if (distance === 1) return gender === 'female' ? 'Mother' : gender === 'male' ? 'Father' : 'Parent';
  if (distance === 2) return gender === 'female' ? 'Grandmother' : gender === 'male' ? 'Grandfather' : 'Grandparent';
  if (distance === 3) return gender === 'female' ? 'Great Grandmother' : gender === 'male' ? 'Great Grandfather' : 'Great Grandparent';
  const greats = distance - 2;
  return `${greats}× Great ${gender === 'female' ? 'Grandmother' : gender === 'male' ? 'Grandfather' : 'Grandparent'}`;
}

function getChildLabel(distance: number, gender?: string | null): string {
  if (distance === 1) return gender === 'female' ? 'Daughter' : gender === 'male' ? 'Son' : 'Child';
  if (distance === 2) return gender === 'female' ? 'Granddaughter' : gender === 'male' ? 'Grandson' : 'Grandchild';
  if (distance === 3) return gender === 'female' ? 'Great Granddaughter' : gender === 'male' ? 'Great Grandson' : 'Great Grandchild';
  return `${distance - 2}× Great ${gender === 'female' ? 'Granddaughter' : gender === 'male' ? 'Grandson' : 'Grandchild'}`;
}

function cousinLabel(deg: number, removed: number): string {
  if (deg === 1 && removed === 0) return 'Sibling';
  if (deg === 1) return removed === 1 ? 'Uncle / Aunt' : `${removed}× Great Uncle / Aunt`;
  const ordinals = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
  const base = ordinals[deg] || `${deg}th`;
  if (removed === 0) return `${base} Cousin`;
  if (removed === 1) return `${base} Cousin once removed`;
  return `${base} Cousin ${removed} times removed`;
}

export function calculateRelationship(
  idA: string,
  idB: string,
  persons: PersonNode[],
  rels: RelationshipEdge[]
): string {
  if (!idA || !idB) return 'Unknown';
  if (idA === idB) return 'Self';

  const g = buildGraph(persons, rels);

  // Direct spouse?
  const aNode = g.get(idA);
  const bNode = g.get(idB);
  if (aNode && aNode.spouses.includes(idB)) {
    // Try to infer gender of B for "Husband/Wife"
    const bPerson = persons.find(p => p.id === idB);
    return bPerson?.gender === 'male' ? 'Husband' : bPerson?.gender === 'female' ? 'Wife' : 'Spouse';
  }

  // Direct parent/child via graph
  if (aNode && aNode.parents.includes(idB)) {
    const bP = persons.find(p => p.id === idB);
    return getGenerationLabel(1, bP?.gender);
  }
  if (aNode && aNode.children.includes(idB)) {
    const bP = persons.find(p => p.id === idB);
    return getChildLabel(1, bP?.gender);
  }

  const aAnc = getAncestorsWithDist(idA, g);
  const bAnc = getAncestorsWithDist(idB, g);

  // Find nearest common ancestor
  let common: string | null = null;
  let distUpA = 0;
  let distUpB = 0;

  // Prefer closer common ancestors
  const candidates: Array<{ id: string; da: number; db: number }> = [];
  for (const [id, da] of aAnc.entries()) {
    if (bAnc.has(id)) {
      candidates.push({ id, da, db: bAnc.get(id)! });
    }
  }
  if (candidates.length === 0) return 'Not directly related in the recorded tree';

  // Choose the one with smallest max dist (closest)
  candidates.sort((x, y) => Math.max(x.da, x.db) - Math.max(y.da, y.db) || (x.da + x.db) - (y.da + y.db));
  const best = candidates[0];
  common = best.id;
  distUpA = best.da;
  distUpB = best.db;

  const personB = persons.find(p => p.id === idB);

  // Direct ancestor case
  if (distUpA === 0) {
    return getGenerationLabel(distUpB, personB?.gender);
  }
  if (distUpB === 0) {
    return getChildLabel(distUpA, personB?.gender);
  }

  // Cousin case
  const cousinDegree = Math.min(distUpA, distUpB);
  const removed = Math.abs(distUpA - distUpB);
  return cousinLabel(cousinDegree, removed);
}

/** Convenience: find person by id */
export function getPersonName(id: string, persons: PersonNode[]): string {
  return persons.find(p => p.id === id)?.full_name || 'Unknown person';
}
