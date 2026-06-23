import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';

// Import ReactFlow
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Components from '../../../components/muiComponents/components';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { getReportHierarch } from '../../../service/contact/contactService';
import { handleRequestClose } from '../../../service/common/commonService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': { padding: theme.spacing(2) },
  '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}));

/** Person node component for ReactFlow */
const PersonNode = ({ data }) => {
  const { name, title, isHighlighted } = data;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div
      className={`
        relative w-[250px] rounded-2xl border-2 transition-all duration-300 bg-white p-4
        ${isHighlighted
          ? 'border-[#7413D1] shadow-[0_0_15px_rgba(116,19,209,0.3)] ring-4 ring-purple-100 scale-105'
          : 'border-gray-200 shadow-md hover:shadow-lg'}
      `}
    >
      {/* ✅ Incoming connection point (manager -> this) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          border: '2px solid #94a3b8',
          background: '#ffffff'
        }}
      />

      <div className="flex items-center gap-3">
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
            ${isHighlighted ? 'bg-gradient-to-br from-[#7413D1] to-[#9d4edd]' : 'bg-gray-400'}
          `}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-bold truncate ${isHighlighted ? 'text-[#7413D1]' : 'text-gray-800'}`}>
            {name}
          </div>
          {title && (
            <div className="text-xs text-gray-500 truncate mt-0.5" title={title}>
              {title}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Outgoing connection point (this -> direct reports) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          border: '2px solid #94a3b8',
          background: '#ffffff'
        }}
      />
    </div>
  );
};

/** Recursive layout that marks the active contactId */
const convertTreeToFlowElementsSimple = (treeData, activeId) => {
  if (!treeData) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];

  const HORIZONTAL_GAP = 280;
  const VERTICAL_GAP = 160;

  const calculateTreeWidth = (node) => {
    if (!node.children || node.children.length === 0) return 1;
    let totalWidth = 0;
    node.children.forEach(child => {
      totalWidth += calculateTreeWidth(child);
    });
    return Math.max(totalWidth, 1);
  };

  const traverseAndPosition = (node, level = 0, offset = 0) => {
    const nodeId = String(node.id);
    let x, y;

    if (!node.children || node.children.length === 0) {
      x = offset * HORIZONTAL_GAP;
      y = level * VERTICAL_GAP;
    } else {
      let currentOffset = offset;
      const childPositions = [];

      node.children.forEach(child => {
        const childWidth = calculateTreeWidth(child);
        const childX = traverseAndPosition(child, level + 1, currentOffset);
        childPositions.push(childX);
        currentOffset += childWidth;
      });

      x = (Math.min(...childPositions) + Math.max(...childPositions)) / 2;
      y = level * VERTICAL_GAP;
    }

    // Add node with highlight check
    nodes.push({
      id: nodeId,
      type: 'person',
      position: { x, y },
      data: {
        name: node.name,
        title: node.title,
        isHighlighted: String(nodeId) === String(activeId),
      },
      draggable: true,
    });

    // Add edges
    if (node.children) {
      node.children.forEach(child => {
        edges.push({
          id: `edge-${nodeId}-${child.id}`,
          source: nodeId,
          target: String(child.id),
          type: 'smoothstep',
          style: {
            stroke: '#94a3b8', // subtle slate color for lines
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
        });
      });
    }

    return x;
  };

  traverseAndPosition(treeData);

  // Center horizontally
  if (nodes.length > 0) {
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x));
    const centerX = (minX + maxX) / 2;
    nodes.forEach(node => { node.position.x -= centerX; });
  }

  return { nodes, edges };
};

const normalizeTree = (node) => {
  if (!node) return null;
  return {
    id: node.id,
    name: node.name || 'Unknown',
    title: node.title,
    children: Array.isArray(node.children)
      ? node.children.map(normalizeTree).filter(Boolean)
      : [],
  };
};

function ContactReportHierarch({ open, handleClose, contactId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = React.useMemo(() => ({ person: PersonNode }), []);

  useEffect(() => {
    const handleGetData = async () => {
      if (!open || !contactId) return;

      try {
        setLoading(true);
        setError(null);

        const res = await getReportHierarch(contactId);
        const data = res?.result ?? res;
        const tree = normalizeTree(data);

        // Pass contactId here to handle highlighting during node creation
        const { nodes: flowNodes, edges: flowEdges } = convertTreeToFlowElementsSimple(tree, contactId);

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (e) {
        console.error('Error fetching hierarchy:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    handleGetData();
  }, [open, contactId, setNodes, setEdges]);

  return (
    <BootstrapDialog
      onClose={(event, reason) => handleRequestClose(event, reason, handleClose)}
      open={open}
      fullWidth
      maxWidth="lg"
    >
      <Components.DialogTitle sx={{ m: 0, p: 2 }}>
        Contact Reporting Hierarchy
      </Components.DialogTitle>

      <Components.IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CustomIcons iconName="fa-solid fa-xmark" css="w-5 h-5 text-gray-500" />
      </Components.IconButton>

      <Components.DialogContent dividers style={{ padding: 0, backgroundColor: '#f8fafc' }}>
        <div className="relative h-[75vh] w-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
              <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="w-10 h-10 text-[#7413D1]" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="text-center text-red-500 p-4">
                <p className="font-bold">Error loading hierarchy</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            minZoom={0.2}
            maxZoom={1.5}
            nodesDraggable={true}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" variant="dots" gap={24} size={1} />
            <Controls position="bottom-right" />
            <MiniMap
              position="bottom-left"
              nodeColor={(n) => n.data.isHighlighted ? '#7413D1' : '#cbd5e1'}
            />
          </ReactFlow>
        </div>
      </Components.DialogContent>
    </BootstrapDialog>
  );
}

export default ContactReportHierarch;