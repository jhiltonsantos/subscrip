import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, CalendarDays, LogOut } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils/formatters"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { signOut } from "@/server/actions/auth"

export const revalidate = 0

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/login")
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { nextBillingDate: 'asc' }
  });

  const totalMonthlySpend = subscriptions.reduce((acc, sub) => {
    const multiplier = sub.currency === 'USD' ? 6 : 1
    const price = Number(sub.price) * multiplier
    
    return acc + (sub.billingCycle === 'YEARLY' ? price / 12 : price)
  }, 0)

  const activeCount = subscriptions.filter(s => s.active).length

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Olá, {session.user.name || session.user.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>Nova Assinatura</Button>
          <form action={signOut}>
            <Button variant="outline" size="icon" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensal (Est.)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpend, 'BRL')}</div>
            <p className="text-xs text-muted-foreground">Conversão base: USD 1 = R$ 6</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Fatura</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions[0] 
                ? format(subscriptions[0].nextBillingDate, 'dd/MM') 
                : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptions[0]?.name || 'Nenhuma'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Suas Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {sub.category.toLowerCase()} • {sub.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(Number(sub.price), sub.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vence: {format(sub.nextBillingDate, "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {subscriptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma assinatura encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}