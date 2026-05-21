import { yupResolver } from "@hookform/resolvers/yup";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/input-label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { loginSchema } from "@/schemas/login.schema";
import type { LoginFormData } from "@/types/login-form.types";

interface ApiErrorBody {
  message?: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormData>,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      await login(data);
    } catch (error) {
      const message = isAxiosError<ApiErrorBody>(error)
        ? (error.response?.data?.message ?? "Credenciais inválidas")
        : "Não foi possível entrar. Tente novamente.";

      setError("root", { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
      noValidate
    >
      <InputLabel
        control={control}
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
      />

      <InputLabel
        control={control}
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {errors.root && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
