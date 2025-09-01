import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useProductsCardapio } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit, Copy, Archive, ArchiveRestore, Trash2, Search, Filter, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCentsToBRL } from "@/lib/money";
import CurrencyInputBRL from "@/components/ui/currency-input";
import { ProductCardapio } from "@/types";

export default function Cardapio() {
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct, loading } = useProductsCardapio();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCardapio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    priceCents: 0,
    costCents: 0,
    sku: '',
    stockQty: 0,
    unit: 'un' as ProductCardapio['unit'],
    isActive: true,
    photoUrl: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      priceCents: 0,
      costCents: 0,
      sku: '',
      stockQty: 0,
      unit: 'un',
      isActive: true,
      photoUrl: '',
      description: ''
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: ProductCardapio) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category || '',
        priceCents: product.priceCents,
        costCents: product.costCents || 0,
        sku: product.sku || '',
        stockQty: product.stockQty || 0,
        unit: product.unit || 'un',
        isActive: product.isActive,
        photoUrl: product.photoUrl || '',
        description: product.description || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const calculateMargin = () => {
    if (formData.priceCents > 0) {
      return Math.max(0, ((formData.priceCents - formData.costCents) / formData.priceCents) * 100);
    }
    return 0;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.priceCents <= 0) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        category: formData.category || undefined,
        priceCents: formData.priceCents,
        costCents: formData.costCents || undefined,
        marginPct: calculateMargin(),
        sku: formData.sku || undefined,
        stockQty: formData.stockQty || undefined,
        unit: formData.unit,
        isActive: formData.isActive,
        photoUrl: formData.photoUrl || undefined,
        description: formData.description || undefined
      };

      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...productData });
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso"
        });
      } else {
        await addProduct(productData);
        toast({
          title: "Sucesso!",
          description: "Produto adicionado com sucesso"
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (product: ProductCardapio) => {
    try {
      await duplicateProduct(product.id);
      toast({
        title: "Sucesso!",
        description: "Produto duplicado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar produto",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (product: ProductCardapio) => {
    try {
      await updateProduct({ ...product, isActive: !product.isActive });
      toast({
        title: "Sucesso!",
        description: `Produto ${product.isActive ? 'arquivado' : 'ativado'} com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (product: ProductCardapio) => {
    if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
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
    }
  };

  // Seed data for testing
  const createSeedData = async () => {
    const seedProducts = [
      {
        name: "Esfiha de Frango",
        category: "Salgados",
        priceCents: 350, // R$ 3,50
        costCents: 150,  // R$ 1,50
        unit: "un" as const,
        isActive: true,
        description: "Esfiha tradicional com recheio de frango temperado"
      },
      {
        name: "Pão de Batata Recheado",
        category: "Salgados",
        priceCents: 450, // R$ 4,50
        costCents: 200,  // R$ 2,00
        unit: "un" as const,
        isActive: true,
        description: "Pão de batata macio com recheio especial"
      },
      {
        name: "Empadão Família",
        category: "Tortas",
        priceCents: 2500, // R$ 25,00
        costCents: 1200,  // R$ 12,00
        unit: "un" as const,
        isActive: true,
        description: "Empadão grande para toda a família"
      }
    ];

    try {
      for (const product of seedProducts) {
        await addProduct(product);
      }
      toast({
        title: "Sucesso!",
        description: "Produtos de exemplo criados"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar produtos de exemplo",
        variant: "destructive"
      });
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all-categories' || !categoryFilter || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && product.isActive) ||
                           (statusFilter === 'inactive' && !product.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)];
  }, [products]);

  const margin = calculateMargin();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" />
            Cardápio
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {products.length === 0 && (
              <Button 
                variant="outline" 
                onClick={createSeedData}
                className="w-full sm:w-auto h-10"
              >
                Criar Exemplos
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => handleOpenDialog()} 
                  data-testid="button-new-product"
                  className="w-full sm:w-auto h-10"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Esfiha de Frango"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="input-product-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        placeholder="Ex: Salgados"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        data-testid="input-product-category"
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Preço de Venda *</Label>
                      <CurrencyInputBRL
                        id="price"
                        valueCents={formData.priceCents}
                        onChange={(cents) => setFormData(prev => ({ ...prev, priceCents: cents }))}
                        required
                        data-testid="input-product-price"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cost">Custo</Label>
                      <CurrencyInputBRL
                        id="cost"
                        valueCents={formData.costCents}
                        onChange={(cents) => setFormData(prev => ({ ...prev, costCents: cents }))}
                        data-testid="input-product-cost"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sku">SKU/Código</Label>
                      <Input
                        id="sku"
                        placeholder="Ex: ESF001"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                        data-testid="input-product-sku"
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock">Estoque</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.stockQty}
                        onChange={(e) => setFormData(prev => ({ ...prev, stockQty: parseInt(e.target.value) || 0 }))}
                        data-testid="input-product-stock"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={formData.unit} onValueChange={(value: ProductCardapio['unit']) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger data-testid="select-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade</SelectItem>
                        <SelectItem value="kg">Quilograma</SelectItem>
                        <SelectItem value="dz">Dúzia</SelectItem>
                        <SelectItem value="bandeja">Bandeja</SelectItem>
                        <SelectItem value="pct">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="photo">Foto do Produto</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {formData.photoUrl ? (
                          <img src={formData.photoUrl} alt="Produto" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="w-full sm:flex-1">
                        <input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          data-testid="input-photo-upload"
                        />
                        <label htmlFor="photo">
                          <Button variant="outline" asChild className="w-full sm:w-auto">
                            <span>Escolher Foto</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição do produto..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      data-testid="input-product-description"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      data-testid="switch-product-active"
                    />
                    <Label htmlFor="active">Produto ativo</Label>
                  </div>

                  {/* Margin Display */}
                  {formData.priceCents > 0 && formData.costCents > 0 && (
                    <Card className="bg-muted">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Margem de lucro:</span>
                          <span className={`font-semibold ${margin < 30 ? 'text-red-600' : margin < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" data-testid="button-save-product">
                      {editingProduct ? 'Atualizar' : 'Salvar'} Produto
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

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Buscar por nome ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-32" data-testid="select-category-filter">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">Todas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Produtos do Cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando produtos...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 
                    ? "Nenhum produto cadastrado ainda." 
                    : "Nenhum produto encontrado com os filtros aplicados."
                  }
                </p>
                {products.length === 0 && (
                  <Button onClick={createSeedData} variant="outline">
                    Criar Produtos de Exemplo
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border-l-4 border-primary">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3">
                        {/* Product Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate" data-testid={`text-product-name-${product.id}`}>
                                {product.name}
                              </h3>
                              {!product.isActive && (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </div>
                            {product.category && (
                              <Badge variant="outline" className="text-xs">{product.category}</Badge>
                            )}
                          </div>
                          
                          {product.photoUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={product.photoUrl} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Preço:</span>
                            <span className="font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                              {formatCentsToBRL(product.priceCents)}
                            </span>
                          </div>
                          
                          {product.costCents && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Custo:</span>
                              <span className="text-sm">{formatCentsToBRL(product.costCents)}</span>
                            </div>
                          )}
                          
                          {product.marginPct && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Margem:</span>
                              <span className={`text-sm font-medium ${
                                product.marginPct < 30 ? 'text-red-600' : 
                                product.marginPct < 50 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {product.marginPct.toFixed(1)}%
                              </span>
                            </div>
                          )}

                          {product.sku && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">SKU:</span>
                              <span className="text-sm font-mono">{product.sku}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                            data-testid={`button-edit-${product.id}`}
                            className="flex-1 min-w-[60px]"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(product)}
                            data-testid={`button-duplicate-${product.id}`}
                            className="flex-1 min-w-[60px]"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(product)}
                            data-testid={`button-toggle-${product.id}`}
                            className="flex-1 min-w-[60px]"
                          >
                            {product.isActive ? <Archive size={14} /> : <ArchiveRestore size={14} />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            data-testid={`button-delete-${product.id}`}
                            className="flex-1 min-w-[60px]"
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