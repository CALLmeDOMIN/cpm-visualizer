import type { Action } from "@/lib/CPM/cpm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import ReadFromFile from "../ReadFromFile/ReadFromFile";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cpmFormSchema, FormSchema, onFileUpload } from "./CPMForm.utils";

export const CPMForm = ({
  setActions,
}: {
  setActions: (actions: Action[]) => void;
}) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(cpmFormSchema),
    defaultValues: {
      actions: [{}],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  function onSubmit(values: FormSchema) {
    const actions: Action[] = values.actions.map((action) => {
      const dependencies = action.dependency
        ? action.dependency
            .split(",")
            .map((dep) => dep.trim())
            .filter(Boolean)
        : [];

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
                <TableHead>Następstwo zdarzeń</TableHead>
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
                    <FormField
                      control={form.control}
                      name={`actions.${index}.dependency`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1-2"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
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
          <ReadFromFile onFileUpload={onFileUpload} />
          <Button
            variant="secondary"
            onClick={() =>
              append({
                name: "",
                duration: 1,
                dependency: "",
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
