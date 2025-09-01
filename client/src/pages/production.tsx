import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useProductionTasks } from "@/hooks/use-database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Circle, Clock, Plus, Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductionTask } from "@/types";

export default function Production() {
  const { tasks, updateTask, addTask, deleteTask, loading } = useProductionTasks();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProductionTask | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    dataVencimento: '',
    categoria: 'preparacao' as ProductionTask['categoria']
  });

  // Initialize default tasks if none exist
  useEffect(() => {
    if (!loading && tasks.length === 0) {
      initializeDefaultTasks();
    }
  }, [loading, tasks.length]);

  const initializeDefaultTasks = async () => {
    const today = new Date();
    const defaultTasks = [
      {
        titulo: "Preparar massa",
        descricao: "Preparar 3 lotes de massa para salgados",
        categoria: 'preparacao' as const,
        dataVencimento: new Date(today.getTime() + 0 * 24 * 60 * 60 * 1000), // Today
        concluida: true
      },
      {
        titulo: "Comprar ingredientes",
        descricao: "Comprar ingredientes para a semana",
        categoria: 'preparacao' as const,
        dataVencimento: new Date(today.getTime() + 0 * 24 * 60 * 60 * 1000), // Today
        concluida: true
      },
      {
        titulo: "Limpar equipamentos",
        descricao: "Limpeza completa dos equipamentos",
        categoria: 'preparacao' as const,
        dataVencimento: new Date(today.getTime() + 0 * 24 * 60 * 60 * 1000), // Today
        concluida: true
      },
      {
        titulo: "Preparar recheios",
        descricao: "Preparar todos os recheios para montagem",
        categoria: 'montagem' as const,
        dataVencimento: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        concluida: true
      },
      {
        titulo: "Montar salgados",
        descricao: "Montar 120 unidades de salgados variados",
        categoria: 'montagem' as const,
        dataVencimento: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        concluida: false
      },
      {
        titulo: "Congelar produtos montados",
        descricao: "Congelar todos os salgados montados",
        categoria: 'montagem' as const,
        dataVencimento: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        concluida: false
      },
      {
        titulo: "Assar primeiro lote",
        descricao: "Assar primeiro lote (6:00 da manhã)",
        categoria: 'assamento' as const,
        dataVencimento: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        concluida: false
      },
      {
        titulo: "Embalar e etiquetar",
        descricao: "Embalar produtos e colar etiquetas",
        categoria: 'embalagem' as const,
        dataVencimento: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        concluida: false
      },
      {
        titulo: "Entregar nos pontos",
        descricao: "Entregar produtos nos pontos de venda",
        categoria: 'entrega' as const,
        dataVencimento: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        concluida: false
      }
    ];

    try {
      for (const task of defaultTasks) {
        await addTask(task);
      }
    } catch (error) {
      console.error('Error initializing default tasks:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      dataVencimento: '',
      categoria: 'preparacao'
    });
    setEditingTask(null);
  };

  const handleOpenDialog = (task?: ProductionTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao,
        dataVencimento: task.dataVencimento.toISOString().split('T')[0],
        categoria: task.categoria
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.dataVencimento) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const taskData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataVencimento: new Date(formData.dataVencimento),
        categoria: formData.categoria,
        concluida: false
      };

      if (editingTask) {
        await updateTask({ ...editingTask, ...taskData });
        toast({
          title: "Sucesso!",
          description: "Tarefa atualizada com sucesso"
        });
      } else {
        await addTask(taskData);
        toast({
          title: "Sucesso!",
          description: "Tarefa adicionada com sucesso"
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar tarefa",
        variant: "destructive"
      });
    }
  };

  const toggleTaskCompletion = async (task: ProductionTask) => {
    try {
      await updateTask({ ...task, concluida: !task.concluida });
      toast({
        title: "Sucesso!",
        description: `Tarefa ${task.concluida ? 'desmarcada' : 'concluída'}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (task: ProductionTask) => {
    if (confirm(`Tem certeza que deseja excluir a tarefa "${task.titulo}"?`)) {
      try {
        await deleteTask(task.id);
        toast({
          title: "Sucesso!",
          description: "Tarefa excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir tarefa",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  const getCategoryLabel = (categoria: ProductionTask['categoria']) => {
    const labels = {
      preparacao: 'Preparação',
      montagem: 'Montagem',
      assamento: 'Assamento',
      embalagem: 'Embalagem',
      entrega: 'Entrega'
    };
    return labels[categoria];
  };

  const getCategoryColor = (categoria: ProductionTask['categoria']) => {
    const colors = {
      preparacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      montagem: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      assamento: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      embalagem: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      entrega: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[categoria];
  };

  const getTaskStatus = (task: ProductionTask) => {
    const today = new Date();
    const taskDate = new Date(task.dataVencimento);
    
    if (task.concluida) {
      return { status: 'completed', label: 'Concluída', color: 'green' };
    } else if (taskDate.toDateString() === today.toDateString()) {
      return { status: 'in-progress', label: 'Em andamento', color: 'yellow' };
    } else if (taskDate > today) {
      return { status: 'pending', label: 'Pendente', color: 'gray' };
    } else {
      return { status: 'overdue', label: 'Atrasada', color: 'red' };
    }
  };

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateKey = task.dataVencimento.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, ProductionTask[]>);

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Clock className="text-primary" size={20} />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Rotina de Produção</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary text-primary-foreground touch-target"
                onClick={() => handleOpenDialog()}
                data-testid="button-add-task"
              >
                <Plus size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título da Tarefa *</Label>
                  <Input
                    id="titulo"
                    type="text"
                    placeholder="ex: Preparar massa"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    data-testid="input-task-title"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Detalhes da tarefa..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    data-testid="input-task-description"
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value: ProductionTask['categoria']) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparacao">Preparação</SelectItem>
                      <SelectItem value="montagem">Montagem</SelectItem>
                      <SelectItem value="assamento">Assamento</SelectItem>
                      <SelectItem value="embalagem">Embalagem</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                    data-testid="input-due-date"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 text-sm"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel-task"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary text-primary-foreground text-sm"
                    data-testid="button-save-task"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reference Timing Card */}
        <Card className="bg-muted card-shadow">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base lg:text-lg">Referência de Tempos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Preparo da massa:</span>
                <span className="font-medium ml-2">2h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Montagem:</span>
                <span className="font-medium ml-2">3h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Congelamento:</span>
                <span className="font-medium ml-2">24h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Assamento:</span>
                <span className="font-medium ml-2">25min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Validade fresco:</span>
                <span className="font-medium ml-2">3 dias</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Embalagem:</span>
                <span className="font-medium ml-2">1h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Date */}
        {loading ? (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-center text-muted-foreground">Carregando cronograma...</p>
            </CardContent>
          </Card>
        ) : sortedDates.length === 0 ? (
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-center text-muted-foreground">
                Nenhuma tarefa cadastrada ainda. Clique no botão + para adicionar sua primeira tarefa!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {sortedDates.map((dateKey) => {
              const date = new Date(dateKey);
              const dayTasks = tasksByDate[dateKey];
              const completedTasks = dayTasks.filter(task => task.concluida).length;
              const totalTasks = dayTasks.length;
              
              let dayStatus = 'Pendente';
              let dayStatusColor = 'bg-muted text-muted-foreground';
              
              if (completedTasks === totalTasks) {
                dayStatus = 'Concluído';
                dayStatusColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
              } else if (completedTasks > 0) {
                dayStatus = 'Em andamento';
                dayStatusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
              }

              return (
                <Card key={dateKey} className="card-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>{formatDate(date)}</span>
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {completedTasks}/{totalTasks} tarefas concluídas
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${dayStatusColor} whitespace-nowrap`}>
                        {dayStatus}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 sm:space-y-3">
                      {dayTasks
                        .sort((a, b) => a.categoria.localeCompare(b.categoria))
                        .map((task) => {
                          const taskStatus = getTaskStatus(task);
                          
                          return (
                            <div 
                              key={task.id} 
                              className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border border-border"
                              data-testid={`task-${task.id}`}
                            >
                              <button
                                onClick={() => toggleTaskCompletion(task)}
                                className="mt-0.5 touch-target"
                                data-testid={`button-toggle-task-${task.id}`}
                              >
                                {task.concluida ? (
                                  <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
                                ) : (
                                  <Circle className="text-muted-foreground flex-shrink-0" size={18} />
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
                                  <h4 className={`font-semibold text-sm sm:text-base ${task.concluida ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                    {task.titulo}
                                  </h4>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(task.categoria)}`}>
                                      {getCategoryLabel(task.categoria)}
                                    </span>
                                    <div className="flex gap-0.5 sm:gap-1">
                                      <button
                                        onClick={() => handleOpenDialog(task)}
                                        className="p-1.5 text-muted-foreground hover:text-foreground touch-target"
                                        data-testid={`button-edit-task-${task.id}`}
                                        aria-label="Editar tarefa"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(task)}
                                        className="p-1.5 text-muted-foreground hover:text-destructive touch-target"
                                        data-testid={`button-delete-task-${task.id}`}
                                        aria-label="Excluir tarefa"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {task.descricao && (
                                  <p className={`text-xs sm:text-sm ${task.concluida ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                    {task.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Action */}
        {tasks.some(task => !task.concluida) && (
          <Button 
            className="w-full bg-primary text-primary-foreground py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base lg:text-lg touch-target card-shadow min-h-[50px] sm:min-h-[60px] leading-tight"
            onClick={() => {
              const nextIncompleteTask = tasks.find(task => !task.concluida);
              if (nextIncompleteTask) {
                toggleTaskCompletion(nextIncompleteTask);
              }
            }}
            data-testid="button-complete-next-task"
          >
            <span className="whitespace-normal text-center">Marcar Próxima Tarefa como Concluída</span>
          </Button>
        )}
      </div>
    </Layout>
  );
}
