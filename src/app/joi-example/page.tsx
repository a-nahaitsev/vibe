"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import Joi from "joi";
import {
  TextInput,
  EmailInput,
  NumberInput,
  UrlInput,
  TextareaInput,
  SelectInput,
  CheckboxInput,
} from "@/components/form";

const formSchema = Joi.object({
  username: Joi.string()
    .min(2)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      "string.min": "Username must be at least 2 characters",
      "string.max": "Username must be at most 20 characters",
      "string.pattern.base": "Only letters, numbers and underscore",
    })
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({ "string.email": "Invalid email address" })
    .required(),
  age: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .messages({
      "number.base": "Age is required",
      "number.integer": "Age must be a whole number",
      "number.min": "Must be at least 18",
      "number.max": "Invalid age",
    })
    .required(),
  website: Joi.alternatives()
    .try(Joi.string().uri().messages({ "string.uri": "Invalid URL" }), Joi.string().allow(""))
    .optional(),
  bio: Joi.string()
    .min(10)
    .max(500)
    .messages({
      "string.min": "Bio must be at least 10 characters",
      "string.max": "Bio must be at most 500 characters",
    })
    .required(),
  role: Joi.string()
    .valid("user", "admin", "guest")
    .messages({ "any.only": "Please select a role" })
    .required(),
  newsletter: Joi.boolean().required(),
  terms: Joi.boolean()
    .valid(true)
    .messages({ "any.only": "You must accept the terms" })
    .required(),
});

type FormData = {
  username: string;
  email: string;
  age: number;
  website?: string;
  bio: string;
  role: "user" | "admin" | "guest";
  newsletter: boolean;
  terms: boolean;
};

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

export default function JoiExamplePage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      age: formData.age === undefined ? undefined : Number(formData.age),
      website: formData.website || undefined,
    };

    const result = formSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const detail of result.error.details) {
        const path = detail.path[0] as keyof FormData | undefined;
        if (path !== undefined && !fieldErrors[path]) {
          fieldErrors[path] = detail.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

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
        <h1 className="mb-8 text-2xl font-semibold">Joi form example</h1>

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
