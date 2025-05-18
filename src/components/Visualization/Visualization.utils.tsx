import { AoAEdge, AoANode, GraphAoA, GraphAoN } from "@/lib/CPM/cpm.types";
import { Edge, MarkerType, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export const mapToReactFlow = (
  graph: GraphAoA,
): { nodes: Node[]; edges: Edge[] } => {
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

export const mapAoNToReactFlow = (
  graph: GraphAoN,
): { nodes: Node[]; edges: Edge[] } => {
  const reactFlowNodes = graph.activities.map((activity) => ({
    id: activity.name,
    position: { x: 0, y: 0 },
    data: {
      label: (
        <div className="flex flex-col">
          <div className="grid grid-cols-3 border-black text-center">
            <div className="rounded-tl-md border border-black px-1">
              {activity.earlyStart}
            </div>
            <div className="border border-black px-1">{activity.duration}</div>
            <div className="rounded-tr-md border border-black px-1">
              {activity.earlyFinish}
            </div>
          </div>
          <div className="border border-black py-0.5 text-center">
            {activity.name}
          </div>
          <div className="grid grid-cols-3 border-black text-center">
            <div className="rounded-bl-md border border-black px-1">
              {activity.lateStart}
            </div>
            <div className="border border-black px-1">{activity.slack}</div>
            <div className="rounded-br-md border border-black px-1">
              {activity.lateFinish}
            </div>
          </div>
        </div>
      ),
      isCritical: activity.isCritical,
    },
    style: {
      background: activity.isCritical ? "#eee182" : "#ffffff",
      padding: 0,
      borderRadius: "8px",
      width: "auto",
    },
  }));

  const criticalActivities = graph.activities.filter((act) => act.isCritical);

  const criticalPathMap = new Map<string, string[]>();
  criticalActivities.forEach((activity) => {
    const criticalDeps = activity.dependencies.filter((depName) => {
      const depActivity = graph.activities.find((a) => a.name === depName);
      return depActivity?.isCritical;
    });

    criticalPathMap.set(activity.name, criticalDeps);
  });

  const reactFlowEdges: Edge[] = [];

  graph.activities.forEach((activity) => {
    activity.dependencies.forEach((depName) => {
      const sourceActivity = graph.activities.find((a) => a.name === depName);
      const isEdgeCritical =
        activity.isCritical &&
        sourceActivity?.isCritical &&
        criticalPathMap.get(activity.name)?.includes(depName);

      reactFlowEdges.push({
        id: `${depName}-${activity.name}`,
        source: depName,
        target: activity.name,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeCritical ? "#eee182" : "#b1b1b7",
        },
        style: {
          strokeWidth: isEdgeCritical ? 2 : 1,
          stroke: isEdgeCritical ? "#eee182" : "#b1b1b7",
        },
      });
    });
  });

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
};
