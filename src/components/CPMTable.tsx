import type { GraphAoA, GraphAoN } from "@/lib/CPM/cpm.types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function CPMTable({
  cpmData,
  graphType = "AoA",
}: {
  cpmData: GraphAoA | GraphAoN | null;
  graphType?: "AoA" | "AoN";
}) {
  if (graphType === "AoA") {
    const { edges, nodes } = (cpmData as GraphAoA) || { edges: [], nodes: [] };

    return (
      <Dialog>
        <DialogTrigger>
          <Button variant="outline" size="sm">
            Activity Table
          </Button>
        </DialogTrigger>
        <DialogContent className="dark text-foreground max-w-6xl">
          <DialogHeader>
            <DialogTitle>CPM Activity Details</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>ES</TableHead>
                <TableHead>EF</TableHead>
                <TableHead>LS</TableHead>
                <TableHead>LF</TableHead>
                <TableHead>Slack</TableHead>
                <TableHead>CP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.name === edge.from);
                const toNode = nodes.find((n) => n.name === edge.to);

                if (!fromNode || !toNode) return null;

                const earlyStart = fromNode.eventTime || 0;
                const earlyFinish = earlyStart + edge.duration;
                const lateFinish = toNode.latestTime || 0;
                const lateStart = lateFinish - edge.duration;

                const slack =
                  edge.slack !== undefined
                    ? edge.slack
                    : lateStart - earlyStart;

                return (
                  <TableRow
                    key={`${edge.from}-${edge.to}-${edge.name}`}
                    className={edge.isCritical ? "bg-primary/10" : ""}
                  >
                    <TableCell>{edge.from}</TableCell>
                    <TableCell>{edge.to}</TableCell>
                    <TableCell>{edge.name}</TableCell>
                    <TableCell>{edge.duration}</TableCell>
                    <TableCell>{earlyStart}</TableCell>
                    <TableCell>{earlyFinish}</TableCell>
                    <TableCell>{lateStart}</TableCell>
                    <TableCell>{lateFinish}</TableCell>
                    <TableCell>{slack}</TableCell>
                    <TableCell>{edge.isCritical ? "Yes" : "No"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  } else {
    const { activities } = (cpmData as GraphAoN) || { activities: [] };
    return (
      <Dialog>
        <DialogTrigger>
          <Button variant="outline" size="sm">
            Activity Table
          </Button>
        </DialogTrigger>
        <DialogContent className="dark text-foreground max-w-6xl">
          <DialogHeader>
            <DialogTitle>CPM Activity Details</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Dependencies</TableHead>
                <TableHead>ES</TableHead>
                <TableHead>EF</TableHead>
                <TableHead>LS</TableHead>
                <TableHead>LF</TableHead>
                <TableHead>Slack</TableHead>
                <TableHead>CP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow
                  key={activity.name}
                  className={activity.isCritical ? "bg-primary/10" : ""}
                >
                  <TableCell>{activity.name}</TableCell>
                  <TableCell>{activity.duration}</TableCell>
                  <TableCell>{activity.dependencies.join(", ")}</TableCell>
                  <TableCell>{activity.earlyStart}</TableCell>
                  <TableCell>{activity.earlyFinish}</TableCell>
                  <TableCell>{activity.lateStart}</TableCell>
                  <TableCell>{activity.lateFinish}</TableCell>
                  <TableCell>{activity.slack}</TableCell>
                  <TableCell>{activity.isCritical ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  }
}
