import { CriticalPathResult, GraphAoA } from "@/lib/CPM/cpm.types";
import { Card, CardContent } from "./ui/card";
import CPMTable from "./CPMTable";

export default function ResultDisplay({
  className,
  result,
  graphData,
}: {
  className?: string;
  result: CriticalPathResult;
  graphData: GraphAoA | null;
}) {
  return (
    <Card className={`flex flex-col p-0 ${className}`}>
      <CardContent className="flex flex-col gap-2 p-4">
        <h2 className="mb-1 text-lg font-bold">Critical Path Result</h2>
        <p>Total Duration: {result.totalDuration} days</p>
        <p>Critical Path:</p>
        <div>
          {result.criticalPath.map((path, index) => (
            <>
              {path}
              {index < result.criticalPath.length - 1 && (
                <span className="text-primary"> &gt; </span>
              )}
            </>
          ))}
        </div>
        <CPMTable cpmData={graphData} />
      </CardContent>
    </Card>
  );
}
