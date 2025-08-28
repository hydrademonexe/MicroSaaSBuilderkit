import { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useOrders } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, ArrowDown, ArrowUp, Coins, Calendar, Download, FileText } from "lucide-react";

export default function Reports() {
  const { orders } = useOrders();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const reportData = useMemo(() => {
    const now = new Date();
    const startDate = selectedPeriod === 'week' 
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const periodOrders = orders.filter(order => {
      const orderDate = new Date(order.dataPedido);
      return orderDate >= startDate;
    });

    const completedOrders = periodOrders.filter(order => order.status === 'entregue');
    const totalEarned = completedOrders.reduce((sum, order) => sum + order.valorTotal, 0);
    
    // Simplified cost calculation - in a real app this would be more sophisticated
    const estimatedCosts = totalEarned * 0.4; // Assuming 40% cost ratio
    const netProfit = totalEarned - estimatedCosts;

    // Daily breakdown for chart
    const dailyData: { [key: string]: number } = {};
    
    if (selectedPeriod === 'week') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = days[date.getDay()];
        dailyData[dayName] = 0;
      }

      completedOrders.forEach(order => {
        const orderDate = new Date(order.dataPedido);
        const dayName = days[orderDate.getDay()];
        if (dailyData[dayName] !== undefined) {
          dailyData[dayName] += order.valorTotal;
        }
      });
    } else {
      // Monthly view - show last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekLabel = `Sem ${4 - i}`;
        
        dailyData[weekLabel] = completedOrders
          .filter(order => {
            const orderDate = new Date(order.dataPedido);
            return orderDate >= weekStart && orderDate < weekEnd;
          })
          .reduce((sum, order) => sum + order.valorTotal, 0);
      }
    }

    const maxValue = Math.max(...Object.values(dailyData));

    return {
      totalSpent: estimatedCosts,
      totalEarned,
      netProfit,
      dailyData,
      maxValue: maxValue || 1
    };
  }, [orders, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportReport = () => {
    const reportContent = `
Relatório de Vendas - ${selectedPeriod === 'week' ? 'Semanal' : 'Mensal'}
Gerado em: ${new Date().toLocaleDateString('pt-BR')}

RESUMO FINANCEIRO:
- Total Gasto: ${formatCurrency(reportData.totalSpent)}
- Total Faturado: ${formatCurrency(reportData.totalEarned)}
- Lucro Líquido: ${formatCurrency(reportData.netProfit)}

DETALHAMENTO:
${Object.entries(reportData.dailyData)
  .map(([day, value]) => `${day}: ${formatCurrency(value)}`)
  .join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BarChart className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Relatórios Rápidos</h1>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2">
          <Button 
            className={`flex-1 touch-target ${
              selectedPeriod === 'week' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setSelectedPeriod('week')}
            data-testid="button-period-week"
          >
            Esta Semana
          </Button>
          <Button 
            className={`flex-1 touch-target ${
              selectedPeriod === 'month' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setSelectedPeriod('month')}
            data-testid="button-period-month"
          >
            Este Mês
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Gasto</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300" data-testid="text-total-spent">
                    {formatCurrency(reportData.totalSpent)}
                  </p>
                </div>
                <ArrowDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Faturado</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-total-earned">
                    {formatCurrency(reportData.totalEarned)}
                  </p>
                </div>
                <ArrowUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200" data-testid="text-net-profit">
                    {formatCurrency(reportData.netProfit)}
                  </p>
                </div>
                <Coins className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar size={20} />
              <span>
                {selectedPeriod === 'week' ? 'Vendas por Dia' : 'Vendas por Semana'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(reportData.dailyData).map(([period, value]) => (
                <div key={period} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground w-12">{period}</span>
                  <div className="flex-1 mx-3 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(value / reportData.maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-20 text-right" data-testid={`text-chart-${period}`}>
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="space-y-3">
          <Button 
            variant="outline"
            className="w-full touch-target"
            onClick={exportReport}
            data-testid="button-export-report"
          >
            <FileText size={20} className="mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Summary Info */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground">
                Nenhum pedido cadastrado ainda. Adicione alguns pedidos na aba "Clientes" para ver seus relatórios aqui!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
