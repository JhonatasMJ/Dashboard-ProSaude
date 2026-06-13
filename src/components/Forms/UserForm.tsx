import { yupResolver } from "@hookform/resolvers/yup";
import type { ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/Button";
import { userRegisterSchema } from "@/schemas/user-register.schema";
import type { UserRegisterFormData } from "@/schemas/user-register.schema";
import { cn } from "@/lib/utils";

interface UserFormProps {
  isSubmitting?: boolean;
  submitLabel: string;
  formId?: string;
  variant?: "default" | "sheet";
  onSubmit: (data: UserRegisterFormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: UserRegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function UserForm({
  isSubmitting = false,
  submitLabel,
  formId = "user-form",
  variant = "default",
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isSheet = variant === "sheet";

  const { control, handleSubmit } = useForm<UserRegisterFormData>({
    resolver: yupResolver(userRegisterSchema) as Resolver<UserRegisterFormData>,
    defaultValues: emptyValues,
  });

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(isSheet ? "space-y-8" : "flex flex-col gap-4")}
      noValidate
    >
      <FormSection
        title="Acesso ao painel"
        description="O usuário entrará com o e-mail e a senha definidos abaixo."
      >
        <InputLabel
          control={control}
          name="name"
          label="Nome completo"
          autoComplete="name"
          placeholder="Nome do usuário"
        />

        <InputLabel
          control={control}
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="usuario@empresa.com"
        />

        <InputLabel
          control={control}
          name="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />

        <InputLabel
          control={control}
          name="confirmPassword"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
        />
      </FormSection>

      {!isSheet && onCancel && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-md"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="rounded-md" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
