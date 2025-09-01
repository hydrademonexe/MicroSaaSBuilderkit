import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useOrders, useAlerts, useProducts, useIngredients } from "@/hooks/use-database";
import { database } from "@/lib/database";
import { AlertTriangle, ExternalLink, Plus, Bell } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

export default function Dashboard() {
  const { orders } = useOrders();
  const { alerts } = useAlerts();
  const { products } = useProducts();
  const { ingredients } = useIngredients();
  const [monthlyStats, setMonthlyStats] = useState({
    totalCosts: 0,
    totalSales: 0,
    totalProfit: 0,
    activeOrders: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get orders from this month
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfMonth;
      });

      // Only count paid orders for revenue
      const paidOrders = monthlyOrders.filter(order => order.status === 'pago' || order.status === 'entregue');
      
      const totalSales = paidOrders.reduce((sum, order) => sum + order.valorTotal, 0);

      // Calculate real costs using database method
      const totalCosts = await database.calculateCMV(paidOrders);

      const activeOrders = orders.filter(order => 
        order.status === 'pendente' || (order.status === 'pago' && !order.deliveredAt)
      ).length;

      setMonthlyStats({
        totalCosts,
        totalSales,
        totalProfit: totalSales - totalCosts,
        activeOrders
      });
    };

    if (orders.length > 0) {
      calculateStats();
    }
  }, [orders, products, ingredients]);

  const unreadAlerts = alerts.filter(alert => !alert.lida).slice(0, 3);
  const totalAlerts = alerts.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Title */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="card-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-money-bill-wave text-primary"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Custos</p>
                    <p className="text-sm sm:text-lg font-bold text-foreground truncate" data-testid="text-total-costs">
                      {formatCurrency(monthlyStats.totalCosts)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Vendas</p>
                    <p className="text-sm sm:text-lg font-bold text-foreground truncate" data-testid="text-total-sales">
                      {formatCurrency(monthlyStats.totalSales)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-coins text-secondary"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className="text-sm sm:text-lg font-bold text-foreground truncate" data-testid="text-total-profit">
                      {formatCurrency(monthlyStats.totalProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shopping-bag text-blue-600"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Ativos</p>
                    <p className="text-sm sm:text-lg font-bold text-foreground truncate" data-testid="text-active-orders">
                      {monthlyStats.activeOrders}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Action Button */}
        <section>
          <Link href="/customers">
            <Button 
              className="w-full gradient-bg text-primary-foreground py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg touch-target card-shadow"
              data-testid="button-new-record"
            >
              <Plus className="mr-2" size={18} />
              + Novo Registro
            </Button>
          </Link>
        </section>

        {/* Alerts */}
        {unreadAlerts.length > 0 && (
          <section className="space-y-2 sm:space-y-3">
            <Card className="card-shadow">
              <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-primary" />
                  <span className="text-sm font-medium">Alertas</span>
                </div>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium" data-testid="badge-alerts-count">
                  {totalAlerts}
                </span>
              </CardContent>
            </Card>
            {unreadAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`border-l-4 ${
                  alert.tipo === 'vencimento_proximo' 
                    ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
                }`}
              >
                <CardContent className="p-3 sm:p-4 flex items-start space-x-3">
                  <AlertTriangle 
                    className={alert.tipo === 'vencimento_proximo' ? 'text-yellow-600' : 'text-orange-600'} 
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground leading-tight">{alert.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Main Modules */}
        <section className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Ferramentas do Negócio</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/pricing">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-calculator text-primary text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Precificação</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Custos e margens</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/orders">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shopping-bag text-orange-600 text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Pedidos</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Gerenciar vendas</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/inventory">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-boxes text-blue-600 text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Estoque</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Ingredientes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customers">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-users text-green-600 text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Clientes</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Leads e vendas</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-chart-bar text-purple-600 text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Relatórios</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Análise financeira</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/production">
              <Card className="touch-target card-shadow">
                <CardContent className="p-3 sm:p-4 flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-tasks text-secondary text-base sm:text-lg"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base leading-tight">Produção</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Cronograma</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}