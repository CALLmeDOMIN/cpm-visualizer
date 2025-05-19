import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

export default function MultiSelect({
  options,
  selected = [],
  onChange,
  className,
}: {
  options: Option[];
  selected: string[] | undefined;
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const safeSelected = Array.isArray(selected) ? selected : [];

  const handleUnselect = (item: string) => {
    onChange(safeSelected.filter((i) => i !== item));
  };

  const displayLimit = 2;
  const shouldShowCounter = safeSelected.length > displayLimit;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`h-9 min-h-9 w-full justify-between truncate px-3 ${className}`}
        >
          <div className="flex w-full flex-nowrap items-center overflow-hidden">
            {safeSelected.length === 0 ? (
              <span className="text-muted-foreground">
                Wybierz poprzedniki...
              </span>
            ) : shouldShowCounter ? (
              <div className="flex items-center">
                {safeSelected.slice(0, displayLimit).map((item) => (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {item}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                <Badge variant="outline">
                  +{safeSelected.length - displayLimit}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 overflow-hidden">
                {safeSelected.map((item) => (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="mr-1 whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {item}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="dark text-foreground w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Szukaj czynności..." />
          <CommandEmpty>Nie znaleziono.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  onChange(
                    safeSelected.includes(option.value)
                      ? safeSelected.filter((item) => item !== option.value)
                      : [...safeSelected, option.value],
                  );
                }}
              >
                <div className="flex items-center">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      safeSelected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
