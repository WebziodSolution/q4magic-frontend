

import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';

import Components from '../../../components/muiComponents/components';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import Button from '../../common/buttons/button';
import { getReportHierarch } from '../../../service/contact/contactService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

/** Person card */
const OrgCard = ({ name = 'Unknown', title }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="relative w-[260px] max-w-[85vw] rounded-2xl border border-[#7413D133] bg-white/90 backdrop-blur shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[#242424] truncate">{name}</div>
          {title ? <div className="text-xs text-[#6b7280] truncate">{title}</div> : null}
        </div>
      </div>
    </div>
  );
};

/** Dotted background */
const GridBack = ({ children }) => (
  <div
    className="relative min-h-[400px]"
    style={{
      backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
      color: 'rgba(0,0,0,0.14)',
      backgroundSize: '16px 16px',
    }}
  >
    <div className="absolute inset-0 bg-white/70 pointer-events-none" />
    <div className="relative h-full">{children}</div>
  </div>
);

/** Recursive tree renderer (expects node.children as an array) */
const TreeNode = ({ node, level = 0 }) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node */}
      <div className="relative">
        <OrgCard name={node.name} title={node.title} />

        {/* Arrow from parent */}
        {level > 0 && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-px h-4 bg-[#7413D1] opacity-50" />
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <CustomIcons iconName="fa-solid fa-caret-down" css="text-[#7413D1] w-4 h-4 opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="relative mt-8">
          {/* Vertical from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
          <div className="relative flex justify-center">
            {/* Horizontal connector */}
            <div className="absolute top-8 left-0 right-0 h-px bg-[#7413D1] opacity-30" />
            <div className="flex flex-wrap justify-center gap-8 relative pt-8">
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Up connector into child */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#7413D1] opacity-30" />
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrgTreeView = ({ root }) => {
  if (!root) {
    return <div className="py-10 text-center text-sm text-gray-500">No hierarchy found.</div>;
  }
  return (
    <div className="w-full flex justify-center">
      <TreeNode node={root} />
    </div>
  );
};

/** Normalize API node: convert children:null -> [] and recurse */
const normalizeTree = (node) => {
  if (!node) return null;
  const norm = {
    id: node.id,
    name: node.name,
    title: node.title,
    imageUrl: node.imageUrl,
    children: Array.isArray(node.children)
      ? node.children.map(normalizeTree).filter(Boolean)
      : [], // children:null becomes []
  };
  return norm;
};

function ContactReportHierarch({ open, handleClose, contactId }) {
  const theme = useTheme();
  const [root, setRoot] = useState(null);
  const [loading, setLoading] = useState(false);

  const onClose = () => handleClose();

  useEffect(() => {
    const handleGetData = async () => {
      if (!open || !contactId) return;
      try {
        setLoading(true);
        const res = await getReportHierarch(contactId);
        const data = res?.result ?? res; // supports either shape
        const tree = normalizeTree(data);
        setRoot(tree);
      } catch (e) {
        console.error(e);
        setRoot(null);
      } finally {
        setLoading(false);
      }
    };
    handleGetData();
  }, [open, contactId]);

  return (
    <>
      <BootstrapDialog
      onClose={(event, reason) => handleRequestClose(event, reason, onClose)}
        open={open}
        aria-labelledby="contact-hierarch-title"
        fullWidth
        maxWidth="md"
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
      >
        <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="contact-hierarch-title">
          Contact Report Hierarchy
        </Components.DialogTitle>

        <Components.IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.primary.icon,
          })}
        >
          <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black w-5 h-5" />
        </Components.IconButton>

        <Components.DialogContent dividers>
          <div className="relative">
            <div className="overflow-auto max-h-[70vh]">
              <GridBack>
                <div className="min-w-[360px]">
                  {loading ? (
                    <div className="py-16 flex items-center justify-center text-gray-500">
                      <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="w-5 h-5 mr-2" />
                      Loading organization chart…
                    </div>
                  ) : (
                    <OrgTreeView root={root} />
                  )}
                </div>
              </GridBack>
            </div>
          </div>
        </Components.DialogContent>

        <Components.DialogActions>
          <div className="flex justify-end items-center gap-4">
            <Button type="button" text="Close" useFor="disabled" onClick={onClose} startIcon={<CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer mr-2' />} />
          </div>
        </Components.DialogActions>
      </BootstrapDialog>
    </>
  );
}

