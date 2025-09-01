export interface Recipe {
  id: string;
  nome: string;
  custoInsumos: number;
  rendimento: number;
  margem: number;
  precoSugerido: number;
  lucroUnidade: number;
  dataAtualizacao: Date;
}

export interface Ingredient {
  id: string;
  nome: string;
  quantidade: number;
  validade: Date;
  custoPorUnidade: number;
  unidade: 'kg' | 'g' | 'L' | 'mL' | 'unidade';
  alertaMinimo: number;
  createdAt: Date;
}

export interface Address {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Customer {
  id: string;
  nome: string;
  whatsapp: string; // stored as digits only
  endereco: Address;
  observacoes: string;
  createdAt: Date;
}

export interface ProductComposition {
  insumoId: string;
  quantidadePorUnidade: number;
}

export interface Product {
  id: string;
  nome: string;
  sku?: string;
  descricao?: string;
  precoVenda: number;
  categoria?: string;
  ativo: boolean;
  composicao: ProductComposition[];
  createdAt: Date;
}

export interface OrderItem {
  produtoId: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

export interface Order {
  id: string;
  clienteId: string;
  itens: OrderItem[];
  taxaEntrega: number;
  taxaServico: number;
  valorTotal: number;
  status: 'rascunho' | 'pendente' | 'pago' | 'entregue' | 'cancelado';
  createdAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
}

export interface StockMovementItem {
  insumoId: string;
  quantidade: number;
}

export interface StockMovement {
  id: string;
  tipo: 'baixa' | 'entrada';
  referencia?: string; // pedidoId or 'ajuste'
  itens: StockMovementItem[];
  createdAt: Date;
}

export interface Config {
  key: string;
  value: any;
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

export interface ProductCardapio {
  id: string;
  name: string;
  category?: string;
  priceCents: number;
  costCents?: number;
  marginPct?: number;
  sku?: string;
  stockQty?: number;
  unit?: "un" | "kg" | "dz" | "bandeja" | "pct";
  isActive: boolean;
  photoUrl?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
