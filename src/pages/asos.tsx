import { AsosTable } from "@/components/asos/asos-table";

export default function AsosPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Emissão de ASO
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Emita, edite e exclua atestados de saúde ocupacional com exames e
          riscos associados.
        </p>
      </header>

      <AsosTable />
    </div>
  );
}
