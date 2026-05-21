import { useAuth } from "@/contexts/auth.context";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Olá, {user?.name}
      </h1>
      <p className="text-muted-foreground">
        Bem-vindo ao painel administrativo da ProSaúde.
      </p>
    </div>
  );
}
