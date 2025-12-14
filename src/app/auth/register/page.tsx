import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { register } from "@/server/actions/auth"
import { UserPlus } from "lucide-react"

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { email?: string }
}) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[420px] shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-2">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha seus dados para criar seu acesso. Em seguida, enviaremos um Magic Link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={register} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="name"
                type="text"
                placeholder="Seu nome"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                required
                defaultValue={email}
                className="h-11"
              />
            </div>

            <Button className="w-full h-11 text-base font-medium" type="submit">
              Criar conta e enviar link
            </Button>

            <p className="text-xs text-center text-muted-foreground px-4">
              Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
