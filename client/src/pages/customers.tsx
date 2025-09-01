import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCustomers } from "@/hooks/use-database";
import { database } from "@/lib/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, MessageCircle, Download, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaskedInput } from "@/components/ui/input-mask";
import { formatWhatsApp } from "@/lib/formatters";
import { Customer } from "@/types";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useCustomers();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    endereco: {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    },
    observacoes: ''
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      whatsapp: '',
      endereco: {
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
      },
      observacoes: ''
    });
    setEditingCustomer(null);
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        nome: customer.nome,
        whatsapp: customer.whatsapp,
        endereco: { ...customer.endereco },
        observacoes: customer.observacoes
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('endereco.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.whatsapp) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const customerData = {
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        endereco: formData.endereco,
        observacoes: formData.observacoes
      };

      if (editingCustomer) {
        await updateCustomer({ ...editingCustomer, ...customerData });
        toast({
          title: "Sucesso!",
          description: "Cliente atualizado com sucesso",
          duration: 5000
        });
      } else {
        await addCustomer(customerData);
        toast({
          title: "Sucesso!",
          description: "Cliente adicionado com sucesso",
          duration: 5000
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      toast({
        title: "Sucesso!",
        description: "Cliente excluído com sucesso",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const handleExportCSV = async () => {
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
        description: "Lista de clientes exportada com sucesso",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar clientes",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const openWhatsApp = (whatsapp: string, customerName: string) => {
    const phoneNumber = whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${customerName}! Como posso ajudá-lo hoje?`);
    const url = `https://wa.me/55${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  const formatAddress = (endereco: Customer['endereco']) => {
    const parts = [];
    if (endereco.logradouro) parts.push(endereco.logradouro);
    if (endereco.numero) parts.push(endereco.numero);
    if (endereco.bairro) parts.push(endereco.bairro);
    if (endereco.cidade && endereco.uf) parts.push(`${endereco.cidade}/${endereco.uf}`);
    return parts.join(', ') || 'Endereço não informado';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Users className="text-primary" />
            Clientes
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {customers.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleExportCSV} 
                data-testid="button-export-csv"
                className="w-full sm:w-auto h-10"
              >
                <Download size={16} className="mr-2" />
                Exportar CSV
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleOpenDialog()} 
                  data-testid="button-new-customer"
                  className="w-full sm:w-auto h-10"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Maria Silva"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        data-testid="input-customer-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp *</Label>
                      <MaskedInput
                        id="whatsapp"
                        mask="whatsapp"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(value) => handleInputChange('whatsapp', value)}
                        data-testid="input-customer-whatsapp"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin size={16} className="flex-shrink-0" />
                      Endereço para Entrega
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="logradouro">Logradouro</Label>
                        <Input
                          id="logradouro"
                          placeholder="Ex: Rua das Flores"
                          value={formData.endereco.logradouro}
                          onChange={(e) => handleInputChange('endereco.logradouro', e.target.value)}
                          data-testid="input-address-street"
                        />
                      </div>

                      <div>
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          placeholder="123"
                          value={formData.endereco.numero}
                          onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                          data-testid="input-address-number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          placeholder="Ex: Centro"
                          value={formData.endereco.bairro}
                          onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                          data-testid="input-address-district"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cep">CEP</Label>
                        <MaskedInput
                          id="cep"
                          mask="cep"
                          placeholder="12345-678"
                          value={formData.endereco.cep}
                          onChange={(value) => handleInputChange('endereco.cep', value)}
                          data-testid="input-address-zipcode"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          placeholder="Ex: São Paulo"
                          value={formData.endereco.cidade}
                          onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                          data-testid="input-address-city"
                        />
                      </div>

                      <div>
                        <Label htmlFor="uf">Estado (UF)</Label>
                        <Input
                          id="uf"
                          placeholder="SP"
                          maxLength={2}
                          value={formData.endereco.uf}
                          onChange={(e) => handleInputChange('endereco.uf', e.target.value.toUpperCase())}
                          data-testid="input-address-state"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informações adicionais sobre o cliente..."
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      data-testid="input-customer-notes"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" data-testid="button-save-customer">
                      {editingCustomer ? 'Atualizar' : 'Salvar'} Cliente
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando clientes...</p>
            ) : customers.length === 0 ? (
              <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {customers.map((customer) => (
                  <Card key={customer.id} className="border-l-4 border-primary">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" data-testid={`text-customer-name-${customer.id}`}>
                            {customer.nome}
                          </h3>
                          
                          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground mb-2">
                            <p className="flex items-center gap-1">
                              <MessageCircle size={12} className="flex-shrink-0" />
                              {formatWhatsApp(customer.whatsapp)}
                            </p>
                            
                            <p className="flex items-center gap-1">
                              <MapPin size={12} className="flex-shrink-0" />
                              {formatAddress(customer.endereco)}
                            </p>
                            
                            {customer.observacoes && (
                              <p className="text-xs mt-2">{customer.observacoes}</p>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente desde: {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsApp(customer.whatsapp, customer.nome)}
                            data-testid={`button-whatsapp-${customer.id}`}
                            aria-label={`Abrir WhatsApp de ${customer.nome}`}
                            className="min-w-[44px]"
                          >
                            <MessageCircle size={14} className="text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(customer)}
                            data-testid={`button-edit-${customer.id}`}
                            aria-label={`Editar ${customer.nome}`}
                            className="min-w-[44px]"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            data-testid={`button-delete-${customer.id}`}
                            aria-label={`Excluir ${customer.nome}`}
                            className="min-w-[44px]"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </Button>
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