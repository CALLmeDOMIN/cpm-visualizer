import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CPMForm } from "./components/CPMForm";

function App() {
  return (
    <div className="dark flex min-h-screen items-center justify-center bg-stone-950">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>CPM - Wprowadź czynności</CardTitle>
          <CardDescription>Activity on arrow</CardDescription>
        </CardHeader>
        <CardContent>
          <CPMForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
