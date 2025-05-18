import { z } from "zod";
import { actionSchema } from "../CPMForm/CPMForm.utils";

export const jsonSchema = z.object({
  actions: z.array(actionSchema),
});

export type ActionData = z.infer<typeof jsonSchema>;

export const fileInputSchema = z.object({
  file: z.instanceof(File).refine((file) => file.type === "application/json", {
    message: "File must be a JSON file",
  }),
});

export type FileInputSchema = z.infer<typeof fileInputSchema>;

export const handleFileRead = async (
  file: File,
  onFileUpload: (data: ActionData) => void,
  setError: (
    field: "file" | "root" | `root.${string}`,
    error: { message: string },
  ) => void,
  setOpen: (open: boolean) => void,
) => {
  const reader = new FileReader();

  return new Promise<void>((resolve, reject) => {
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        const result = jsonSchema.safeParse(parsed);

        if (result.success) {
          console.log("Valid data:", result.data);
          onFileUpload(result.data);
          setOpen(false);
        } else {
          console.error("Validation errors:", result.error);
          setError("file", {
            message:
              "Invalid format: " +
              result.error.errors.map((e) => e.message).join(", "),
          });
        }
      } catch (error) {
        console.error(error);
        setError("file", { message: "Invalid JSON format" });
      }
      resolve();
    };

    reader.onerror = () => {
      console.error("Error reading file");
      setError("file", { message: "Error reading file" });
      reject(new Error("FileReader encountered an error"));
    };

    reader.readAsText(file);
  });
};