export default ContactReportHierarch;




// import React, { useEffect, useState, useCallback } from 'react';
// import { styled, useTheme } from '@mui/material/styles';

// // Import ReactFlow
// import {
//   ReactFlow,
//   Controls,
//   Background,
//   MiniMap,
//   useNodesState,
//   useEdgesState,
//   MarkerType
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// import Components from '../../../components/muiComponents/components';
// import CustomIcons from '../../../components/common/icons/CustomIcons';
// import Button from '../../common/buttons/button';
// import { getReportHierarch } from '../../../service/contact/contactService';

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//   '& .MuiDialogContent-root': { padding: theme.spacing(2) },
//   '& .MuiDialogActions-root': { padding: theme.spacing(1) },
// }));

// /** Person node component for ReactFlow */
// const PersonNode = ({ data }) => {
//   const { name, title } = data;
  
//   const initials = name
//     .split(' ')
//     .filter(Boolean)
//     .map(p => p[0]?.toUpperCase())
//     .slice(0, 2)
//     .join('');

//   return (
//     <div className="w-[200px] rounded-2xl border-2 border-[#7413D1] bg-white shadow-lg p-4 hover:shadow-xl transition-all duration-200">
//       <div className="flex items-center gap-3">
//         <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
//           {initials}
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="font-semibold text-[#242424] truncate">{name}</div>
//           {title && (
//             <div className="text-xs text-[#6b7280] truncate mt-1">{title}</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /** Convert tree data to ReactFlow nodes and edges with proper tree layout */
// const convertTreeToFlowElements = (treeData) => {
//   if (!treeData) return { nodes: [], edges: [] };

//   const nodes = [];
//   const edges = [];
  
//   // Store nodes by level for layout calculations
//   const nodesByLevel = new Map();
  
//   // First pass: calculate tree structure and collect nodes by level
//   const traverse = (node, level = 0, parentId = null) => {
//     const nodeId = String(node.id);
    
//     if (!nodesByLevel.has(level)) {
//       nodesByLevel.set(level, []);
//     }
//     nodesByLevel.get(level).push({ node, nodeId, parentId });
    
//     if (node.children && node.children.length > 0) {
//       node.children.forEach((child) => {
//         traverse(child, level + 1, nodeId);
//       });
//     }
//   };
  
//   traverse(treeData);
  
//   // Calculate positions for each level
//   const HORIZONTAL_SPACING = 250;
//   const VERTICAL_SPACING = 180;
//   const START_Y = 50;
  
//   // Position nodes level by level from bottom up
//   const maxLevel = Math.max(...nodesByLevel.keys());
  
//   for (let level = maxLevel; level >= 0; level--) {
//     const levelNodes = nodesByLevel.get(level) || [];
    
//     levelNodes.forEach((item, index) => {
//       const { node, nodeId, parentId } = item;
//       let x = 0;
//       let y = START_Y + (level * VERTICAL_SPACING);
      
//       // Position based on children (if any) or siblings
//       const children = node.children || [];
      
//       if (children.length > 0) {
//         // Get all child node positions
//         const childNodes = children.map(child => {
//           const childNode = nodes.find(n => n.id === String(child.id));
//           return childNode;
//         }).filter(Boolean);
        
