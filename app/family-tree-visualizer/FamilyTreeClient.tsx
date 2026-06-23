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
import dagre from 'dagre';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 120 });

  const spouseEdges = edges.filter(e => e.data?.type === 'spouse');
  const bloodlineEdges = edges.filter(e => e.data?.type !== 'spouse');

  const bloodlineNodeIds = new Set<string>();
  bloodlineEdges.forEach(e => {
     bloodlineNodeIds.add(e.source);
     bloodlineNodeIds.add(e.target);
  });

  const attachedSpouses = new Map<string, string[]>();
  const processedSpouses = new Set<string>();

  spouseEdges.forEach(e => {
     const sourceBlood = bloodlineNodeIds.has(e.source);
     const targetBlood = bloodlineNodeIds.has(e.target);
     
     if (sourceBlood && targetBlood) {
        // If both are in the bloodline tree independently, let dagre handle them
        return;
     }

     let anchor = e.source;
     let spouse = e.target;
     
     if (targetBlood && !sourceBlood) {
        anchor = e.target;
        spouse = e.source;
     } else if (!sourceBlood && !targetBlood) {
        bloodlineNodeIds.add(e.source); // make source the anchor arbitrarily
     }
     
     if (!attachedSpouses.has(anchor)) attachedSpouses.set(anchor, []);
     attachedSpouses.get(anchor)!.push(spouse);
     processedSpouses.add(spouse);
  });

  const nodeWidth = 280;
  const nodeHeight = 120;
  
  nodes.forEach((node) => {
     if (!processedSpouses.has(node.id)) {
        const spouses = attachedSpouses.get(node.id) || [];
        // Expand width of anchor node to accommodate spouses so Dagre routes around them
        dagreGraph.setNode(node.id, { width: nodeWidth + (spouses.length * 310), height: nodeHeight });
     }
  });

  bloodlineEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { minlen: 1 });
  });

  // Also pass un-grouped spouse edges to dagre
  spouseEdges.forEach((edge) => {
     if (!processedSpouses.has(edge.source) && !processedSpouses.has(edge.target)) {
         dagreGraph.setEdge(edge.source, edge.target, { minlen: 1 });
     }
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const newNode = { ...node };
    newNode.targetPosition = Position.Top;
    newNode.sourcePosition = Position.Bottom;
    return newNode;
  });

  // Assign positions
  newNodes.forEach((node) => {
     if (!processedSpouses.has(node.id)) {
        const nodeWithPosition = dagreGraph.node(node.id);
        const spousesCount = attachedSpouses.get(node.id)?.length || 0;
        const totalWidth = 280 + (spousesCount * 310);
        
        const startX = nodeWithPosition.x - totalWidth / 2;
        node.position = { x: startX, y: nodeWithPosition.y - 120 / 2 };

        // Position attached spouses
        if (spousesCount > 0) {
            const spouses = attachedSpouses.get(node.id)!;
            spouses.forEach((spouseId, index) => {
               const spouseNode = newNodes.find(n => n.id === spouseId);
               if (spouseNode) {
                  spouseNode.position = {
                     x: startX + ((index + 1) * 310),
                     y: nodeWithPosition.y - 120 / 2
                  };
               }
            });
        }
     }
  });

  return { nodes: newNodes, edges };
};

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="relative px-5 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.07)] rounded-2xl bg-surface border border-border w-[280px] overflow-hidden group hover:shadow-lg hover:border-accent/80 hover:ring-2 hover:ring-accent/20 cursor-pointer transition-all duration-300">
      {/* Warm heritage gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
      
      <Handle type="target" position={Position.Top} className="w-8 h-2 rounded-full !bg-accent border-none -top-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-center gap-3">
        {/* Avatar with elegant fallback */}
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
          {data.relationship && (
            <div className="text-[10px] uppercase tracking-[1px] text-accent font-bold mt-0.5 truncate bg-accent/10 w-fit px-1.5 py-0.5 rounded">{data.relationship}</div>
          )}
          {data.household && (
            <div className="text-[11px] text-muted mt-1 flex items-center truncate">
              <svg className="w-3 h-3 mr-1 opacity-60 flex-shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        const { data: personsData } = await supabase.from('persons').select('*');
        const { data: householdsData } = await supabase.from('households').select('*');
        const { data: relationsData } = await supabase.from('relationships').select('*');
        const { data: membersData } = await supabase.from('household_members').select('*');
        
        let persons: any[] = personsData || [];
        let households: any[] = householdsData || [];
        let relations: any[] = relationsData || [];
        let members: any[] = membersData || [];

        const householdMap = households.reduce((acc: any, h: any) => {
          acc[h.id] = h.primary_member_name ? `${h.primary_member_name}'s Household` : h.household_code || 'Unknown Household';
          return acc;
        }, {});

        const rawNodes: Node[] = [];
        const rawEdges: Edge[] = [];

        const personRelMap: Record<string, string> = {};
        members.forEach((m: any) => {
          if (m.relationship_to_head) {
             personRelMap[m.person_id] = m.relationship_to_head;
          }
        });

        persons.forEach((person) => {
           let relText = personRelMap[person.id] || '';
           if (relText === 'SELF') relText = 'HEAD';
           
           rawNodes.push({
             id: person.id.toString(),
             type: 'person',
             position: { x: 0, y: 0 },
             data: {
               label: person.full_name || 'Unknown',
               role: person.generation_level ? `Generation ${person.generation_level}` : '',
               relationship: relText,
               household: person.household_id ? householdMap[person.household_id] : '',
               avatar_url: person.avatar_url,
               full_data: person
             }
           });
        });

        // Infer edges from relationships
        relations.forEach(rel => {
            if (rel.relationship_type === 'child') {
                rawEdges.push({
                  id: `e-child-${rel.person_id}-${rel.related_person_id}`,
                  source: rel.person_id.toString(),
                  target: rel.related_person_id.toString(),
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'url(#edge-gradient)', strokeWidth: 3 },
                });
            } else if (rel.relationship_type === 'spouse') {
                if (rel.person_id < rel.related_person_id) {
                    rawEdges.push({
                      id: `e-spouse-${rel.person_id}-${rel.related_person_id}`,
                      source: rel.person_id.toString(),
                      target: rel.related_person_id.toString(),
                      type: 'straight',
                      animated: false,
                      data: { type: 'spouse' },
                      style: { stroke: '#C8A97E', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.8 },
                    });
                }
            }
        });

        // Infer from members if missing
        const householdHeadMap: Record<string, string> = {};
        members.forEach((m: any) => {
          if (m.is_primary || m.relationship_to_head === 'SELF') {
            householdHeadMap[m.household_id] = m.person_id;
          }
        });

        members.forEach((m: any) => {
          const headId = householdHeadMap[m.household_id];
          if (!headId || headId === m.person_id) return;
          const relType = m.relationship_to_head?.toUpperCase() || '';
          
          if (relType === 'SON' || relType === 'DAUGHTER' || relType === 'CHILD') {
             // head is parent
             const edgeId = `e-child-${headId}-${m.person_id}`;
             if (!rawEdges.find(e => e.id === edgeId)) {
                rawEdges.push({
                  id: edgeId,
                  source: headId.toString(),
                  target: m.person_id.toString(),
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'url(#edge-gradient)', strokeWidth: 3 },
                });
             }
          } else if (relType === 'MOTHER' || relType === 'FATHER' || relType === 'PARENT') {
             // m.person_id is parent
             const edgeId = `e-child-${m.person_id}-${headId}`;
             if (!rawEdges.find(e => e.id === edgeId)) {
                rawEdges.push({
                  id: edgeId,
                  source: m.person_id.toString(),
                  target: headId.toString(),
                  type: 'smoothstep',
                  animated: true,
                  style: { stroke: 'url(#edge-gradient)', strokeWidth: 3 },
                });
             }
          } else if (relType === 'WIFE' || relType === 'HUSBAND' || relType === 'SPOUSE') {
             const min = headId < m.person_id ? headId : m.person_id;
             const max = headId > m.person_id ? headId : m.person_id;
             const edgeId = `e-spouse-${min}-${max}`;
             if (!rawEdges.find(e => e.id === edgeId)) {
                 rawEdges.push({
                    id: edgeId,
                    source: min.toString(),
                    target: max.toString(),
                    type: 'straight',
                    animated: false,
                    data: { type: 'spouse' },
                    style: { stroke: '#C8A97E', strokeWidth: 2, strokeDasharray: '5,5', opacity: 0.8 },
                 });
             }
          } else if (relType === 'DAUGHTER-IN-LAW' || relType === 'SON-IN-LAW' || relType === 'DAUGHTER IN LAW' || relType === 'SON IN LAW') {
             // Link to the head with a dashed in-law edge so they aren't floating
             // ONLY if they don't already have an explicit spouse link in the database!
             const hasSpouseEdge = rawEdges.some(e => e.data?.type === 'spouse' && (e.source === m.person_id.toString() || e.target === m.person_id.toString()));
             
             if (!hasSpouseEdge) {
                 const edgeId = `e-inlaw-${headId}-${m.person_id}`;
                 if (!rawEdges.find(e => e.id === edgeId)) {
                     rawEdges.push({
                        id: edgeId,
                        source: headId.toString(),
                        target: m.person_id.toString(),
                        type: 'smoothstep',
                        animated: true,
                        style: { stroke: '#C8A97E', strokeWidth: 2, strokeDasharray: '4,4', opacity: 0.6 },
                        // Label removed because it's now on the card itself
                     });
                 }
             }
          }
        });

        if (rawNodes.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
      } catch (err) {
        console.error("Error fetching family tree data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
     setSelectedPerson(node.data.full_data);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background">
        <BrandLoader text="Loading your lineage..." />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <EmptyState 
           title="No lineage data yet"
           description="The interactive tree will appear here once family members and relationships are added."
           action={
             <div className="text-xs text-muted">
               Real data only — no demo placeholders.
             </div>
           }
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-140px)] flex bg-background">
      {/* SVG Defs for Edge Gradients */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8A97E" />
            <stop offset="100%" stopColor="#0B2E24" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="flex-1 h-full relative border-r border-border/50">
          <div className="absolute top-4 left-4 z-10 premium-card bg-surface/90 backdrop-blur-md p-3 text-xs font-semibold text-primary flex items-center gap-2 border-accent/20">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
              Interactive Mode
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            className="bg-noise"
          >
            <Background color="#e6dfd4" gap={16} />
            <MiniMap 
              nodeColor={() => '#0B2E24'}
              maskColor="rgba(255, 252, 247, 0.8)"
              style={{ backgroundColor: '#fffcf7', border: '1px solid #e6dfd4', borderRadius: '12px' }}
            />
            <Controls style={{ backgroundColor: '#fffcf7', fill: '#0B2E24', border: '1px solid #e6dfd4', borderRadius: '8px', overflow: 'hidden' }} />
          </ReactFlow>
      </div>

      {/* Slide-over Profile Panel */}
      {selectedPerson && (
          <div className="w-80 bg-surface h-full shadow-[-10px_0_30px_rgba(0,0,0,0.05)] flex flex-col animate-fade-in relative z-20 border-l border-border">
             <button 
                onClick={() => setSelectedPerson(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-hover text-muted hover:text-foreground transition-colors border border-border"
             >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
             
             <div className="p-8 flex flex-col items-center border-b border-border/50 bg-gradient-to-b from-surface to-surface-hover/30">
                 <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-surface-hover flex items-center justify-center ring-1 ring-accent/30 mb-4">
                     {selectedPerson.avatar_url ? (
                        <img src={selectedPerson.avatar_url} alt="Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/hero-tree.png'; }} />
                     ) : (
                        <Image src="/images/hero-tree.png" alt="Fallback" width={48} height={48} className="opacity-50" />
                     )}
                 </div>
                 <h2 className="font-serif text-2xl font-bold text-foreground text-center leading-tight mb-1">{selectedPerson.full_name}</h2>
                 {selectedPerson.generation_level && (
                    <span className="px-3 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-full uppercase tracking-wider mb-2">Generation {selectedPerson.generation_level}</span>
                 )}
                 {selectedPerson.is_alive === false && (
                    <span className="text-xs font-semibold text-muted tracking-wider uppercase bg-surface-hover px-2 py-0.5 rounded">Late</span>
                 )}
             </div>

             <div className="p-6 flex-1 overflow-y-auto space-y-6">
                 <div>
                    <h4 className="text-xs uppercase tracking-widest text-muted font-bold mb-2">Contact Details</h4>
                    {selectedPerson.mobile_number ? (
                        <p className="text-sm font-medium">{selectedPerson.mobile_number}</p>
                    ) : (
                        <p className="text-sm text-muted italic">Not provided</p>
                    )}
                 </div>

                 {selectedPerson.bio && (
                     <div>
                        <h4 className="text-xs uppercase tracking-widest text-muted font-bold mb-2">Biography</h4>
                        <p className="text-sm text-muted leading-relaxed">{selectedPerson.bio}</p>
                     </div>
                 )}

                 {selectedPerson.household_id && (
                     <div className="pt-4 border-t border-border/50">
                        <Link href={`/households/${selectedPerson.household_id}`} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-accent/40 bg-surface-hover group transition-colors">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">Household</span>
                              <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">View Family Unit</span>
                           </div>
                           <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </Link>
                     </div>
                 )}
             </div>
          </div>
      )}
    </div>
  );
}
