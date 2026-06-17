"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Position,
  Handle,
  Node,
  Edge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { createClient } from "../../lib/supabase/client";
import Image from "next/image";

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="relative px-5 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.07)] rounded-2xl bg-surface border border-border min-w-[210px] overflow-hidden group hover:shadow-lg hover:border-accent/40 transition-all duration-300">
      {/* Warm heritage gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      
      <Handle type="target" position={Position.Top} className="w-8 h-2 rounded-full !bg-accent border-none -top-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-center gap-3">
        {/* Avatar with elegant fallback to heritage tree image */}
        <div className="w-12 h-12 rounded-full bg-surface-hover border border-border flex items-center justify-center text-primary font-serif font-bold text-xl shadow-sm overflow-hidden flex-shrink-0 ring-1 ring-inset ring-white/60">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt={data.label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} />
          ) : (
            <Image src="/images/hero-tree.png" alt="Family tree" width={32} height={32} className="w-8 h-8 object-contain opacity-70" />
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="font-serif font-semibold text-foreground text-[17px] leading-tight tracking-[-0.1px] truncate">{data.label}</div>
          {data.role && (
            <div className="text-[10px] uppercase tracking-[1.5px] text-primary font-semibold mt-0.5 truncate">{data.role}</div>
          )}
          {data.household && (
            <div className="text-[11px] text-muted mt-1 flex items-center truncate">
              <svg className="w-3 h-3 mr-1 opacity-60 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="truncate font-medium">{data.household}</span>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-8 h-2 rounded-full !bg-primary border-none -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const nodeTypes = {
  person: CustomNode,
};

export default function FamilyTreeClient() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        // Fetch real data
        const { data: personsData, error: personsError } = await supabase.from('persons').select('*');
        const { data: householdsData, error: householdsError } = await supabase.from('households').select('*');
        const { data: relationsData, error: relationsError } = await supabase.from('relationships').select('*');
        
        let persons: any[] = personsData || [];
        let households: any[] = householdsData || [];
        let relations: any[] = relationsData || [];

        // NOTE: Mock data fallback has been removed.
        // The visualizer now only shows real data from the database.
        // If no data exists, an empty state will be shown below.

        const householdMap = households.reduce((acc: any, h: any) => {
          acc[h.id] = h.primary_member_name ? `${h.primary_member_name}'s Household` : h.household_code || 'Unknown Household';
          return acc;
        }, {});

        // Build adjacency lists for children and spouses
        const childrenMap: Record<string, string[]> = {};
        const parentsMap: Record<string, string[]> = {};
        const spouseMap: Record<string, string[]> = {};

        relations.forEach((rel: any) => {
          if (rel.relationship_type === 'child') {
            // person_id is parent, related_person_id is child
            if (!childrenMap[rel.person_id]) childrenMap[rel.person_id] = [];
            childrenMap[rel.person_id].push(rel.related_person_id);
            
            if (!parentsMap[rel.related_person_id]) parentsMap[rel.related_person_id] = [];
            parentsMap[rel.related_person_id].push(rel.person_id);
          } else if (rel.relationship_type === 'spouse') {
            if (!spouseMap[rel.person_id]) spouseMap[rel.person_id] = [];
            spouseMap[rel.person_id].push(rel.related_person_id);
          }
        });

        // Identify root nodes (people with no parents)
        const roots = persons.filter((p: any) => !parentsMap[p.id] || parentsMap[p.id].length === 0);
        
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const processed = new Set<string>();

        // Simple hierarchical layout variables
        const nodeWidth = 220;
        const nodeHeight = 150;
        const xGap = 40;
        const yGap = 80;

        // Level-based tracking to avoid overlaps
        const levelWidths: Record<number, number> = {};

        function plotTree(personId: string, level: number): number {
          if (processed.has(personId)) return levelWidths[level] || 0;
          processed.add(personId);

          const person = persons.find((p: any) => p.id === personId);
          if (!person) return 0;

          if (levelWidths[level] === undefined) levelWidths[level] = 0;
          
          let myX = levelWidths[level];
          const spouses = spouseMap[personId] || [];
          
          // Allocate space for self + spouses
          levelWidths[level] += nodeWidth + xGap;
          
          // Plot self
          newNodes.push({
            id: person.id.toString(),
            type: 'person',
            position: { x: myX, y: level * (nodeHeight + yGap) },
            data: {
              label: person.full_name || 'Unknown',
              role: '',
              household: person.household_id ? householdMap[person.household_id] : '',
              avatar_url: person.avatar_url,
            },
          });

          // Plot spouses on the same level next to self
          spouses.forEach(spouseId => {
            if (!processed.has(spouseId)) {
              processed.add(spouseId);
              const spouse = persons.find((p: any) => p.id === spouseId);
              if (spouse) {
                const spouseX = levelWidths[level];
                levelWidths[level] += nodeWidth + xGap;
                newNodes.push({
                  id: spouse.id.toString(),
                  type: 'person',
                  position: { x: spouseX, y: level * (nodeHeight + yGap) },
                  data: {
                    label: spouse.full_name || 'Unknown',
                    role: 'Spouse',
                    household: spouse.household_id ? householdMap[spouse.household_id] : '',
                    avatar_url: spouse.avatar_url,
                  },
                });
                
                // Edge between spouses
                newEdges.push({
                  id: `e-spouse-${personId}-${spouseId}`,
                  source: personId.toString(),
                  target: spouseId.toString(),
                  type: 'straight',
                  animated: false,
                  style: { stroke: '#C8A97E', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.7 },
                });
              }
            }
          });

          // Recursively plot children
          const children = childrenMap[personId] || [];
          children.forEach(childId => {
            // Edges to children
            newEdges.push({
              id: `e-child-${personId}-${childId}`,
              source: personId.toString(),
              target: childId.toString(),
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'url(#edge-gradient)', strokeWidth: 3 },
            });
            plotTree(childId, level + 1);
          });

          return myX;
        }

        // Plot all distinct family trees (roots) side by side
        roots.forEach((root: any) => {
           // Find the maximum level width so far, so distinct trees don't overlap horizontally
           const maxExistingWidth = Math.max(0, ...Object.values(levelWidths));
           // Fast-forward all levels to the max width to create a "column" for this new tree
           Object.keys(levelWidths).forEach(lvl => {
             levelWidths[parseInt(lvl)] = maxExistingWidth + 100;
           });
           
           plotTree(root.id, 0);
        });

        // Process any orphans/disconnected nodes
        persons.forEach((p: any) => {
          if (!processed.has(p.id)) {
            const maxExistingWidth = Math.max(0, ...Object.values(levelWidths));
             Object.keys(levelWidths).forEach(lvl => {
               levelWidths[parseInt(lvl)] = maxExistingWidth + 100;
             });
            plotTree(p.id, 0);
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error("Error fetching family tree data:", err);
        // Leave nodes/edges empty on error - no mock data
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-foreground/95">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-white/60 text-sm">Loading our family connections across households...</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="text-center max-w-md px-6">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-surface-hover border border-border flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/>
            </svg>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">No lineage data yet</h3>
          <p className="text-muted mb-6">
            The interactive tree will appear here once real family members and relationships are added to the database.
          </p>
          <div className="text-xs text-muted">
            Admins can add households and persons via the admin panel.<br />
            Real data only — no demo placeholders.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SVG Defs for Edge Gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8A97E" />
            <stop offset="100%" stopColor="#0B2E24" />
          </linearGradient>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-surface"
      >
        <Background color="#e6dfd4" gap={16} />
        <MiniMap 
          nodeColor={() => '#0B2E24'}
          maskColor="rgba(255, 252, 247, 0.8)"
          style={{ backgroundColor: '#fffcf7', border: '1px solid #e6dfd4' }}
        />
        <Controls style={{ backgroundColor: '#fffcf7', fill: '#0B2E24', border: '1px solid #e6dfd4' }} />
      </ReactFlow>
    </>
  );
}
