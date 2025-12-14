import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/server/actions/auth" 
import { Mail } from "lucide-react"

export default async function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string; email?: string }
}) {
  const [searchParamsData] = await Promise.all([searchParams])
  const error = searchParamsData?.error ? searchParamsData.error : ""
  const email = searchParamsData?.email ? searchParamsData.email : ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[380px] shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Acessar Subscrip</CardTitle>
          <CardDescription>
            Faça login com seu email. Se você ainda não tem conta, crie uma em /auth/register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "user_not_found" && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Usuário não encontrado. Crie sua conta antes de tentar fazer login.
            </div>
          )}
          <form action={login} className="space-y-4">
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
              Enviar Link de Acesso
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
