import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-bold">Subscrip</h1>
        <div className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Começar Agora</Link>
            </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center space-y-8 p-8 text-center bg-gray-50">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Controle suas assinaturas <br/> em um só lugar.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Pare de perder dinheiro com renovações esquecidas. O Subscrip te avisa antes da fatura chegar.
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-lg">
          <Link href="/login">Criar Conta Grátis</Link>
        </Button>
      </main>
    </div>
  );
}