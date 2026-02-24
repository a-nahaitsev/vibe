"use client";

import Link from "next/link";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { z } from "zod";
import {
  TextInput,
  EmailInput,
  NumberInput,
  UrlInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
} from "@/components/form";

const formSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, { error: "Only letters, numbers and underscore" }),
  email: z.string().email("Invalid email address"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(18, "Must be at least 18")
    .max(120, "Invalid age"),
  website: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional(),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be at most 500 characters"),
  role: z.enum(["user", "admin", "guest"], {
    error: "Please select a role",
  }),
  newsletter: z.boolean(),
  terms: z.literal(true, { error: "You must accept the terms" }),
});

type FormData = z.infer<typeof formSchema>;

/** Form state type: allows optional age and boolean terms for initial state. */
type FormValues = Omit<FormData, "terms" | "age"> & {
  terms: boolean;
  age?: number;
};

const defaultValues: FormValues = {
  username: "",
  email: "",
  age: undefined,
  website: "",
  bio: "",
  role: "user",
  newsletter: false,
  terms: false,
};

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Guest" },
];

export default function ReactHookFormExamplePage() {
  const { control, handleSubmit } = useForm<FormValues, unknown, FormData>({
    defaultValues,
    resolver: zodResolver(formSchema) as Resolver<FormValues, unknown, FormData>,
    mode: "onSubmit",
  });

  const onSubmit = () => {
    toast.success("Form submitted successfully!");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Welcome
        </Link>
        <h1 className="mb-8 text-2xl font-semibold">
          React Hook Form example
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <TextInput
                id="username"
                name={field.name}
                label="Username"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="johndoe"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <EmailInput
                id="email"
                name={field.name}
                label="Email"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="you@example.com"
              />
            )}
          />

          <Controller
            control={control}
            name="age"
            render={({ field, fieldState }) => (
              <NumberInput
                id="age"
                name={field.name}
                label="Age"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                error={fieldState.error?.message}
                placeholder="25"
                min={18}
                max={120}
              />
            )}
          />

          <Controller
            control={control}
            name="website"
            render={({ field, fieldState }) => (
              <UrlInput
                id="website"
                name={field.name}
                label="Website (optional)"
                value={field.value ?? ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="https://example.com"
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field, fieldState }) => (
              <TextareaInput
                id="bio"
                name={field.name}
                label="Bio"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            )}
          />

          <Controller
            control={control}
            name="role"
            render={({ field, fieldState }) => (
              <SelectInput
                id="role"
                name={field.name}
                label="Role"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={[...ROLE_OPTIONS]}
              />
            )}
          />

          <Controller
            control={control}
            name="newsletter"
            render={({ field }) => (
              <CheckboxInput
                id="newsletter"
                name={field.name}
                label="Subscribe to newsletter"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="terms"
            render={({ field, fieldState }) => (
              <CheckboxInput
                id="terms"
                name={field.name}
                label="I accept the terms and conditions"
                checked={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                showErrorBelow
              />
            )}
          />

          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
