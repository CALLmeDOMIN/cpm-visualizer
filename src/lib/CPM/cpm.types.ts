export type Action = {
  name: string;
  duration: number; // in days
  dependencies: string[];
};

export type GraphAoA = {
  nodes: AoANode[];
  edges: AoAEdge[];
};

export type AoANode = {
  name: string;
  eventTime: number;
  latestTime: number;
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  slack?: number;
};

export type AoAEdge = {
  from: string;
  to: string;
  name: string;
  duration: number;
  slack?: number;
  isCritical?: boolean;
};

export type CriticalPathResult = {
  criticalPath: string[];
  totalDuration: number;
};

export type AoNActivity = {
  name: string;
  duration: number;
  dependencies: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
};

export type GraphAoN = {
  activities: AoNActivity[];
};
