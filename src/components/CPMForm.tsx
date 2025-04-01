import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const actionSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  duration: z.number(),
  dependency: z
    .string()
    .regex(
      /^(\d+-\d+)(,\s*\d+-\d+)*$|^$/,
      "Format should be like '1-2, 3-4' or empty",
    ),
  // .optional() // for AoN
  // .or(z.literal("")),
});

const formSchema = z.object({
  actions: z.array(actionSchema),
});

export const NewCPMForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actions: [
        {
          name: "",
          duration: 1,
          dependency: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Table>
          <TableHeader>
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
                            placeholder="1-2, 2-3, ..."
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
        <div className="flex justify-end gap-2">
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
