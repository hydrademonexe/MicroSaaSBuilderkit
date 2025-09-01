import { useMemo, useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useOrders, useCustomers, useProducts } from "@/hooks/use-database";
import { database } from "@/lib/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, ArrowDown, ArrowUp, Coins, Calendar, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [reportData, setReportData] = useState({
    totalSpent: 0,
    totalEarned: 0,
    netProfit: 0,
    dailyData: {} as { [key: string]: number },
    maxValue: 1
  });

  useEffect(() => {
    const calculateReportData = async () => {
      const now = new Date();
      const startDate = selectedPeriod === 'week' 
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), 1);

      const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate;
      });

      const completedOrders = periodOrders.filter(order => order.status === 'pago' || order.status === 'entregue');
      const totalEarned = completedOrders.reduce((sum, order) => sum + order.valorTotal, 0);
      
      // Use database CMV calculation
      let estimatedCosts = 0;
      try {
        estimatedCosts = await database.calculateCMV(completedOrders);
      } catch (error) {
        console.error('Error calculating CMV:', error);
        estimatedCosts = totalEarned * 0.35; // Fallback to 35%
      }
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
          const orderDate = new Date(order.createdAt);
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
              const orderDate = new Date(order.createdAt);
              return orderDate >= weekStart && orderDate < weekEnd;
            })
            .reduce((sum, order) => sum + order.valorTotal, 0);
        }
      }

      const maxValue = Math.max(...Object.values(dailyData));

      setReportData({
        totalSpent: estimatedCosts,
        totalEarned,
        netProfit,
        dailyData,
        maxValue: maxValue || 1
      });
    };

    calculateReportData();
  }, [orders, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportReport = () => {
    try {
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
      
      toast({
        title: "Sucesso!",
        description: "Relatório exportado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive"
      });
    }
  };

  const exportCSV = () => {
    try {
      // Cabeçalho
      const headers = [
        'id', 'cliente', 'produto', 'quantidade', 'preco_unitario', 'total', 'data'
      ];

      // Mapear pedidos e itens
      const rows: string[][] = [];
      orders.forEach(order => {
        const cliente = customers.find(c => c.id === order.clienteId)?.nome || '—';
        order.itens.forEach(item => {
          const produto = products.find(p => p.id === item.produtoId)?.nome || '—';
          rows.push([
            order.id,
            cliente,
            produto,
            String(item.quantidade),
            String(item.precoUnit.toFixed(2)),
            String(item.subtotal.toFixed(2)),
            new Date(order.createdAt).toLocaleDateString('pt-BR')
          ]);
        });
      });

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v.replaceAll('"', '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso!",
        description: "Dados exportados em CSV com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar CSV",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <BarChart className="text-primary" size={20} />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Relatórios Rápidos</h1>
        </div>

        {/* Period Selector */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            className={`touch-target text-sm sm:text-base ${
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
            className={`touch-target text-sm sm:text-base ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Total Gasto</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-300" data-testid="text-total-spent">
                    {formatCurrency(reportData.totalSpent)}
                  </p>
                </div>
                <ArrowDown className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Total Faturado</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-total-earned">
                    {formatCurrency(reportData.totalEarned)}
                  </p>
                </div>
                <ArrowUp className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-secondary/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 font-medium">Lucro Líquido</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-800 dark:text-yellow-200" data-testid="text-net-profit">
                    {formatCurrency(reportData.netProfit)}
                  </p>
                </div>
                <Coins className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar size={18} />
              <span>
                {selectedPeriod === 'week' ? 'Vendas por Dia' : 'Vendas por Semana'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {Object.entries(reportData.dailyData).map(([period, value]) => (
                <div key={period} className="flex items-center justify-between gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-12 flex-shrink-0">{period}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(value / reportData.maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium w-16 sm:w-20 text-right flex-shrink-0" data-testid={`text-chart-${period}`}>
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <Button 
            variant="outline"
            className="w-full touch-target text-sm sm:text-base"
            onClick={exportReport}
            data-testid="button-export-report"
          >
            <FileText size={16} className="mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            variant="outline"
            className="w-full touch-target text-sm sm:text-base"
            onClick={exportCSV}
            data-testid="button-export-csv"
          >
            <Download size={16} className="mr-2" />
            Exportar CSV (Pedidos e Itens)
          </Button>
        </div>

        {/* Summary Info */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="p-3 sm:p-4">
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