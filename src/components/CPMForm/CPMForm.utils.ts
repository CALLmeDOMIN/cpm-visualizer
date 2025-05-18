import { z } from "zod";
import { ActionData } from "../ReadFromFile/ReadFromFile.utils";

export const actionSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  duration: z.coerce.number(),
  dependency: z
    .string()
    .min(1, "Zależność jest wymagana")
    .regex(/^\d+-\d+$/, "Format: 1-2"),
});

export const cpmFormSchema = z.object({
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
            path: [`${index}.dependen   cy`],
          });
        }

        dependencyPaths.add(path);
      });
    });
  }),
});

export type Action = z.infer<typeof actionSchema>;
export type FormSchema = z.infer<typeof cpmFormSchema>;

export const onFileUpload = (data: ActionData) => {
  console.log("File data:", data);
};
