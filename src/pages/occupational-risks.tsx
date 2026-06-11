import { OccupationalRisksTable } from "@/components/occupational-risks/occupational-risks-table";

export default function OccupationalRisksPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-1 text-3xl font-bold tracking-tight text-foreground">
          Riscos Ocupacionais
          <span className="text-primary">.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Liste, cadastre, edite e exclua riscos ocupacionais por categoria e
          descrição.
        </p>
      </header>

      <OccupationalRisksTable />
    </div>
  );
}
