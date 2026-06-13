import * as yup from "yup";
import type { IUserRegisterRequest } from "@/shared/interfaces/https/user-register-request";

export const userRegisterSchema = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Informe pelo menos 2 caracteres"),
  email: yup
    .string()
    .email("Informe um e-mail válido")
    .required("E-mail é obrigatório"),
  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: yup
    .string()
    .required("Confirme a senha")
    .oneOf([yup.ref("password")], "As senhas não coincidem"),
});

export type UserRegisterFormData = yup.InferType<typeof userRegisterSchema>;

export function formToUserRegisterPayload(
  data: UserRegisterFormData
): IUserRegisterRequest {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
  };
}
