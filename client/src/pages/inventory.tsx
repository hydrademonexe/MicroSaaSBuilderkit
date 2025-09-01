import { useState } from "react";
import { Layout } from "@/components/layout";
import { useIngredients } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Edit, Trash2, AlertTriangle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatCurrencyInput, formatCurrencyDisplay, parseCurrency } from "@/lib/formatters";
import { Ingredient } from "@/types";

export default function Inventory() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, loading } = useIngredients();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    validade: '',
    custoPorUnidade: '',
    unidade: '',
    alertaMinimo: ''
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      quantidade: '',
      validade: '',
      custoPorUnidade: '',
      unidade: '',
      alertaMinimo: ''
    });
    setEditingIngredient(null);
  };

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        nome: ingredient.nome,
        quantidade: ingredient.quantidade.toString(),
        validade: ingredient.validade.toISOString().split('T')[0],
        custoPorUnidade: ingredient.custoPorUnidade.toString(),
        unidade: ingredient.unidade,
        alertaMinimo: ingredient.alertaMinimo.toString()
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.quantidade || !formData.validade || !formData.custoPorUnidade || !formData.unidade) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const ingredientData = {
        nome: formData.nome,
        quantidade: parseFloat(formData.quantidade),
        validade: new Date(formData.validade),
        custoPorUnidade: parseCurrency(formData.custoPorUnidade),
        unidade: formData.unidade,
        alertaMinimo: parseFloat(formData.alertaMinimo) || 0
      };

      if (editingIngredient) {
        await updateIngredient({ ...editingIngredient, ...ingredientData });
        toast({
          title: "Sucesso!",
          description: "Ingrediente atualizado com sucesso"
        });
      } else {
        await addIngredient(ingredientData);
        toast({
          title: "Sucesso!",
          description: "Ingrediente adicionado com sucesso"
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar ingrediente",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIngredient(id);
      toast({
        title: "Sucesso!",
        description: "Ingrediente removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover ingrediente",
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

  const getExpiryStatus = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', label: 'Vencido', color: 'red' };
    } else if (diffDays <= 3) {
      return { status: 'expiring', label: 'Vence em breve', color: 'yellow' };
    } else {
      return { status: 'fresh', label: 'OK', color: 'green' };
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.quantidade <= ingredient.alertaMinimo) {
      return { status: 'low', label: 'Estoque baixo', color: 'orange' };
    }
    return { status: 'ok', label: 'OK', color: 'green' };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Package className="text-primary" size={20} />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Controle de Estoque</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary text-primary-foreground touch-target"
                onClick={() => handleOpenDialog()}
                data-testid="button-add-ingredient"
              >
                <Plus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingIngredient ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Ingrediente *</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="ex: Farinha de Trigo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    data-testid="input-ingredient-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="quantidade">Quantidade *</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                      data-testid="input-quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
                      <SelectTrigger data-testid="select-unit">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="mL">mL</SelectItem>
                        <SelectItem value="unidade">unidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="validade">Data de Validade *</Label>
                  <Input
                    id="validade"
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    data-testid="input-expiry-date"
                  />
                </div>

                <div>
                  <Label htmlFor="custoPorUnidade">Custo por {formData.unidade || 'unidade'} (R$) *</Label>
                  <Input
                    id="custoPorUnidade"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.,]*"
                    placeholder="4,50"
                    value={formData.custoPorUnidade}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value);
                      setFormData({ ...formData, custoPorUnidade: formatted });
                    }}
                    onBlur={(e) => {
                      const formatted = formatCurrencyDisplay(e.target.value);
                      setFormData({ ...formData, custoPorUnidade: formatted });
                    }}
                    data-testid="input-cost-per-unit"
                  />
                </div>

                <div>
                  <Label htmlFor="alertaMinimo">Alerta de Estoque Baixo</Label>
                  <Input
                    id="alertaMinimo"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={formData.alertaMinimo}
                    onChange={(e) => setFormData({ ...formData, alertaMinimo: e.target.value })}
                    data-testid="input-low-stock-alert"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 text-sm"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary text-primary-foreground text-sm"
                    data-testid="button-save-ingredient"
                  >
                    {editingIngredient ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ingredients List */}
        {loading ? (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-center text-muted-foreground">Carregando estoque...</p>
            </CardContent>
          </Card>
        ) : ingredients.length === 0 ? (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-center text-muted-foreground">
                Nenhum ingrediente cadastrado ainda. Clique no botão + para adicionar seu primeiro ingrediente!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {ingredients.map((ingredient) => {
              const expiryStatus = getExpiryStatus(ingredient.validade);
              const stockStatus = getStockStatus(ingredient);
              const totalValue = ingredient.quantidade * ingredient.custoPorUnidade;

              return (
                <Card key={ingredient.id} className="card-shadow" data-testid={`card-ingredient-${ingredient.id}`}>
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{ingredient.nome}</h4>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {expiryStatus.status !== 'fresh' && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            expiryStatus.color === 'yellow' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {expiryStatus.label}
                          </span>
                        )}
                        {stockStatus.status === 'low' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs">
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className="font-medium ml-1 block sm:inline">{ingredient.quantidade} {ingredient.unidade}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vencimento:</span>
                        <span className="font-medium ml-1 block sm:inline">{formatDate(ingredient.validade)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Custo/{ingredient.unidade}:</span>
                        <span className="font-medium ml-1 block sm:inline">{formatCurrency(ingredient.custoPorUnidade)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor Total:</span>
                        <span className="font-medium ml-1 block sm:inline">{formatCurrency(totalValue)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-sm"
                        onClick={() => handleOpenDialog(ingredient)}
                        data-testid={`button-edit-ingredient-${ingredient.id}`}
                        aria-label={`Editar ingrediente ${ingredient.nome}`}
                      >
                        <Edit size={14} className="mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
                        onClick={() => handleDelete(ingredient.id)}
                        data-testid={`button-delete-ingredient-${ingredient.id}`}
                        aria-label={`Excluir ingrediente ${ingredient.nome}`}
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
      </div>
    </Layout>
  );
}
