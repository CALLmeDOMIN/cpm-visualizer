import { calculateCriticalPath } from "@/lib/CPM/cpm";
import {
  Action,
  AoAEdge,
  AoANode,
  CriticalPathResult,
  GraphAoA,
} from "@/lib/CPM/cpm.types";
import { getLayoutedElements } from "@/lib/flowLayout";
import { cn } from "@/lib/utils";
import {
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";

const mapToReactFlow = (graph: GraphAoA): { nodes: Node[]; edges: Edge[] } => {
  const reactFlowNodes = graph.nodes.map((node: AoANode) => {
    const earlyStart =
      node.earlyStart !== undefined ? node.earlyStart : node.eventTime;
    const earlyFinish =
      node.earlyFinish !== undefined ? node.earlyFinish : node.eventTime;
    const lateStart =
      node.lateStart !== undefined ? node.lateStart : node.latestTime;
    const lateFinish =
      node.lateFinish !== undefined ? node.lateFinish : node.latestTime;
    const duration = earlyFinish - earlyStart;
    const slack =
      node.slack !== undefined ? node.slack : lateStart - earlyStart;

    const isCritical = slack === 0;

    return {
      id: node.name,
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div className="flex flex-col">
            <div className="grid grid-cols-3 border-black text-center">
              <div className="rounded-tl-md border border-black px-1">
                {earlyStart}
              </div>
              <div className="border border-black px-1">{duration}</div>
              <div className="rounded-tr-md border border-black px-1">
                {earlyFinish}
              </div>
            </div>
            <div className="border border-black py-0.5 text-center">
              {node.name}
            </div>
            <div className="grid grid-cols-3 border-black text-center">
              <div className="rounded-bl-md border border-black px-1">
                {lateStart}
              </div>
              <div className="border border-black px-1">{slack}</div>
              <div className="rounded-br-md border border-black px-1">
                {lateFinish}
              </div>
            </div>
          </div>
        ),
        isCritical,
      },
      style: {
        background: isCritical ? "#eee182" : "#ffffff",
        padding: 0,
        borderRadius: "8px",
        width: "auto",
      },
    };
  });

  const reactFlowEdges: Edge[] = graph.edges.map((edge: AoAEdge) => {
    const isCritical = edge.isCritical === true;

    return {
      id: `${edge.from}-${edge.to}-${edge.name}`,
      source: edge.from,
      target: edge.to,
      label: `${edge.name}(${edge.duration})`,
      labelStyle: {
        fill: isCritical ? "#efb100" : "black",
      },
      style: {
        stroke: isCritical ? "#eee182" : "#b1b1b7",
        strokeWidth: isCritical ? 2 : 1,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isCritical ? "#eee182" : "#b1b1b7",
      },
    };
  });

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
};

export default function Visualization({
  className,
  actions,
}: {
  className?: string;
  actions: Action[];
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [cpmResult, setCpmResult] = useState<CriticalPathResult>({
    criticalPath: [],
    totalDuration: 0,
  });

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 50);
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ padding: 0.2 });
        }
      }, 50);
    }
  }, [nodes]);

  useEffect(() => {
    if (actions.length === 0) return;

    const { result, graph } = calculateCriticalPath(actions);
    setCpmResult(result);

    if (graph) {
      const { nodes: reactFlowNodes, edges: reactFlowEdges } =
        mapToReactFlow(graph);

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(reactFlowNodes, reactFlowEdges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [actions]);

  return (
    <div
      className={cn(
        "border-primary relative h-96 rounded-md border",
        className,
      )}
    >
      {cpmResult.criticalPath.length > 0 && (
        <ResultDisplay
          result={cpmResult}
          className="absolute top-2 right-2 z-50"
        />
      )}
      <ReactFlow nodes={nodes} edges={edges} onInit={onInit} fitView={false} />
    </div>
  );
}

const ResultDisplay = ({
  className,
  result,
}: {
  className?: string;
  result: CriticalPathResult;
}) => {
  return (
    <Card className={`flex flex-col p-0 ${className}`}>
      <CardContent className="p-4">
        <h2 className="mb-1 text-lg font-bold">Critical Path Result</h2>
        <p>Total Duration: {result.totalDuration} days</p>
        <p>Critical Path:</p>
        {result.criticalPath.map((path, index) => (
          <>
            {path}
            {index < result.criticalPath.length - 1 && (
              <span className="text-primary"> &gt; </span>
            )}
          </>
        ))}
      </CardContent>
    </Card>
  );
};
