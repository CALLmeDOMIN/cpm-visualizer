import { CPMForm } from "@/components/CPMForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Visualization from "@/components/Visualization";
import type { Action } from "@/lib/CPM/cpm.types";

import { useState } from "react";

function App() {
  const [actions, setActions] = useState<Action[]>([]);

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
              <CardDescription>Activity on arrow</CardDescription>
            </CardHeader>
            <CardContent>
              <CPMForm setActions={setActions} />
            </CardContent>
          </Card>
        </div>
        <Visualization
          actions={actions}
          className="h-[calc(100vh_-_1rem)] w-3/5"
        />
      </div>
    </>
  );
}

export default App;
