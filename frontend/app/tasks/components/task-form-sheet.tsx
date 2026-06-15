"use client";

import { createTask, updateTask, type Task } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z.string().max(1000, "Description too long").optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

type TaskFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSaved: () => void;
};

const statusLabels: Record<string, string> = {
  all: "All Status",
  todo: "TODO",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskFormSheet({
  open,
  onOpenChange,
  task,
  onSaved,
}: TaskFormSheetProps) {
  const isEditing = !!task;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
      });
    }
  }, [task, form]);

  async function onSubmit(data: TaskFormData) {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date
        ? new Date(data.due_date).toISOString()
        : undefined,
    };

    const result = isEditing
      ? await updateTask(task!.id, payload)
      : await createTask(payload);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Task updated" : "Task created");

    form.reset({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
    });

    onOpenChange(false);
    onSaved();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            due_date: "",
          });
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Task" : "Create New Task"}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Task Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="e.g., Finalize presentation deck"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Add any relevant details or links here..."
                    rows={4}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Status">
                        {(value: string | null) =>
                          value ? (statusLabels[value] ?? value) : "Status"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value="todo">TODO</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant={field.value === p ? "default" : "outline"}
                        onClick={() => field.onChange(p)}
                        className="capitalize"
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </Field>
              )}
            />

            <Controller
              name="due_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          id="due_date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          aria-invalid={fieldState.invalid}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pick a date"}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save Task
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
