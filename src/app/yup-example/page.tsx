"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import * as yup from "yup";
import {
  TextInput,
  EmailInput,
  NumberInput,
  UrlInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
} from "@/components/form";

const formSchema = yup.object({
  username: yup
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be at most 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscore"
    )
    .required("Username is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  age: yup
    .number()
    .typeError("Age is required")
    .integer("Age must be a whole number")
    .min(18, "Must be at least 18")
    .max(120, "Invalid age")
    .required("Age is required"),
  website: yup
    .string()
    .url("Invalid URL")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  bio: yup
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be at most 500 characters")
    .required("Bio is required"),
  role: yup
    .string()
    .oneOf(["user", "admin", "guest"], "Please select a role")
    .required("Please select a role"),
  newsletter: yup.boolean().required(),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms")
    .required("You must accept the terms"),
});

type FormData = yup.InferType<typeof formSchema>;

type FormState = Omit<FormData, "terms" | "age"> & {
  terms: boolean;
  age: number | undefined;
};

const defaultValues: FormState = {
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
] as const;

export default function YupExamplePage() {
  const [formData, setFormData] = useState<FormState>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = e.target.type;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      age: formData.age === undefined ? undefined : Number(formData.age),
      website: formData.website || undefined,
    };

    try {
      await formSchema.validate(payload, { abortEarly: false });
      toast.success("Form submitted successfully!");
    } catch (err) {
      if (yup.ValidationError.isError(err)) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        for (const inner of err.inner) {
          const path = inner.path as keyof FormData | undefined;
          if (path !== undefined && !fieldErrors[path]) {
            fieldErrors[path] = inner.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
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
        <h1 className="mb-8 text-2xl font-semibold">Yup form example</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TextInput
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="johndoe"
          />

          <EmailInput
            id="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />

          <NumberInput
            id="age"
            name="age"
            label="Age"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            placeholder="25"
            min={18}
            max={120}
          />

          <UrlInput
            id="website"
            name="website"
            label="Website (optional)"
            value={formData.website ?? ""}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://example.com"
          />

          <TextareaInput
            id="bio"
            name="bio"
            label="Bio"
            value={formData.bio}
            onChange={handleChange}
            error={errors.bio}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          <SelectInput
            id="role"
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            options={[...ROLE_OPTIONS]}
          />

          <CheckboxInput
            id="newsletter"
            name="newsletter"
            label="Subscribe to newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
          />

          <CheckboxInput
            id="terms"
            name="terms"
            label="I accept the terms and conditions"
            checked={formData.terms}
            onChange={handleChange}
            error={errors.terms}
            showErrorBelow
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
