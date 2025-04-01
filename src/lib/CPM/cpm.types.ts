export type Action = {
  name: string;
  duration: number; // in days
  dependencies: string[];
};

export type AoANode = {
  name: string;
  eventTime: number;
  latestTime: number;
};

export type AoAEdge = {
  from: string;
  to: string;
  name: string;
  duration: number;
  slack: number;
};

export type CriticalPathResult = {
  criticalPath: string[];
  totalDuration: number;
};
