import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Usuários
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Cadastre pessoas autorizadas a acessar o dashboard com e-mail e senha.
        </p>
      </header>

      <UsersTable />
    </div>
  );
}
