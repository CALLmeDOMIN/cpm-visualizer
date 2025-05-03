import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CPMForm } from "./components/CPMForm";
import { ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

function App() {
  const initialNodes = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
    { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  ];
  const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

  return (
    <>
      <div className="dark bg-background text-foreground flex min-h-screen items-center justify-center xl:hidden">
        The application is intended to be used on PC
      </div>
      <div className="dark hidden min-h-screen gap-2 bg-stone-950 p-2 xl:flex">
        <div className="flex h-[calc(100vh_-_1rem)] w-2/5 items-center rounded-md px-2">
          <Card className="">
            <CardHeader>
              <CardTitle>CPM - Wprowadź czynności</CardTitle>
              <CardDescription>Activity on arrow</CardDescription>
            </CardHeader>
            <CardContent>
              <CPMForm />
            </CardContent>
          </Card>
        </div>
        <div className="h-[calc(100vh_-_1rem)] w-3/5 rounded-md bg-red-300">
          <ReactFlow nodes={initialNodes} edges={initialEdges} />
        </div>
      </div>
    </>
  );
}

export default App;
