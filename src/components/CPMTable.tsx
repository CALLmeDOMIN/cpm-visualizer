import type { GraphAoA } from "@/lib/CPM/cpm.types";
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

export default function CPMTable({ cpmData }: { cpmData: GraphAoA | null }) {
  const { edges, nodes } = cpmData || { edges: [], nodes: [] };

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

              const earlyStart = fromNode?.earlyStart || 0;
              const earlyFinish = earlyStart + edge.duration;
              const lateStart = toNode
                ? (toNode.lateStart || 0) - edge.duration
                : 0;
              const lateFinish = toNode?.lateFinish || 0;

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
                  <TableCell>{edge.slack || 0}</TableCell>
                  <TableCell>{edge.isCritical ? "Yes" : "No"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
