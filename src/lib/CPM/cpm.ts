import type {
  Action,
  AoAEdge,
  AoANode,
  AoNActivity,
  CriticalPathResult,
  GraphAoA,
  GraphAoN,
} from "./cpm.types";

export const calculateCriticalPath = (
  actions: Action[],
  graphType: "AoA" | "AoN" = "AoA",
): { result: CriticalPathResult; graph: GraphAoA | GraphAoN | null } => {
  if (graphType === "AoA") {
    const isNodeBasedDependencies = actions.some((action) =>
      action.dependencies.some((dep) => dep.includes("-")),
    );

    if (isNodeBasedDependencies) {
      const graph = buildGraph(actions);
      forwardPass(graph.nodes, graph.edges);
      backwardPass(graph.nodes, graph.edges);
      calculateSlack(graph.nodes);
      calculateEdgeSlack(graph.edges, graph.nodes);

      const criticalPath = identifyCriticalPath(graph.edges, graph.nodes);
      const lastNode = graph.nodes.reduce(
        (max, node) => (node.eventTime > max.eventTime ? node : max),
        graph.nodes[0],
      );

      return {
        result: {
          criticalPath,
          totalDuration: lastNode.eventTime,
        },
        graph,
      };
    } else {
      return {
        result: {
          criticalPath: [],
          totalDuration: 0,
        },
        graph: null,
      };
    }
  } else {
    return calculateCriticalPathAoN(actions);
  }
};

const calculateCriticalPathAoN = (
  actions: Action[],
): { result: CriticalPathResult; graph: GraphAoN } => {
  const graph = buildAoNGraph(actions);

  calculateEarlyTimes(graph.activities);
  calculateLateTimes(graph.activities);

  const criticalPath = identifyCriticalPathAoN(graph.activities);

  const projectDuration = Math.max(
    ...graph.activities.map((a) => a.earlyFinish),
  );

  return {
    result: {
      criticalPath: criticalPath.map((a) => a.name),
      totalDuration: projectDuration,
    },
    graph,
  };
};

const buildAoNGraph = (actions: Action[]): GraphAoN => {
  const activities: AoNActivity[] = actions.map((action) => ({
    name: action.name,
    duration: action.duration,
    dependencies: action.dependencies,
    earlyStart: 0,
    earlyFinish: 0,
    lateStart: 0,
    lateFinish: 0,
    slack: 0,
    isCritical: false,
  }));

  return { activities };
};

const calculateEarlyTimes = (activities: AoNActivity[]) => {
  activities.forEach((activity) => {
    activity.earlyStart = 0;
    activity.earlyFinish = activity.duration;
  });

  let changed = true;
  while (changed) {
    changed = false;

    activities.forEach((activity) => {
      if (activity.dependencies.length > 0) {
        const maxPredecessorFinish = Math.max(
          ...activity.dependencies.map((dep) => {
            const predecessor = activities.find((a) => a.name === dep);
            return predecessor ? predecessor.earlyFinish : 0;
          }),
        );

        if (maxPredecessorFinish > activity.earlyStart) {
          activity.earlyStart = maxPredecessorFinish;
          activity.earlyFinish = maxPredecessorFinish + activity.duration;
          changed = true;
        }
      }
    });
  }
};

const calculateLateTimes = (activities: AoNActivity[]) => {
  const projectEnd = Math.max(...activities.map((a) => a.earlyFinish));

  activities.forEach((activity) => {
    activity.lateFinish = projectEnd;
    activity.lateStart = activity.lateFinish - activity.duration;
  });

  const endActivities = activities.filter(
    (a) => !activities.some((act) => act.dependencies.includes(a.name)),
  );

  endActivities.forEach((activity) => {
    activity.lateFinish = projectEnd;
    activity.lateStart = activity.lateFinish - activity.duration;
  });

  let changed = true;
  while (changed) {
    changed = false;

    for (let i = activities.length - 1; i >= 0; i--) {
      const activity = activities[i];

      const successors = activities.filter((a) =>
        a.dependencies.includes(activity.name),
      );

      if (successors.length > 0) {
        const minSuccessorStart = Math.min(
          ...successors.map((s) => s.lateStart),
        );

        if (minSuccessorStart < activity.lateFinish) {
          activity.lateFinish = minSuccessorStart;
          activity.lateStart = activity.lateFinish - activity.duration;
          changed = true;
        }
      }
    }
  }

  activities.forEach((activity) => {
    activity.slack = activity.lateStart - activity.earlyStart;
    activity.isCritical = activity.slack === 0;
  });
};

