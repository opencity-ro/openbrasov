import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <h1 className="font-heading text-4xl font-bold">Open Brașov</h1>
      <p className="text-muted-foreground">Verificare tokens: ș ț Ș Ț ă â î.</p>
      <div className="flex gap-3">
        <Button size="lg">Primar</Button>
        <Button size="lg" variant="accent">
          Sesizează
        </Button>
        <Button size="lg" variant="outline">
          Outline
        </Button>
      </div>
    </main>
  );
}
