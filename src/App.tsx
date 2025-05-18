import { CPMForm } from "@/components/CPMForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Visualization from "@/components/Visualization/Visualization";
import type { Action } from "@/lib/CPM/cpm.types";

import { useState } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [actions, setActions] = useState<Action[]>([]);
  const [graphType, setGraphType] = useState<"AoA" | "AoN">("AoA");
  const [isChangingType, setIsChangingType] = useState(false);

  const handleGraphTypeChange = (type: "AoA" | "AoN") => {
    if (graphType !== type) {
      setIsChangingType(true);
      setActions([]);

      setTimeout(() => {
        setGraphType(type);
        setIsChangingType(false);
      }, 100);
    }
  };

  return (
    <>
      <div className="dark bg-background text-foreground flex min-h-screen items-center justify-center xl:hidden">
        The application is intended to be used on PC
      </div>
      <div className="dark hidden min-h-screen gap-2 bg-stone-950 p-2 xl:flex">
        <div className="flex h-[calc(100vh_-_1rem)] w-2/5 items-center rounded-md px-2">
          <Card>
            <CardHeader>
              <CardTitle>CPM - Wprowadź czynności</CardTitle>
              <CardDescription>
                <div className="flex items-center justify-between">
                  <span>Critical Path Method</span>
                  <div className="flex gap-2 rounded-md border p-1">
                    <Button
                      variant={graphType === "AoA" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGraphTypeChange("AoA")}
                      disabled={isChangingType}
                    >
                      Activity on Arrow
                    </Button>
                    <Button
                      variant={graphType === "AoN" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGraphTypeChange("AoN")}
                      disabled={isChangingType}
                    >
                      Activity on Node
                    </Button>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CPMForm setActions={setActions} graphType={graphType} />
            </CardContent>
          </Card>
        </div>
        {isChangingType ? (
          <div className="flex h-[calc(100vh_-_1rem)] w-3/5 items-center justify-center">
            <p className="text-lg">Changing graph type...</p>
          </div>
        ) : (
          <Visualization
            actions={actions}
            graphType={graphType}
            className="h-[calc(100vh_-_1rem)] w-3/5"
          />
        )}
      </div>
    </>
  );
}

export default App;
