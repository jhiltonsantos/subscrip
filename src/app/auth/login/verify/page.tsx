import { Mail } from "lucide-react"

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 rounded-lg border bg-card p-8 text-center shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold">Verifique seu email</h1>
        
        <p className="text-muted-foreground">
          Um link de acesso foi enviado para o seu email. 
          Clique no link para entrar na sua conta.
        </p>
        
        <p className="text-sm text-muted-foreground">
          Não recebeu o email? Verifique sua pasta de spam.
        </p>
      </div>
    </div>
  )
}
