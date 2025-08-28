import { useEffect, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useOrders, useAlerts } from "@/hooks/use-database";
import { database } from "@/lib/database";
import { AlertTriangle, ExternalLink, Plus } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { orders } = useOrders();
  const { alerts } = useAlerts();

  const stats = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.dataPedido);
      return orderDate >= startOfMonth;
    });

    const totalSales = monthlyOrders
      .filter(order => order.status === 'entregue' || order.status === 'pago')
      .reduce((sum, order) => sum + order.valorTotal, 0);

    const activeOrders = orders.filter(order => 
      order.status === 'pendente' || order.status === 'pago'
    ).length;

    // Simplified cost calculation - in a real app this would be more sophisticated
    const estimatedCosts = totalSales * 0.4; // Assuming 40% cost ratio
    const estimatedProfit = totalSales - estimatedCosts;

    return {
      totalCosts: estimatedCosts,
      totalSales,
      totalProfit: estimatedProfit,
      activeOrders
    };
  }, [orders]);

  const unreadAlerts = alerts.filter(alert => !alert.lida).slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Dashboard Title */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-money-bill-wave text-primary"></i>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Custos Totais</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-total-costs">
                      {formatCurrency(stats.totalCosts)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vendas</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-total-sales">
                      {formatCurrency(stats.totalSales)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-coins text-secondary"></i>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-total-profit">
                      {formatCurrency(stats.totalProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-shopping-bag text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pedidos Ativos</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-active-orders">
                      {stats.activeOrders}
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
              className="w-full gradient-bg text-primary-foreground py-4 px-6 text-lg touch-target card-shadow"
              data-testid="button-new-record"
            >
              <Plus className="mr-2" size={20} />
              + Novo Registro
            </Button>
          </Link>
        </section>

        {/* Alerts */}
        {unreadAlerts.length > 0 && (
          <section className="space-y-3">
            {unreadAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`border-l-4 ${
                  alert.tipo === 'vencimento_proximo' 
                    ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
                }`}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <AlertTriangle 
                    className={alert.tipo === 'vencimento_proximo' ? 'text-yellow-600' : 'text-orange-600'} 
                    size={20} 
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.titulo}</p>
                    <p className="text-xs text-muted-foreground">{alert.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Main Modules */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Ferramentas do Negócio</h3>
          
          <div className="space-y-3">
            <Link href="/pricing">
              <Card className="touch-target card-shadow">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calculator text-primary text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Precificação de Receitas</h4>
                    <p className="text-sm text-muted-foreground">Calcule custos e margens</p>
                  </div>
                  <ExternalLink className="text-muted-foreground" size={16} />
                </CardContent>
              </Card>
            </Link>

            <Link href="/inventory">
              <Card className="touch-target card-shadow">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-boxes text-blue-600 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Controle de Estoque</h4>
                    <p className="text-sm text-muted-foreground">Acompanhe ingredientes e validade</p>
                  </div>
                  <ExternalLink className="text-muted-foreground" size={16} />
                </CardContent>
              </Card>
            </Link>

            <Link href="/customers">
              <Card className="touch-target card-shadow">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-green-600 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Clientes e Pedidos</h4>
                    <p className="text-sm text-muted-foreground">Gerencie leads e vendas</p>
                  </div>
                  <ExternalLink className="text-muted-foreground" size={16} />
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="touch-target card-shadow">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-bar text-purple-600 text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Relatórios Rápidos</h4>
                    <p className="text-sm text-muted-foreground">Análise de receita e lucro</p>
                  </div>
                  <ExternalLink className="text-muted-foreground" size={16} />
                </CardContent>
              </Card>
            </Link>

            <Link href="/production">
              <Card className="touch-target card-shadow">
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tasks text-secondary text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Rotina de Produção</h4>
                    <p className="text-sm text-muted-foreground">Cronograma e checklist</p>
                  </div>
                  <ExternalLink className="text-muted-foreground" size={16} />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
