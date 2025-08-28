export interface Recipe {
  id: string;
  nome: string;
  custoInsumos: number;
  rendimento: number;
  margem: number;
  precoSugerido: number;
  lucroUnidade: number;
  createdAt: Date;
}

export interface Ingredient {
  id: string;
  nome: string;
  quantidade: number;
  validade: Date;
  custoPorUnidade: number;
  unidade: string; // kg, g, L, mL, unidade
  alertaEstoqueBaixo: number;
  createdAt: Date;
}

export interface Customer {
  id: string;
  nome: string;
  whatsapp: string;
  observacoes: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  clienteId: string;
  produto: string;
  quantidade: number;
  valorTotal: number;
  status: 'pendente' | 'pago' | 'entregue' | 'cancelado';
  dataPedido: Date;
  dataEntrega?: Date;
}

export interface DailyReport {
  id: string;
  data: Date;
  gastos: number;
  vendas: number;
  lucro: number;
}

export interface ProductionTask {
  id: string;
  titulo: string;
  descricao: string;
  concluida: boolean;
  dataVencimento: Date;
  categoria: 'preparacao' | 'montagem' | 'assamento' | 'embalagem' | 'entrega';
}

export interface Alert {
  id: string;
  tipo: 'estoque_baixo' | 'vencimento_proximo' | 'producao';
  titulo: string;
  descricao: string;
  data: Date;
  lida: boolean;
}
