import { cn } from "@/lib/utils";

export default function Legend({ className }: { className?: string }) {
  return (
    <div className={cn("p-0.5", className)}>
      <div className="text-foreground grid h-full w-full grid-cols-3 rounded-sm border border-white bg-gray-900 text-xs">
        <div className="grid h-full w-full place-items-center border-r border-b border-white">
          ES
        </div>
        <div className="grid h-full w-full place-items-center border-b border-white">
          R
        </div>
        <div className="grid h-full w-full place-items-center border-b border-l border-white">
          EF
        </div>
        <div className="grid h-full w-full place-items-center border-r border-white">
          LS
        </div>
        <div className="grid h-full w-full place-items-center">S</div>
        <div className="grid h-full w-full place-items-center border-l border-white">
          LF
        </div>
      </div>
    </div>
  );
}
