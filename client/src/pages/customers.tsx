import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCustomers, useOrders } from "@/hooks/use-database";
import { database } from "@/lib/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Edit, Trash2, ShoppingBag, MessageCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Customer, Order } from "@/types";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loading: customersLoading } = useCustomers();
  const { orders, addOrder, updateOrder, deleteOrder, loading: ordersLoading } = useOrders();
  const { toast } = useToast();
  
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [customerFormData, setCustomerFormData] = useState({
    nome: '',
    whatsapp: '',
    observacoes: ''
  });

  const [orderFormData, setOrderFormData] = useState({
    clienteId: '',
    produto: '',
    quantidade: '',
    valorTotal: '',
    status: 'pendente' as Order['status']
  });

  const resetCustomerForm = () => {
    setCustomerFormData({ nome: '', whatsapp: '', observacoes: '' });
    setEditingCustomer(null);
  };

  const resetOrderForm = () => {
    setOrderFormData({ clienteId: '', produto: '', quantidade: '', valorTotal: '', status: 'pendente' });
    setEditingOrder(null);
  };

  const handleOpenCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerFormData({
        nome: customer.nome,
        whatsapp: customer.whatsapp,
        observacoes: customer.observacoes
      });
    } else {
      resetCustomerForm();
    }
    setIsCustomerDialogOpen(true);
  };

  const handleOpenOrderDialog = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setOrderFormData({
        clienteId: order.clienteId,
        produto: order.produto,
        quantidade: order.quantidade.toString(),
        valorTotal: order.valorTotal.toString(),
        status: order.status
      });
    } else {
      resetOrderForm();
    }
    setIsOrderDialogOpen(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerFormData.nome || !customerFormData.whatsapp) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer({ ...editingCustomer, ...customerFormData });
        toast({
          title: "Sucesso!",
          description: "Cliente atualizado com sucesso"
        });
      } else {
        await addCustomer(customerFormData);
        toast({
          title: "Sucesso!",
          description: "Cliente adicionado com sucesso"
        });
      }

      setIsCustomerDialogOpen(false);
      resetCustomerForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive"
      });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderFormData.clienteId || !orderFormData.produto || !orderFormData.quantidade || !orderFormData.valorTotal) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderData = {
        clienteId: orderFormData.clienteId,
        produto: orderFormData.produto,
        quantidade: parseInt(orderFormData.quantidade),
        valorTotal: parseFloat(orderFormData.valorTotal),
        status: orderFormData.status,
        dataPedido: editingOrder ? editingOrder.dataPedido : new Date(),
        ...(orderFormData.status === 'entregue' && !editingOrder?.dataEntrega && { dataEntrega: new Date() })
      };

      if (editingOrder) {
        await updateOrder({ ...editingOrder, ...orderData });
        toast({
          title: "Sucesso!",
          description: "Pedido atualizado com sucesso"
        });
      } else {
        await addOrder(orderData);
        toast({
          title: "Sucesso!",
          description: "Pedido adicionado com sucesso"
        });
      }

      setIsOrderDialogOpen(false);
      resetOrderForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar pedido",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const customerOrders = orders.filter(order => order.clienteId === id);
    if (customerOrders.length > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir cliente com pedidos cadastrados",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteCustomer(id);
      toast({
        title: "Sucesso!",
        description: "Cliente removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover cliente",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: "Sucesso!",
        description: "Pedido removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover pedido",
        variant: "destructive"
      });
    }
  };

  const handleExportCustomers = async () => {
    try {
      const csvContent = await database.exportCustomersCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'clientes.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso!",
        description: "Lista de clientes exportada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar lista de clientes",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pago':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'entregue':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'pago': return 'Pago';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Users className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Clientes e Pedidos</h1>
        </div>

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex space-x-2">
              <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary text-primary-foreground touch-target flex-1"
                    onClick={() => handleOpenCustomerDialog()}
                    data-testid="button-add-customer"
                  >
                    <Plus size={20} className="mr-1" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Nome do cliente"
                        value={customerFormData.nome}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, nome: e.target.value })}
                        data-testid="input-customer-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={customerFormData.whatsapp}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, whatsapp: e.target.value })}
                        data-testid="input-customer-whatsapp"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Preferências, restrições alimentares, etc."
                        value={customerFormData.observacoes}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, observacoes: e.target.value })}
                        data-testid="input-customer-notes"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsCustomerDialogOpen(false)}
                        data-testid="button-cancel-customer"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary text-primary-foreground"
                        data-testid="button-save-customer"
                      >
                        {editingCustomer ? 'Atualizar' : 'Salvar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={handleExportCustomers}
                disabled={customers.length === 0}
                data-testid="button-export-customers"
              >
                <Download size={16} className="mr-1" />
                Exportar CSV
              </Button>
            </div>

            {/* Customers List */}
            {customersLoading ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-center text-muted-foreground">Carregando clientes...</p>
                </CardContent>
              </Card>
            ) : customers.length === 0 ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-center text-muted-foreground">
                    Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" para começar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {customers.map((customer) => {
                  const customerOrders = orders.filter(order => order.clienteId === customer.id);
                  const totalSpent = customerOrders
                    .filter(order => order.status === 'entregue')
                    .reduce((sum, order) => sum + order.valorTotal, 0);

                  return (
                    <Card key={customer.id} className="card-shadow" data-testid={`card-customer-${customer.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{customer.nome}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <MessageCircle size={14} className="text-green-600" />
                              <span className="text-sm text-muted-foreground">{customer.whatsapp}</span>
                            </div>
                            {customer.observacoes && (
                              <p className="text-xs text-muted-foreground mt-1">{customer.observacoes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total gasto</p>
                            <p className="font-semibold text-green-600">{formatCurrency(totalSpent)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {customerOrders.length} pedido{customerOrders.length !== 1 ? 's' : ''}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCustomerDialog(customer)}
                              data-testid={`button-edit-customer-${customer.id}`}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              data-testid={`button-delete-customer-${customer.id}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-primary text-primary-foreground touch-target"
                  onClick={() => handleOpenOrderDialog()}
                  data-testid="button-add-order"
                >
                  <ShoppingBag size={20} className="mr-1" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingOrder ? 'Editar Pedido' : 'Novo Pedido'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="clienteId">Cliente *</Label>
                    <Select value={orderFormData.clienteId} onValueChange={(value) => setOrderFormData({ ...orderFormData, clienteId: value })}>
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="produto">Produto/Kit *</Label>
                    <Input
                      id="produto"
                      type="text"
                      placeholder="ex: Kit 50 salgados variados"
                      value={orderFormData.produto}
                      onChange={(e) => setOrderFormData({ ...orderFormData, produto: e.target.value })}
                      data-testid="input-product"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      placeholder="1"
                      value={orderFormData.quantidade}
                      onChange={(e) => setOrderFormData({ ...orderFormData, quantidade: e.target.value })}
                      data-testid="input-order-quantity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valorTotal">Valor Total (R$) *</Label>
                    <Input
                      id="valorTotal"
                      type="number"
                      step="0.01"
                      placeholder="80.00"
                      value={orderFormData.valorTotal}
                      onChange={(e) => setOrderFormData({ ...orderFormData, valorTotal: e.target.value })}
                      data-testid="input-total-value"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select value={orderFormData.status} onValueChange={(value: Order['status']) => setOrderFormData({ ...orderFormData, status: value })}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsOrderDialogOpen(false)}
                      data-testid="button-cancel-order"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary text-primary-foreground"
                      data-testid="button-save-order"
                    >
                      {editingOrder ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Orders List */}
            {ordersLoading ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-center text-muted-foreground">Carregando pedidos...</p>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-4">
                  <p className="text-center text-muted-foreground">
                    Nenhum pedido cadastrado ainda. Clique em "Novo Pedido" para começar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders
                  .sort((a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime())
                  .map((order) => {
                    const customer = getCustomerById(order.clienteId);

                    return (
                      <Card key={order.id} className="card-shadow" data-testid={`card-order-${order.id}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-foreground">{order.produto}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Cliente: {customer?.nome || 'Cliente não encontrado'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Pedido em: {formatDate(order.dataPedido)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Qtd: {order.quantidade}</p>
                              <p className="font-bold text-lg text-primary">{formatCurrency(order.valorTotal)}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleOpenOrderDialog(order)}
                              data-testid={`button-edit-order-${order.id}`}
                            >
                              <Edit size={14} className="mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteOrder(order.id)}
                              data-testid={`button-delete-order-${order.id}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
