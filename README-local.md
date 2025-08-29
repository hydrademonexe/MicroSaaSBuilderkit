# SalgadosPro - Documentação Técnica

## Visão Geral
SalgadosPro é um Micro-SaaS local para empreendedores de salgados assados, focado em simplicidade e funcionalidade offline-first usando IndexedDB.

## Máscaras e Formatação

### WhatsApp (Brasil)
- **Formato de entrada**: (11) 99999-9999 ou (11) 9999-9999
- **Armazenamento**: Apenas dígitos (ex: "11999999999")
- **Validação**: 10 ou 11 dígitos após DDD
- **Exibição**: Sempre formatado com parênteses e hífen

### CEP
- **Formato**: 12345-678
- **Armazenamento**: Apenas dígitos
- **Validação**: Exatamente 8 dígitos

### Valores Monetários (BRL)
- **Entrada**: Aceita "1200", "12,50", "R$ 12,50"
- **Processamento**: Converte para número (ex: 12.50)
- **Exibição**: Sempre formatado como "R$ 12,50"
- **Precisão**: 2 casas decimais com arredondamento

## Fórmulas de Cálculo

### Precificação
```
custoUnit = custoIngredientes / rendimento
precoSugerido = custoUnit * (1 + margem/100)
lucroUnit = precoSugerido - custoUnit
```

### Validação de Margem
- **0-94%**: Normal
- **95-300%**: Permitido com aviso "Margem muito alta"
- **>300%**: Bloqueado com erro

### CMV (Custo das Mercadorias Vendidas)
1. **Com composição**: Soma real dos custos dos insumos
2. **Sem composição**: Percentual estimado (padrão 35%)
3. **Apenas pedidos pagos/entregues** são considerados

## Fluxo de Baixa de Estoque

### Quando ocorre
- Status do pedido muda para "pago"
- Apenas produtos com composição definida

### Processo
1. Para cada item do pedido
2. Verifica se produto tem composição
3. Calcula: `quantidadeConsumida = quantidadePorUnidade * quantidadePedido`
4. Reduz estoque do ingrediente
5. Registra movimento em `movimentosEstoque`

### Registro de Movimento
```typescript
{
  tipo: 'baixa',
  referencia: pedidoId,
  itens: [{ insumoId, quantidade }],
  createdAt: Date
}
```

## Regras de Relatórios

### Dados Considerados
- **Vendas**: Soma de `valorTotal` de pedidos com status "pago" ou "entregue"
- **Custos**: CMV calculado conforme regras acima
- **Lucro**: Vendas - Custos
- **Período**: Filtro por data de criação do pedido

### Filtros Disponíveis
- **Esta Semana**: Últimos 7 dias
- **Este Mês**: Do dia 1 até hoje

## Estrutura do IndexedDB

### Stores Principais
- `clientes`: Dados completos com endereço
- `produtos`: Catálogo com composição opcional
- `insumos`: Estoque com alertas de validade/quantidade
- `pedidos`: Estrutura completa com itens múltiplos
- `receitas`: Cálculos de precificação salvos
- `movimentosEstoque`: Histórico de movimentações
- `config`: Configurações do sistema
- `productionTasks`: Cronograma de produção
- `alerts`: Alertas automáticos

### Índices Criados
- Por nome (busca)
- Por status (filtros)
- Por data (relatórios)
- Por cliente (histórico)

## Alertas Automáticos

### Tipos
1. **Vencimento próximo**: Ingredientes que vencem em ≤3 dias
2. **Estoque baixo**: Quantidade ≤ alertaMinimo

### Geração
- Executada automaticamente ao carregar dashboard
- Limpa alertas antigos e recria baseado no estado atual

## Acessibilidade e UX

### Público-Alvo (+35 anos)
- Botões grandes (min 44px)
- Textos legíveis (contraste adequado)
- Labels sempre visíveis
- Feedback imediato (toasts 5s)

### Mobile-First
- Layout responsivo
- Navegação inferior fixa
- Touch targets adequados
- Formulários otimizados para mobile

## Tratamento de Erros

### Validações
- Campos obrigatórios destacados
- Mensagens de erro contextuais
- Prevenção de dados inválidos

### Fallbacks
- CMV estimado quando composição não disponível
- Valores padrão para campos opcionais
- Graceful degradation em falhas de cálculo

## Performance

### Otimizações
- Cálculos em tempo real otimizados
- Índices de busca no IndexedDB
- Lazy loading de componentes pesados
- Debounce em inputs de busca

### Limitações Conhecidas
- IndexedDB limitado pelo browser
- Sem sincronização entre dispositivos
- Backup manual necessário