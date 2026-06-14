"use client";

import { login, signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { type AuthFormData, authSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export function AuthForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: AuthFormData) {
    setIsPending(true);
    const action = isLogin ? login : signup;
    const result = await action(data);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    router.push("/tasks");
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {isLogin ? "Login to your account" : "Sign up for an account"}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {isLogin
              ? "Enter your email below to login to your account"
              : "Enter your email and password to create an account"}
          </p>
          {isLogin && (
            <p
              className="text-xs text-muted-foreground underline underline-offset-2 cursor-pointer text-right"
              onClick={() => {
                form.setValue(
                  "email",
                  process.env.NEXT_PUBLIC_DEMO_MAIL as string,
                );
                form.setValue(
                  "password",
                  process.env.NEXT_PUBLIC_DEMO_PASSWORD as string,
                );
              }}
            >
              Use demo credentials
            </p>
          )}
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup className="max-w-xs">
                <InputGroupInput
                  placeholder="demo@123"
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon
                  align="inline-end"
                  className="cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button disabled={isPending} type="submit">
            {isLogin ? "Login" : "Sign up"}
          </Button>
        </Field>
        <FieldSeparator>
          or{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </FieldSeparator>
      </FieldGroup>
    </form>
  );
}
