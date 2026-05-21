export const STORAGE_REMEMBER_EMAIL_KEY = "pro-saude-remember-email";

export function getRememberedEmail(): string | null {
  return localStorage.getItem(STORAGE_REMEMBER_EMAIL_KEY);
}

export function setRememberedEmail(email: string | null): void {
  if (email) {
    localStorage.setItem(STORAGE_REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(STORAGE_REMEMBER_EMAIL_KEY);
  }
}
