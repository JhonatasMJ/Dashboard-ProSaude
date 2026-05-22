import type { IUserRegisterRequest } from "@/shared/interfaces/https/user-register-request";
import type { UserRegisterFormData } from "@/types/user-register-form.types";

export function formToUserRegisterPayload(
  data: UserRegisterFormData
): IUserRegisterRequest {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
  };
}
