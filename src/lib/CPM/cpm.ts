import type {
  Action,
  AoAEdge,
  AoANode,
  CriticalPathResult,
  GraphAoA,
} from "./cpm.types";

export const calculateCriticalPath = (
  actions: Action[],
): CriticalPathResult => {
  const isNodeBasedDependencies = actions.some((action) =>
    action.dependencies.some((dep) => dep.includes("-")),
  );

  if (isNodeBasedDependencies) {
    return calculateCriticalPathAoA(actions);
  } else {
    return calculateCriticalPathAoN(actions);
  }
};

const calculateCriticalPathAoN = (actions: Action[]): CriticalPathResult => {
  console.log(actions);
  return {
    criticalPath: [],
    totalDuration: 0,
  }; // Placeholder for AoN calculation
};

const calculateCriticalPathAoA = (actions: Action[]): CriticalPathResult => {
  const { nodes, edges } = buildGraph(actions);

  forwardPass(nodes, edges);
  backwardPass(nodes, edges);

  const criticalPath = identifyCriticalPath(edges);

  const lastNode = nodes.reduce(
    (max, node) => (node.eventTime > max.eventTime ? node : max),
    nodes[0],
  );

  return {
    criticalPath,
    totalDuration: lastNode.eventTime,
  };
};

const buildGraph = (actions: Action[]): GraphAoA => {
  const nodes = new Map<string, AoANode>();
  const edges: AoAEdge[] = [];

  actions.forEach((action) => {
    action.dependencies.forEach((dep) => {
      const [fromNode, toNode] = dep.split("-");

      if (!nodes.has(fromNode)) {
        nodes.set(fromNode, {
          name: fromNode,
          eventTime: 0,
          latestTime: Infinity,
        });
      }

      if (!nodes.has(toNode)) {
        nodes.set(toNode, {
          name: toNode,
          eventTime: 0,
          latestTime: Infinity,
        });
      }

      edges.push({
        from: fromNode,
        to: toNode,
        name: action.name,
        duration: action.duration,
        slack: 0,
      });
    });
  });

  return { nodes: Array.from(nodes.values()), edges };
};

const forwardPass = (nodes: AoANode[], edges: AoAEdge[]) => {
  nodes.forEach((node) => {
    node.eventTime = 0;
  });

  let changed = true;
  while (changed) {
    changed = false;
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.name === edge.from);
      const toNode = nodes.find((n) => n.name === edge.to);

      if (fromNode && toNode) {
        const newEventTime = fromNode.eventTime + edge.duration;
        if (newEventTime > toNode.eventTime) {
          toNode.eventTime = newEventTime;
          changed = true;
        }
      }
    });
  }
};

const backwardPass = (nodes: AoANode[], edges: AoAEdge[]) => {
  const projectDuration = Math.max(...nodes.map((n) => n.eventTime));

  nodes.forEach((node) => {
    node.latestTime = projectDuration;
  });

  let changed = true;
  while (changed) {
    changed = false;
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.name === edge.from);
      const toNode = nodes.find((n) => n.name === edge.to);

      if (fromNode && toNode) {
        const newLatestTime = toNode.latestTime - edge.duration;
        if (newLatestTime < fromNode.latestTime) {
          fromNode.latestTime = newLatestTime;
          changed = true;
        }
      }
    });
  }

  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.name === edge.from);
    const toNode = nodes.find((n) => n.name === edge.to);

    if (fromNode && toNode) {
      edge.slack = toNode.latestTime - fromNode.eventTime - edge.duration;
    }
  });
};

const identifyCriticalPath = (edges: AoAEdge[]) => {
  return edges
    .filter((edge) => edge.slack === 0 && edge.duration > 0)
    .map((edge) => edge.name);
};
