import { useState } from "react";
import { Layout } from "@/components/layout";
import { useRecipes } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Calculator, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const { recipes, addRecipe, deleteRecipe, loading } = useRecipes();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nome: '',
    custoInsumos: '',
    rendimento: '',
    margem: ''
  });

  const [calculations, setCalculations] = useState({
    costPerUnit: 0,
    suggestedPrice: 0,
    profitPerUnit: 0
  });

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Calculate in real-time
    const custoInsumos = parseFloat(newFormData.custoInsumos) || 0;
    const rendimento = parseFloat(newFormData.rendimento) || 1;
    const margem = parseFloat(newFormData.margem) || 0;
    
    const costPerUnit = custoInsumos / rendimento;
    const suggestedPrice = costPerUnit / (1 - margem / 100);
    const profitPerUnit = suggestedPrice - costPerUnit;
    
    setCalculations({
      costPerUnit,
      suggestedPrice,
      profitPerUnit
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.custoInsumos || !formData.rendimento || !formData.margem) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    try {
      await addRecipe({
        nome: formData.nome,
        custoInsumos: parseFloat(formData.custoInsumos),
        rendimento: parseFloat(formData.rendimento),
        margem: parseFloat(formData.margem),
        precoSugerido: calculations.suggestedPrice,
        lucroUnidade: calculations.profitPerUnit
      });

      setFormData({ nome: '', custoInsumos: '', rendimento: '', margem: '' });
      setCalculations({ costPerUnit: 0, suggestedPrice: 0, profitPerUnit: 0 });
      
      toast({
        title: "Sucesso!",
        description: "Receita salva com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar receita",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecipe(id);
      toast({
        title: "Sucesso!",
        description: "Receita removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover receita",
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Calculator className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Precificação de Receitas</h1>
        </div>

        {/* Calculator Form */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus size={20} />
              <span>Nova Receita</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Receita</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="ex: Pastel de Queijo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  data-testid="input-recipe-name"
                />
              </div>

              <div>
                <Label htmlFor="custoInsumos">Custo dos Ingredientes (R$)</Label>
                <Input
                  id="custoInsumos"
                  type="number"
                  step="0.01"
                  placeholder="15.50"
                  value={formData.custoInsumos}
                  onChange={(e) => handleInputChange('custoInsumos', e.target.value)}
                  data-testid="input-ingredient-cost"
                />
              </div>

              <div>
                <Label htmlFor="rendimento">Unidades Produzidas</Label>
                <Input
                  id="rendimento"
                  type="number"
                  placeholder="24"
                  value={formData.rendimento}
                  onChange={(e) => handleInputChange('rendimento', e.target.value)}
                  data-testid="input-units-produced"
                />
              </div>

              <div>
                <Label htmlFor="margem">Margem Desejada (%)</Label>
                <Input
                  id="margem"
                  type="number"
                  placeholder="60"
                  value={formData.margem}
                  onChange={(e) => handleInputChange('margem', e.target.value)}
                  data-testid="input-desired-margin"
                />
              </div>

              {/* Results */}
              <Card className="bg-muted">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Custo por unidade:</span>
                    <span className="font-semibold" data-testid="text-cost-per-unit">
                      {formatCurrency(calculations.costPerUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Preço sugerido:</span>
                    <span className="font-bold text-lg text-primary" data-testid="text-suggested-price">
                      {formatCurrency(calculations.suggestedPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lucro por unidade:</span>
                    <span className="font-semibold text-green-600" data-testid="text-profit-per-unit">
                      {formatCurrency(calculations.profitPerUnit)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground touch-target"
                data-testid="button-save-recipe"
              >
                Salvar Receita
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Recipes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Receitas Salvas</h2>
          
          {loading ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">Carregando receitas...</p>
              </CardContent>
            </Card>
          ) : recipes.length === 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">
                  Nenhuma receita cadastrada ainda. Use o formulário acima para criar sua primeira receita!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="card-shadow" data-testid={`card-recipe-${recipe.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{recipe.nome}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recipe.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`button-delete-recipe-${recipe.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Custo total:</span>
                        <span className="font-medium ml-1">{formatCurrency(recipe.custoInsumos)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rendimento:</span>
                        <span className="font-medium ml-1">{recipe.rendimento} unidades</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margem:</span>
                        <span className="font-medium ml-1">{recipe.margem}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lucro/unidade:</span>
                        <span className="font-medium ml-1 text-green-600">{formatCurrency(recipe.lucroUnidade)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-primary/10 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Preço de Venda:</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(recipe.precoSugerido)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
