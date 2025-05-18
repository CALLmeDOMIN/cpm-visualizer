import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Legend from "./Legend";

export default function LegendDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Legend className="hover - absolute right-18 bottom-1 h-11 w-20 cursor-pointer opacity-50 opacity-90 transition-all duration-200" />
      </DialogTrigger>
      <DialogContent className="dark text-foreground">
        <DialogHeader>
          <DialogTitle className="">Legend</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <Legend className="h-24 w-40" />
        </div>
        <div className="grid grid-cols-2 place-items-center">
          <p>ES - Early Start</p>
          <p>LS - Late Start</p>
          <p>R - Remaining</p>
          <p>LF - Late Finish</p>
          <p>EF - Early Finish</p>
          <p>S - Slack</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
