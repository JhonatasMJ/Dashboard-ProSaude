import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";
import cover from "@/assets/login-cover.jpg";
import { LoginForm } from "@/components/Forms/LoginForm";
import { useAuth } from "@/contexts/auth.context";  

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="flex flex-col justify-center bg-background px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <img
            src={logo}
            alt="ProSaúde"
            className="mb-10 h-16 w-auto max-w-[240px] object-contain object-left"
          />

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o painel administrativo.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mx-auto mt-12 w-full max-w-md text-xs text-muted-foreground  text-center">
          © {new Date().getFullYear()} ProSaúde. Todos os direitos reservados.
        </p>
      </section>

      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={cover}
          alt="ProSaúde"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-secondary/90 via-secondary/70 to-primary/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_50%)]" />

        <div className="relative flex h-full flex-col justify-end p-12 pb-14 text-primary-foreground">
          <div className="max-w-md space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest opacity-80">
              Gestão em saúde
            </p>
            <blockquote className="text-2xl font-semibold leading-snug text-balance">
              “Cuidar de pessoas começa com dados organizados e decisões
              assertivas.”
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
