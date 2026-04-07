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
    <div className="min-h-screen bg-linear-to-br from-emerald-50/50 via-background to-emerald-100/30 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10">
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Hello, {session.user.name || session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              New Subscription
            </Button>
            <form action={signOut}>
              <Button variant="outline" size="icon" type="submit" className="glass-subtle">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend (Est.)</CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalMonthlySpend, 'BRL')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Base: USD 1 = R$ 6</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeCount === 1 ? 'subscription' : 'subscriptions'} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions[0] 
                  ? format(subscriptions[0].nextBillingDate, 'dd/MM') 
                  : '--'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {subscriptions[0]?.name || 'No upcoming'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {sub.category.toLowerCase()} • {sub.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(Number(sub.price), sub.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due: {format(sub.nextBillingDate, "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {subscriptions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No subscriptions found.</p>
                  <Button variant="link" className="text-primary mt-2">
                    Add your first subscription
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}