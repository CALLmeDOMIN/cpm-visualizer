import type { Action } from "@/lib/CPM/cpm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import MultiSelect from "./MultiSelect";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const createFormSchema = (graphType: "AoA" | "AoN") => {
  const actionSchema = z.object({
    name: z.string().min(1, "Nazwa jest wymagana"),
    duration: z.coerce.number().min(1, "Czas musi być dodatni"),
    dependency:
      graphType === "AoA"
        ? z
            .string()
            .regex(/^\d+-\d+(,\s*\d+-\d+)*$/, "Format: 1-2, 2-3")
            .optional()
        : z.string().optional(),
    dependencyNames:
      graphType === "AoN"
        ? z.array(z.string()).optional()
        : z.array(z.string()).optional(),
  });

  return z.object({
    actions: z.array(actionSchema).superRefine((actions, ctx) => {
      const nameMap = new Map();
      actions.forEach((action, index) => {
        if (action.name && nameMap.has(action.name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nazwa musi być unikalna",
            path: [`${index}.name`],
          });
        } else {
          nameMap.set(action.name, true);
        }
      });

      if (graphType === "AoA") {
        const dependencyPaths = new Set();

        actions.forEach((action, index) => {
          if (!action.dependency) return;

          const dependencies = action.dependency
            .split(",")
            .map((dep) => dep.trim());

          dependencies.forEach((dep) => {
            if (!dep) return;

            const match = dep.match(/^(\d+)-(\d+)$/);
            if (!match) return;

            const [, start, end] = match;
            const path = `${start}-${end}`;
            const reversePath = `${end}-${start}`;

            if (dependencyPaths.has(path)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Ścieżka ${path} jest już używana`,
                path: [`${index}.dependency`],
              });
            }

            if (dependencyPaths.has(reversePath)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Ścieżka ${path} jest sprzeczna z istniejącą ścieżką ${reversePath}`,
                path: [`${index}.dependency`],
              });
            }

            dependencyPaths.add(path);
          });
        });
      } else if (graphType === "AoN") {
        const dependencyGraph = new Map();

        actions.forEach((action) => {
          if (!action.name) return;
          dependencyGraph.set(action.name, action.dependencyNames || []);
        });

        const checkForCycles = (
          node: string,
          visited: Set<string>,
          path: Set<string>,
        ) => {
          if (path.has(node)) return true;
          if (visited.has(node)) return false;

          visited.add(node);
          path.add(node);

          const dependencies = dependencyGraph.get(node) || [];
          for (const dep of dependencies) {
            if (checkForCycles(dep, visited, path)) return true;
          }

          path.delete(node);
          return false;
        };

        actions.forEach((action, index) => {
          if (!action.name) return;

          const visited = new Set<string>();
          const path = new Set<string>();

          if (checkForCycles(action.name, visited, path)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Wykryto cykl w zależnościach",
              path: [`${index}.dependencyNames`],
            });
          }
        });
      }
    }),
  });
};

export const CPMForm = ({
  setActions,
  graphType,
}: {
  setActions: (actions: Action[]) => void;
  graphType: "AoA" | "AoN";
}) => {
  const [formSchema, setFormSchema] = useState(() =>
    createFormSchema(graphType),
  );

  useEffect(() => {
    setFormSchema(createFormSchema(graphType));
  }, [graphType]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actions: [{}],
    },
  });

  useEffect(() => {
    form.reset({
      actions: [
        {
          name: "",
          duration: 1,
          dependency: "",
          dependencyNames: [],
        },
      ],
    });
  }, [graphType, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const formValues = useWatch({
    control: form.control,
    name: "actions",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const actions: Action[] = values.actions.map((action) => {
      let dependencies: string[] = [];

      if (graphType === "AoA" && action.dependency) {
        dependencies = action.dependency
          .split(",")
          .map((dep) => dep.trim())
          .filter(Boolean);
      } else if (graphType === "AoN" && action.dependencyNames) {
        dependencies = action.dependencyNames;
      }

      return {
        name: action.name,
        duration: Number(action.duration),
        dependencies,
      };
    });

    setActions(actions);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ScrollArea className="h-[70vh] rounded-md">
          <Table>
            <TableHeader className="bg-card sticky top-0 rounded-t-md">
              <TableRow>
                <TableHead>Czynność</TableHead>
                <TableHead>Czas trwania, dni</TableHead>
                <TableHead>
                  {graphType === "AoA" ? "Następstwo zdarzeń" : "Poprzedniki"}
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`actions.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="A, B, C..."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`actions.${index}.duration`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              placeholder="1"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {graphType === "AoA" ? (
                      <FormField
                        control={form.control}
                        name={`actions.${index}.dependency`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="1-2, 2-3"
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name={`actions.${index}.dependencyNames`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <MultiSelect
                                options={formValues
                                  ?.filter(
                                    (action, i) => action.name && i !== index,
                                  )
                                  .map((action) => ({
                                    value: action.name,
                                    label: action.name,
                                  }))}
                                selected={field.value || []}
                                onChange={field.onChange}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="cursor-pointer"
                    >
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              append({
                name: "",
                duration: 1,
                dependency: "",
                dependencyNames: [],
              })
            }
            type="button"
            className="cursor-pointer font-semibold"
          >
            Dodaj czynność
          </Button>
          <Button className="cursor-pointer font-semibold" type="submit">
            Generuj
          </Button>
        </div>
      </form>
    </Form>
  );
};
