import { CriticalPathResult, GraphAoA, GraphAoN } from "@/lib/CPM/cpm.types";
import { Card, CardContent } from "./ui/card";
import CPMTable from "./CPMTable";
import React from "react";

export default function ResultDisplay({
  className,
  result,
  graphData,
  graphType = "AoA",
}: {
  className?: string;
  result: CriticalPathResult;
  graphData: GraphAoA | GraphAoN | null;
  graphType: "AoA" | "AoN";
}) {
  return (
    <Card className={`flex flex-col p-0 ${className}`}>
      <CardContent className="flex flex-col gap-2 p-4">
        <h2 className="mb-1 text-lg font-bold">Critical Path Result</h2>
        <p>Total Duration: {result.totalDuration} days</p>
        <p>Critical Path:</p>
        <div>
          {result.criticalPath.map((path, index) => (
            <React.Fragment key={path}>
              {path}
              {index < result.criticalPath.length - 1 && (
                <span className="text-primary"> &gt; </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <CPMTable cpmData={graphData} graphType={graphType} />
      </CardContent>
    </Card>
  );
}
