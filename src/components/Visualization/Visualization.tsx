import { calculateCriticalPath } from "@/lib/CPM/cpm";
import {
  Action,
  CriticalPathResult,
  GraphAoA,
  GraphAoN,
} from "@/lib/CPM/cpm.types";
import { getLayoutedElements } from "@/lib/flowLayout";
import { cn } from "@/lib/utils";
import { Edge, Node, ReactFlow, ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import LegendDialog from "../Legend/LegendDialog";
import ResultDisplay from "../ResultDisplay";
import { mapAoNToReactFlow, mapToReactFlow } from "./Visualization.utils";

export default function Visualization({
  className,
  actions,
  graphType = "AoA",
}: {
  className?: string;
  actions: Action[];
  graphType: "AoA" | "AoN";
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [graph, setGraph] = useState<GraphAoA | GraphAoN | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [cpmResult, setCpmResult] = useState<CriticalPathResult>({
    criticalPath: [],
    totalDuration: 0,
  });
  const [error, setError] = useState<Error | null>(null);

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
    setError(null);

    setNodes([]);
    setEdges([]);

    if (actions.length === 0) {
      setCpmResult({ criticalPath: [], totalDuration: 0 });
      setGraph(null);
      return;
    }

    try {
      const { result, graph } = calculateCriticalPath(actions, graphType);
      setCpmResult(result);

      if (graphType === "AoA" && graph) {
        if ("nodes" in graph && "edges" in graph) {
          setGraph(graph as GraphAoA);

          const { nodes: reactFlowNodes, edges: reactFlowEdges } =
            mapToReactFlow(graph as GraphAoA);

          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(reactFlowNodes, reactFlowEdges);

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        } else {
          console.error("Invalid AoA graph structure:", graph);
          throw new Error("Invalid graph structure for Activity on Arrow");
        }
      } else if (graphType === "AoN" && graph) {
        if ("activities" in graph) {
          setGraph(graph as GraphAoN);

          const { nodes: reactFlowNodes, edges: reactFlowEdges } =
            mapAoNToReactFlow(graph as GraphAoN);

          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(reactFlowNodes, reactFlowEdges);

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
        } else {
          console.error("Invalid AoN graph structure:", graph);
          throw new Error("Invalid graph structure for Activity on Node");
        }
      } else {
        console.error("No valid graph returned:", graph);
        throw new Error("No valid graph could be generated");
      }
    } catch (err) {
      console.error("Error in visualization:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setNodes([]);
      setEdges([]);
      setCpmResult({ criticalPath: [], totalDuration: 0 });
      setGraph(null);
    }
  }, [actions, graphType]);

  if (error) {
    return (
      <div
        className={cn(
          "border-primary relative h-96 rounded-md border",
          className,
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-500">
              Error generating visualization
            </h3>
            <p className="mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

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
          graphData={graph}
          graphType={graphType}
          className="absolute top-2 right-2 z-50"
        />
      )}
      <ReactFlow nodes={nodes} edges={edges} onInit={onInit} fitView={false} />
      <LegendDialog />
    </div>
  );
}