//         if (childNodes.length > 0) {
//           // Center parent above children
//           const minChildX = Math.min(...childNodes.map(c => c.position.x));
//           const maxChildX = Math.max(...childNodes.map(c => c.position.x));
//           x = (minChildX + maxChildX) / 2;
//         } else {
//           // Fallback for when children aren't positioned yet
//           x = index * HORIZONTAL_SPACING - ((levelNodes.length - 1) * HORIZONTAL_SPACING) / 2;
//         }
//       } else {
//         // Leaf node - position based on siblings
//         x = index * HORIZONTAL_SPACING - ((levelNodes.length - 1) * HORIZONTAL_SPACING) / 2;
//       }
      
//       // Create node
//       nodes.push({
//         id: nodeId,
//         type: 'person',
//         position: { x, y },
//         data: {
//           name: node.name,
//           title: node.title,
//         },
//         draggable: false,
//         selectable: true,
//       });
      
//       // Create edge to parent
//       if (parentId) {
//         edges.push({
//           id: `edge-${parentId}-${nodeId}`,
//           source: parentId,
//           target: nodeId,
//           type: 'smoothstep',
//           animated: false,
//           style: {
//             stroke: '#7413D1',
//             strokeWidth: 2,
//           },
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             color: '#7413D1',
//             width: 20,
//             height: 20,
//           },
//         });
//       }
//     });
//   }
  
//   // Center the entire tree horizontally
//   if (nodes.length > 0) {
//     const minX = Math.min(...nodes.map(n => n.position.x));
//     const maxX = Math.max(...nodes.map(n => n.position.x));
//     const centerX = (minX + maxX) / 2;
    
//     nodes.forEach(node => {
//       node.position.x -= centerX;
//     });
//   }
  
//   return { nodes, edges };
// };

// /** Alternative: Simple recursive layout (works better for deep hierarchies) */
// const convertTreeToFlowElementsSimple = (treeData) => {
//   if (!treeData) return { nodes: [], edges: [] };

//   const nodes = [];
//   const edges = [];
  
//   // Constants for layout
//   const NODE_WIDTH = 220;
//   const NODE_HEIGHT = 100;
//   const HORIZONTAL_GAP = 300;
//   const VERTICAL_GAP = 180;
  
//   // Calculate tree structure first
//   const calculateTreeWidth = (node) => {
//     if (!node.children || node.children.length === 0) {
//       return 1; // Leaf node width = 1 unit
//     }
    
//     let totalWidth = 0;
//     node.children.forEach(child => {
//       totalWidth += calculateTreeWidth(child);
//     });
    
//     return Math.max(totalWidth, 1);
//   };
  
//   const traverseAndPosition = (node, level = 0, offset = 0) => {
//     const nodeId = String(node.id);
//     let x, y;
    
//     if (!node.children || node.children.length === 0) {
//       // Leaf node - position at given offset
//       x = offset * HORIZONTAL_GAP;
//       y = level * VERTICAL_GAP;
//     } else {
//       // Internal node - position based on children
//       let currentOffset = offset;
//       const childPositions = [];
      
//       node.children.forEach(child => {
//         const childWidth = calculateTreeWidth(child);
//         const childX = traverseAndPosition(child, level + 1, currentOffset);
//         childPositions.push(childX);
//         currentOffset += childWidth;
//       });
      
//       // Position parent in the middle of children
//       const minChildX = Math.min(...childPositions);
//       const maxChildX = Math.max(...childPositions);
//       x = (minChildX + maxChildX) / 2;
//       y = level * VERTICAL_GAP;
//     }
    
//     // Add node
//     nodes.push({
//       id: nodeId,
//       type: 'person',
//       position: { x, y },
//       data: {
//         name: node.name,
//         title: node.title,
//       },
//       draggable: false,
//       selectable: true,
//     });
    
