import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { InputLabel } from "@/components/input-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth.context";
import { loginSchema } from "@/schemas/login.schema";
import { getApiErrorMessage } from "@/shared/helpers/api-error.helper";
import {
  getRememberedEmail,
  setRememberedEmail,
} from "@/shared/helpers/remember-email.helper";
import type { LoginFormData } from "@/types/login-form.types";

const rememberedEmail = getRememberedEmail();

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormData>,
    defaultValues: {
      email: rememberedEmail ?? "",
      password: "",
      rememberMe: !!rememberedEmail,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    if (data.rememberMe) {
      setRememberedEmail(data.email);
    } else {
      setRememberedEmail(null);
    }

    try {
      await login({ email: data.email, password: data.password });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Credenciais inválidas"));
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

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember-me"
              checked={field.value}
              onCheckedChange={(checked) =>
                field.onChange(checked === true)
              }
            />
            <Label
              htmlFor="remember-me"
              className="cursor-pointer text-sm font-normal text-muted-foreground"
            >
              Lembrar minha conta
            </Label>
          </div>
        )}
      />

      <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
