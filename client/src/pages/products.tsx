import { useState } from "react";
import { Layout } from "@/components/layout";
import { useProducts, useIngredients } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Package, Plus, Edit, Minus, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatCurrencyInput, formatCurrencyDisplay, parseCurrency } from "@/lib/formatters";
import { MaskedInput } from "@/components/ui/input-mask";
import { Product, Ingredient } from "@/types";

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts();
  const { ingredients } = useIngredients();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    sku: '',
    descricao: '',
    precoVenda: '0',
    ativo: true,
    categoria: '',
    composicao: [] as Array<{ insumoId: string; quantidadePorUnidade: number }>
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredientToComposition = () => {
    if (!selectedIngredient || !ingredientQuantity) {
      toast({
        title: "Erro",
        description: "Selecione um ingrediente e informe a quantidade",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(ingredientQuantity);
    if (quantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    // Check if ingredient already exists in composition
    const existingIndex = formData.composicao.findIndex(c => c.insumoId === selectedIngredient);
    
    if (existingIndex >= 0) {
      // Update existing ingredient quantity
      const newComposition = [...formData.composicao];
      newComposition[existingIndex].quantidadePorUnidade = quantity;
      setFormData(prev => ({ ...prev, composicao: newComposition }));
    } else {
      // Add new ingredient
      setFormData(prev => ({
        ...prev,
        composicao: [...prev.composicao, { insumoId: selectedIngredient, quantidadePorUnidade: quantity }]
      }));
    }

    setSelectedIngredient('');
    setIngredientQuantity('');
  };

  const removeIngredientFromComposition = (insumoId: string) => {
    setFormData(prev => ({
      ...prev,
      composicao: prev.composicao.filter(c => c.insumoId !== insumoId)
    }));
  };

  const calculateProductCost = () => {
    let totalCost = 0;
    for (const comp of formData.composicao) {
      const ingredient = ingredients.find(i => i.id === comp.insumoId);
      if (ingredient) {
        totalCost += comp.quantidadePorUnidade * ingredient.custoPorUnidade;
      }
    }
    return totalCost;
  };

  const calculateMargin = () => {
    const cost = calculateProductCost();
    const price = parseCurrency(formData.precoVenda) || 0;
    if (cost === 0 || price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.precoVenda) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        nome: formData.nome,
        sku: formData.sku || undefined,
        descricao: formData.descricao || undefined,
        precoVenda: parseCurrency(formData.precoVenda),
        ativo: formData.ativo,
        categoria: formData.categoria || undefined,
        composicao: formData.composicao
      };

      if (editingId) {
        await updateProduct({ id: editingId, ...productData, createdAt: new Date() });
        setEditingId(null);
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso"
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Sucesso!",
          description: "Produto criado com sucesso"
        });
      }

      setFormData({
        nome: '',
        sku: '',
        descricao: '',
        precoVenda: '0',
        ativo: true,
        categoria: '',
        composicao: []
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      nome: product.nome,
      sku: product.sku || '',
      descricao: product.descricao || '',
      precoVenda: product.precoVenda.toString(),
      ativo: product.ativo,
      categoria: product.categoria || '',
      composicao: product.composicao
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      sku: '',
      descricao: '',
      precoVenda: '0',
      ativo: true,
      categoria: '',
      composicao: []
    });
  };

  const getIngredientName = (insumoId: string) => {
    return ingredients.find(i => i.id === insumoId)?.nome || 'Ingrediente não encontrado';
  };

  const getIngredientUnit = (insumoId: string) => {
    return ingredients.find(i => i.id === insumoId)?.unidade || '';
  };

  const productCost = calculateProductCost();
  const margin = calculateMargin();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Package className="text-primary" />
            Produtos
          </h1>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Coxinha de Frango"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    data-testid="input-product-name"
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU/Código</Label>
                  <Input
                    id="sku"
                    placeholder="Ex: CXF001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    data-testid="input-product-sku"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    placeholder="Ex: Salgados Fritos"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    data-testid="input-product-category"
                  />
                </div>

                <div>
                  <Label htmlFor="precoVenda">Preço de Venda *</Label>
                  <Input
                    id="precoVenda"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.,]*"
                    placeholder="5,00"
                    value={formData.precoVenda}
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value);
                      handleInputChange('precoVenda', formatted);
                    }}
                    onBlur={(e) => {
                      const formatted = formatCurrencyDisplay(e.target.value);
                      handleInputChange('precoVenda', formatted);
                    }}
                    data-testid="input-product-price"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descrição detalhada do produto..."
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  data-testid="input-product-description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                  data-testid="switch-product-active"
                />
                <Label htmlFor="ativo">Produto ativo</Label>
              </div>

              {/* Ingredient Composition */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Composição de Ingredientes</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
                  <div>
                    <Label>Ingrediente</Label>
                    <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                      <SelectTrigger data-testid="select-ingredient">
                        <SelectValue placeholder="Selecione um ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map(ingredient => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantidade por unidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.1"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      data-testid="input-ingredient-quantity"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addIngredientToComposition}
                    data-testid="button-add-ingredient"
                    className="w-full sm:w-auto"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar
                  </Button>
                </div>

                {/* Ingredient List */}
                {formData.composicao.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm sm:text-base">Ingredientes Adicionados:</h4>
                    {formData.composicao.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded">
                        <span className="text-sm flex-1 pr-2">
                          {getIngredientName(comp.insumoId)} - {comp.quantidadePorUnidade} {getIngredientUnit(comp.insumoId)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredientFromComposition(comp.insumoId)}
                          data-testid={`button-remove-ingredient-${index}`}
                          aria-label={`Remover ${getIngredientName(comp.insumoId)} da composição`}
                          className="flex-shrink-0"
                        >
                          <Minus size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cost Analysis */}
                {formData.composicao.length > 0 && (
                  <Card className="bg-muted">
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calculator size={14} />
                        <span className="font-medium">Análise de Custos</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sm text-muted-foreground">Custo dos ingredientes:</span>
                        <span className="font-semibold" data-testid="text-ingredient-cost">
                          {formatCurrency(productCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sm text-muted-foreground">Preço de venda:</span>
                        <span className="font-semibold" data-testid="text-sale-price">
                          {formatCurrency(parseFloat(formData.precoVenda) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sm text-muted-foreground">Margem de lucro:</span>
                        <span className={`font-semibold ${margin < 30 ? 'text-red-600' : margin < 50 ? 'text-yellow-600' : 'text-green-600'}`} data-testid="text-profit-margin">
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" data-testid="button-save-product">
                  {editingId ? 'Atualizar' : 'Salvar'} Produto
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} data-testid="button-cancel-edit">
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Produtos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="border-l-4 border-primary">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>
                              {product.nome}
                            </h3>
                            {!product.ativo && (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                            {product.categoria && (
                              <Badge variant="outline">{product.categoria}</Badge>
                            )}
                          </div>
                          
                          {product.sku && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">SKU: {product.sku}</p>
                          )}
                          
                          {product.descricao && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{product.descricao}</p>
                          )}

                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="font-bold text-base sm:text-lg text-primary" data-testid={`text-product-price-${product.id}`}>
                              {formatCurrency(product.precoVenda)}
                            </span>
                            {product.composicao.length > 0 && (
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {product.composicao.length} ingrediente{product.composicao.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                            className="min-w-[44px]"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            data-testid={`button-delete-${product.id}`}
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