//     // Add edges to children
//     if (node.children) {
//       node.children.forEach(child => {
//         edges.push({
//           id: `edge-${nodeId}-${child.id}`,
//           source: nodeId,
//           target: String(child.id),
//           type: 'smoothstep',
//           animated: false,
//           style: {
//             stroke: '#7413D1',
//             strokeWidth: 2,
//           },
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             color: '#7413D1',
//             width: 20,
//             height: 20,
//           },
//         });
//       });
//     }
    
//     return x;
//   };
  
//   traverseAndPosition(treeData);
  
//   // Center the tree
//   if (nodes.length > 0) {
//     const minX = Math.min(...nodes.map(n => n.position.x));
//     const maxX = Math.max(...nodes.map(n => n.position.x));
//     const centerX = (minX + maxX) / 2;
    
//     nodes.forEach(node => {
//       node.position.x -= centerX;
//     });
//   }
  
//   return { nodes, edges };
// };

// const normalizeTree = (node) => {
//   if (!node) return null;
//   return {
//     id: node.id,
//     name: node.name || 'Unknown',
//     title: node.title,
//     imageUrl: node.imageUrl,
//     children: Array.isArray(node.children)
//       ? node.children.map(normalizeTree).filter(Boolean)
//       : [],
//   };
// };

// function ContactReportHierarch({ open, handleClose, contactId }) {
//   const theme = useTheme();
//   const [hierarchyData, setHierarchyData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // ReactFlow states
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);

//   const nodeTypes = React.useMemo(() => ({ person: PersonNode }), []);

//   const onClose = () => handleClose();

//   useEffect(() => {
//     const handleGetData = async () => {
//       if (!open || !contactId) return;
      
//       try {
//         setLoading(true);
//         setError(null);
        
//         const res = await getReportHierarch(contactId);
//         console.log('API Response:', res);
        
//         const data = res?.result ?? res;
//         console.log('Data:', JSON.stringify(data, null, 2));
        
//         const tree = normalizeTree(data);
//         console.log('Normalized tree:', JSON.stringify(tree, null, 2));
        
//         setHierarchyData(tree);
        
//         // Convert to ReactFlow elements using the simple layout
//         const { nodes: flowNodes, edges: flowEdges } = convertTreeToFlowElementsSimple(tree);
//         console.log('Flow nodes:', flowNodes);
//         console.log('Flow edges:', flowEdges);
        
//         setNodes(flowNodes);
//         setEdges(flowEdges);
        
//       } catch (e) {
//         console.error('Error fetching hierarchy:', e);
//         setError(e.message);
//         setHierarchyData(null);
//         setNodes([]);
//         setEdges([]);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     handleGetData();
//   }, [open, contactId, setNodes, setEdges]);

//   console.log('Current state:', {
//     loading,
//     error,
//     hierarchyData,
//     nodesCount: nodes.length,
//     edgesCount: edges.length,
//     nodes,
//     edges,
//   });

//   return (
//     <BootstrapDialog
//       open={open}
//       aria-labelledby="contact-hierarch-title"
//       fullWidth
//       maxWidth="lg"
//       fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
//       onClose={onClose}
//     >
//       <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.text.primary }} id="contact-hierarch-title">
//         Contact Report Hierarchy
//       </Components.DialogTitle>

//       <Components.IconButton
//         aria-label="close"
//         onClick={onClose}
//         sx={(theme) => ({
//           position: 'absolute',
//           right: 8,
//           top: 8,
//           color: theme.palette.primary.icon,
//         })}
//       >
//         <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black w-5 h-5" />
//       </Components.IconButton>

//       <Components.DialogContent dividers style={{ padding: 0 }}>
//         <div className="relative h-[70vh] min-h-[400px] w-full">
//           {/* Loading state */}
//           {loading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50">
//               <div className="text-center">
//                 <CustomIcons 
//                   iconName="fa-solid fa-spinner fa-spin" 
//                   css="w-8 h-8 text-[#7413D1] mb-4 mx-auto" 
//                 />
//                 <p className="text-gray-600 font-medium">Loading organization chart...</p>
//               </div>
//             </div>
//           )}

