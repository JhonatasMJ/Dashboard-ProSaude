export type UserRole = "ADMIN";

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface IAuthenticateResponse {
  user: IUser;
  token: string;
}