const identifyCriticalPathAoN = (activities: AoNActivity[]): AoNActivity[] => {
  return activities.filter((activity) => activity.isCritical);
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
          earlyStart: 0,
          earlyFinish: 0,
          lateStart: 0,
          lateFinish: 0,
          slack: 0,
        });
      }

      if (!nodes.has(toNode)) {
        nodes.set(toNode, {
          name: toNode,
          eventTime: 0,
          latestTime: Infinity,
          earlyStart: 0,
          earlyFinish: 0,
          lateStart: 0,
          lateFinish: 0,
          slack: 0,
        });
      }

      edges.push({
        from: fromNode,
        to: toNode,
        name: action.name,
        duration: action.duration,
      });
    });
  });

  return { nodes: Array.from(nodes.values()), edges };
};

const forwardPass = (nodes: AoANode[], edges: AoAEdge[]) => {
  nodes.forEach((node) => {
    node.eventTime = 0;
    node.earlyStart = 0;
    node.earlyFinish = 0;
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
          toNode.earlyStart = newEventTime - edge.duration;
          toNode.earlyFinish = newEventTime;
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
    node.lateStart = projectDuration;
    node.lateFinish = projectDuration;
  });

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = edges.length - 1; i >= 0; i--) {
      const edge = edges[i];
      const fromNode = nodes.find((n) => n.name === edge.from);
      const toNode = nodes.find((n) => n.name === edge.to);

      if (fromNode && toNode) {
        const newLatestTime = toNode.latestTime - edge.duration;
        if (newLatestTime < fromNode.latestTime) {
          fromNode.latestTime = newLatestTime;
          fromNode.lateFinish = toNode.latestTime;
          fromNode.lateStart = fromNode.lateFinish - edge.duration;
          changed = true;
        }
      }
    }
  }
};

const calculateSlack = (nodes: AoANode[]) => {
  nodes.forEach((node) => {
    node.slack = (node.latestTime || 0) - (node.eventTime || 0);
  });
};

const calculateEdgeSlack = (edges: AoAEdge[], nodes: AoANode[]) => {
  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.name === edge.from);
    const toNode = nodes.find((n) => n.name === edge.to);

    if (fromNode && toNode) {
      const latestStartPossible = toNode.latestTime - edge.duration;
      const earliestStartPossible = fromNode.eventTime;
      edge.slack = latestStartPossible - earliestStartPossible;

      edge.isCritical = edge.slack === 0 && edge.duration > 0;
    }
  });
};

const identifyCriticalPath = (edges: AoAEdge[], nodes: AoANode[]): string[] => {
  edges.forEach((edge) => {
    edge.isCritical = false;
  });

  const criticalEdges = edges.filter((edge) => {
    const fromNode = nodes.find((n) => n.name === edge.from);
    const toNode = nodes.find((n) => n.name === edge.to);

    if (!fromNode || !toNode) return false;

    const isZeroSlack =
      fromNode.eventTime + edge.duration === toNode.eventTime &&
      edge.slack === 0;

    if (isZeroSlack) {
      edge.isCritical = true;
    }

    return isZeroSlack;
  });

  const startNode = nodes.find((n) => n.eventTime === 0)?.name || "";
  const endNode = nodes.reduce(
    (max, node) => (node.eventTime > max.eventTime ? node : max),
    nodes[0],
  ).name;

  const criticalActivities: string[] = [];
  let currentNode = startNode;

  while (currentNode !== endNode) {
    const nextEdge = criticalEdges.find((edge) => edge.from === currentNode);
    if (!nextEdge) break;

    criticalActivities.push(nextEdge.name);
    currentNode = nextEdge.to;
  }

  return criticalActivities;
};