//           {/* Error state */}
//           {error && !loading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50">
//               <div className="text-center p-6">
//                 <CustomIcons 
//                   iconName="fa-solid fa-circle-exclamation" 
//                   css="w-12 h-12 text-red-500 mb-4 mx-auto" 
//                 />
//                 <p className="text-red-700 font-medium mb-2">Failed to load hierarchy</p>
//                 <p className="text-gray-600 text-sm">{error}</p>
//                 <button 
//                   onClick={onClose}
//                   className="mt-4 px-4 py-2 bg-[#7413D1] text-white rounded-lg hover:bg-[#6411c1] transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Empty state */}
//           {!loading && !error && (!hierarchyData || nodes.length === 0) && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white z-40">
//               <div className="text-center p-8">
//                 <CustomIcons 
//                   iconName="fa-solid fa-users" 
//                   css="w-16 h-16 text-gray-300 mb-6 mx-auto" 
//                 />
//                 <p className="text-gray-500 font-medium text-lg mb-2">No hierarchy data available</p>
//                 <p className="text-gray-400 text-sm">This contact doesn't have any reporting relationships defined.</p>
//               </div>
//             </div>
//           )}

//           {/* ReactFlow container */}
//           <div className={`relative w-full h-full ${loading || error || !hierarchyData ? 'invisible' : 'visible'}`}>
//             {/* Dot pattern background */}
//             <div 
//               className="absolute inset-0 z-0"
//               style={{
//                 backgroundImage: 'radial-gradient(rgba(116, 19, 209, 0.08) 1px, transparent 1px)',
//                 backgroundSize: '20px 20px',
//                 backgroundPosition: 'center',
//               }}
//             />
            
//             {/* ReactFlow */}
//             {hierarchyData && nodes.length > 0 && (
//               <ReactFlow
//                 nodes={nodes}
//                 edges={edges}
//                 onNodesChange={onNodesChange}
//                 onEdgesChange={onEdgesChange}
//                 nodeTypes={nodeTypes}
//                 fitView
//                 fitViewOptions={{ 
//                   padding: 0.5, 
//                   includeHiddenNodes: false,
//                   minZoom: 0.5,
//                   maxZoom: 2 
//                 }}
//                 minZoom={0.1}
//                 maxZoom={2}
//                 nodesDraggable={false}
//                 nodesConnectable={false}
//                 elementsSelectable={true}
//                 proOptions={{ hideAttribution: true }}
//                 className="organization-chart"
//               >
//                 <Background 
//                   color="rgba(116, 19, 209, 0.08)" 
//                   gap={20}
//                   size={1}
//                   variant="dots"
//                 />
//                 <Controls
//                   position="bottom-right"
//                   showInteractive={false}
//                   className="bg-white border border-gray-200 rounded-lg shadow-sm"
//                 />
//                 <MiniMap
//                   nodeStrokeColor="#7413D1"
//                   nodeColor="#ffffff"
//                   maskColor="rgba(116, 19, 209, 0.1)"
//                   position="bottom-left"
//                   className="bg-white border border-gray-200 rounded-lg shadow-sm"
//                   pannable
//                   zoomable
//                 />
//               </ReactFlow>
//             )}
//           </div>
//         </div>
//       </Components.DialogContent>

//       <Components.DialogActions>
//         <div className="flex justify-end items-center gap-4 px-4 py-3">
//           <Button 
//             type="button" 
//             text="Close" 
//             useFor="secondary"
//             onClick={onClose} 
//             startIcon={
//               <CustomIcons 
//                 iconName={'fa-solid fa-xmark'} 
//                 css='cursor-pointer mr-2' 
//               />
//             } 
//           />
//         </div>
//       </Components.DialogActions>
//     </BootstrapDialog>
//   );
// }

// export default ContactReportHierarch;