import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  ActionData,
  fileInputSchema,
  FileInputSchema,
  handleFileRead,
} from "./ReadFromFile.utils";

export default function ReadFromFile({
  onFileUpload,
}: {
  onFileUpload: (data: ActionData) => void;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FileInputSchema>({
    resolver: zodResolver(fileInputSchema),
  });

  async function onSubmit(values: FileInputSchema) {
    try {
      console.log("Submitting file:", values.file);
      await handleFileRead(
        values.file,
        onFileUpload,
        (field, error) => {
          console.log("Setting error:", field, error);
          form.setError(field, error);
        },
        setOpen,
      );
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost">
          Insert from file
        </Button>
      </DialogTrigger>
      <DialogContent className="dark text-foreground">
        <DialogHeader>
          <DialogTitle>Read data from file</DialogTitle>
          <DialogDescription>
            The format of the file should be as follows:
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 mb-4 w-full">
          <code className="block w-full rounded-md bg-gray-900 p-2">
            {"{"}
            <br />
            &nbsp;&nbsp;"actions": [
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{"{"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "A",
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"duration": 1,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"dependency": "1-2"
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{"}"}
            <br />
            &nbsp;&nbsp;]
            <br />
            {"}"}
          </code>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Form submission intercepted");
              form.handleSubmit((values) => {
                console.log("Form submitted through handler");
                onSubmit(values);
              })(e);
              return false; // additional prevention
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".json"
                      {...fieldProps}
                      onChange={(event) => {
                        const file =
                          event.target.files && event.target.files[0];
                        onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Please upload a JSON file.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Load</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
