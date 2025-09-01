import { useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { useOrders, useCustomers, useProducts } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Plus, Edit, Trash2, Check, X, Minus, DollarSign, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatCurrencyInput, formatCurrencyDisplay, parseCurrency } from "@/lib/formatters";
import { MaskedInput } from "@/components/ui/input-mask";
import { Order, OrderItem, Customer, Product } from "@/types";

export default function Orders() {
  const { orders, addOrder, updateOrder, deleteOrder, processPayment, loading: ordersLoading } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { toast } = useToast();
  
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [orderFormData, setOrderFormData] = useState({
    clienteId: '',
    taxaEntrega: '0',
    taxaServico: '0',
    status: 'rascunho' as Order['status']
  });

  const [orderItems, setOrderItems] = useState<Array<{
    produtoId: string;
    quantidade: number;
    precoUnit: number;
  }>>([]);

  const [newItem, setNewItem] = useState({
    produtoId: '',
    quantidade: '1',
    precoUnit: '0'
  });

  const quantityInputRef = useRef<HTMLInputElement | null>(null);

  const resetOrderForm = () => {
    setOrderFormData({
      clienteId: '',
      taxaEntrega: '0',
      taxaServico: '0',
      status: 'rascunho'
    });
    setOrderItems([]);
    setNewItem({ produtoId: '', quantidade: '1', precoUnit: '0' });
    setEditingOrder(null);
  };

  const handleOpenOrderDialog = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setOrderFormData({
        clienteId: order.clienteId,
        taxaEntrega: order.taxaEntrega.toString(),
        taxaServico: order.taxaServico.toString(),
        status: order.status
      });
      setOrderItems(order.itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnit: item.precoUnit
      })));
    } else {
      resetOrderForm();
    }
    setIsOrderDialogOpen(true);
  };

  const addItemToOrder = () => {
    if (!newItem.produtoId || !newItem.quantidade) {
      toast({
        title: "Erro",
        description: "Selecione um produto e informe a quantidade",
        variant: "destructive"
      });
      return;
    }

    const quantidade = parseInt(newItem.quantidade);
    const precoUnit = parseCurrency(newItem.precoUnit);

    if (quantidade <= 0 || precoUnit <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade e preço devem ser maiores que zero",
        variant: "destructive"
      });
      return;
    }

    // Check if product already exists in items
    const existingIndex = orderItems.findIndex(item => item.produtoId === newItem.produtoId);
    
    if (existingIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantidade += quantidade;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems(prev => [...prev, {
        produtoId: newItem.produtoId,
        quantidade,
        precoUnit
      }]);
    }

    setNewItem({ produtoId: '', quantidade: '1', precoUnit: '0' });
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItemFromOrder(index);
      return;
    }

    const updatedItems = [...orderItems];
    updatedItems[index].quantidade = quantidade;
    setOrderItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantidade * item.precoUnit), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxaEntrega = parseCurrency(orderFormData.taxaEntrega || '0');
    const taxaServico = parseCurrency(orderFormData.taxaServico || '0');
    return subtotal + taxaEntrega + taxaServico;
  };

  const handleProductSelect = (produtoId: string) => {
    const product = products.find(p => p.id === produtoId);
    if (product) {
      setNewItem(prev => ({
        ...prev,
        produtoId,
        precoUnit: formatCurrency(product.precoVenda)
      }));
      // Focusar quantidade para agilizar a inclusão do item
      setTimeout(() => {
        quantityInputRef.current?.focus();
        quantityInputRef.current?.select();
      }, 0);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderFormData.clienteId || orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione pelo menos um item",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderData = {
        clienteId: orderFormData.clienteId,
        itens: orderItems.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit,
          subtotal: item.quantidade * item.precoUnit
        })),
        taxaEntrega: parseCurrency(orderFormData.taxaEntrega || '0'),
        taxaServico: parseCurrency(orderFormData.taxaServico || '0'),
        valorTotal: calculateTotal(),
        status: orderFormData.status,
        createdAt: new Date()
      };

      if (editingOrder) {
        await updateOrder({ ...orderData, id: editingOrder.id });
        toast({
          title: "Sucesso!",
          description: "Pedido atualizado com sucesso"
        });
      } else {
        await addOrder(orderData);
        toast({
          title: "Sucesso!",
          description: "Pedido criado com sucesso"
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

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      await processPayment(orderId);
      toast({
        title: "Sucesso!",
        description: "Pagamento processado e estoque atualizado"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: "Sucesso!",
        description: "Pedido excluído com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pedido",
        variant: "destructive"
      });
    }
  };

  const getCustomerName = (clienteId: string) => {
    return customers.find(c => c.id === clienteId)?.nome || 'Cliente não encontrado';
  };

  const getProductName = (produtoId: string) => {
    return products.find(p => p.id === produtoId)?.nome || 'Produto não encontrado';
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'rascunho': return 'secondary';
      case 'pendente': return 'outline';
      case 'pago': return 'default';
      case 'entregue': return 'default';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'pendente': return 'Pendente';
      case 'pago': return 'Pago';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary" />
            Pedidos de Clientes
          </h1>
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenOrderDialog()} data-testid="button-new-order" className="w-full sm:w-auto h-10">
                <Plus size={16} className="mr-2" /> Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingOrder ? 'Editar Pedido' : 'Novo Pedido'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Select 
                      value={orderFormData.clienteId} 
                      onValueChange={(value) => setOrderFormData(prev => ({ ...prev, clienteId: value }))}
                    >
                      <SelectTrigger data-testid="select-customer">
                        <SelectValue placeholder="Selecione um cliente" />
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
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={orderFormData.status} 
                      onValueChange={(value) => setOrderFormData(prev => ({ ...prev, status: value as Order['status'] }))}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add Items Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Itens do Pedido</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Produto</Label>
                      <Select value={newItem.produtoId} onValueChange={handleProductSelect}>
                        <SelectTrigger data-testid="select-product">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.filter(p => p.ativo).map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.nome} - {formatCurrency(product.precoVenda)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantidade}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantidade: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addItemToOrder();
                          }
                        }}
                        ref={quantityInputRef}
                        data-testid="input-item-quantity"
                      />
                    </div>

                    <div>
                      <Label>Preço Unitário</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9.,]*"
                        placeholder="0,00"
                        value={newItem.precoUnit}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          setNewItem(prev => ({ ...prev, precoUnit: formatted }));
                        }}
                        onBlur={(e) => {
                          const formatted = formatCurrencyDisplay(e.target.value);
                          setNewItem(prev => ({ ...prev, precoUnit: formatted }));
                        }}
                        data-testid="input-item-price"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={addItemToOrder}
                      data-testid="button-add-item"
                    >
                      <Plus size={16} className="mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {/* Items List */}
                  {orderItems.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Itens Adicionados:</h4>
                          {orderItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{getProductName(item.produtoId)}</span>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(item.precoUnit)} × {item.quantidade} = {formatCurrency(item.quantidade * item.precoUnit)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                  data-testid={`input-quantity-${index}`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItemFromOrder(index)}
                                  data-testid={`button-remove-item-${index}`}
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Taxes and Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxaEntrega">Taxa de Entrega</Label>
                    <Input
                      id="taxaEntrega"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.,]*"
                      placeholder="0,00"
                      value={orderFormData.taxaEntrega}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        setOrderFormData(prev => ({ ...prev, taxaEntrega: formatted }));
                      }}
                      onBlur={(e) => {
                        const formatted = formatCurrencyDisplay(e.target.value);
                        setOrderFormData(prev => ({ ...prev, taxaEntrega: formatted }));
                      }}
                      data-testid="input-delivery-fee"
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxaServico">Taxa de Serviço</Label>
                    <Input
                      id="taxaServico"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9.,]*"
                      placeholder="0,00"
                      value={orderFormData.taxaServico}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        setOrderFormData(prev => ({ ...prev, taxaServico: formatted }));
                      }}
                      onBlur={(e) => {
                        const formatted = formatCurrencyDisplay(e.target.value);
                        setOrderFormData(prev => ({ ...prev, taxaServico: formatted }));
                      }}
                      data-testid="input-service-fee"
                    />
                  </div>
                </div>

                {/* Order Summary */}
                {orderItems.length > 0 && (
                  <Card className="bg-muted">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span data-testid="text-subtotal">{formatCurrency(subtotal)}</span>
                      </div>
                      {parseCurrency(orderFormData.taxaEntrega || '0') > 0 && (
                        <div className="flex justify-between">
                          <span>Taxa de entrega:</span>
                          <span>{formatCurrency(parseCurrency(orderFormData.taxaEntrega || '0'))}</span>
                        </div>
                      )}
                      {parseCurrency(orderFormData.taxaServico || '0') > 0 && (
                        <div className="flex justify-between">
                          <span>Taxa de serviço:</span>
                          <span>{formatCurrency(parseCurrency(orderFormData.taxaServico || '0'))}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary" data-testid="text-total">{formatCurrency(total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button type="submit" data-testid="button-save-order">
                    {editingOrder ? 'Atualizar' : 'Salvar'} Pedido
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <p>Carregando pedidos...</p>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-l-4 border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold" data-testid={`text-customer-name-${order.id}`}>
                              {getCustomerName(order.clienteId)}
                            </h3>
                            <Badge variant={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground mb-2">
                            <p>Criado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                            {order.paidAt && (
                              <p>Pago em: {new Date(order.paidAt).toLocaleDateString('pt-BR')}</p>
                            )}
                            <p>{order.itens.length} item{order.itens.length !== 1 ? 's' : ''}</p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg text-primary" data-testid={`text-order-total-${order.id}`}>
                              {formatCurrency(order.valorTotal)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {order.status === 'pendente' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(order.id)}
                              data-testid={`button-mark-paid-${order.id}`}
                              aria-label={`Marcar pedido de ${getCustomerName(order.clienteId)} como pago`}
                            >
                              <Check size={16} className="mr-1" />
                              Marcar como Pago
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenOrderDialog(order)}
                            data-testid={`button-edit-${order.id}`}
                            aria-label={`Editar pedido de ${getCustomerName(order.clienteId)}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            data-testid={`button-delete-${order.id}`}
                            aria-label={`Excluir pedido de ${getCustomerName(order.clienteId)}`}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Order Items Summary */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="space-y-1">
                          {order.itens.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{getProductName(item.produtoId)} × {item.quantidade}</span>
                              <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                          ))}
                          {(order.taxaEntrega > 0 || order.taxaServico > 0) && (
                            <div className="text-xs text-muted-foreground">
                              {order.taxaEntrega > 0 && `+ Taxa entrega: ${formatCurrency(order.taxaEntrega)}`}
                              {order.taxaServico > 0 && ` + Taxa serviço: ${formatCurrency(order.taxaServico)}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}