import { Recipe, Ingredient, Customer, Order, Product, StockMovement, Config, ProductionTask, Alert } from '@/types';
import { ProductCardapio } from '@/types';

class DatabaseManager {
  private dbName = 'lucroAssadoDB';
  private version = 3; // Updated version to trigger migration
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Recipes store (receitas)
        if (!db.objectStoreNames.contains('receitas')) {
          const recipeStore = db.createObjectStore('receitas', { keyPath: 'id' });
          recipeStore.createIndex('by_nome', 'nome', { unique: false });
        }

        // Products store (produtos) 
        if (!db.objectStoreNames.contains('produtos')) {
          const productStore = db.createObjectStore('produtos', { keyPath: 'id' });
          productStore.createIndex('by_nome', 'nome', { unique: false });
          productStore.createIndex('by_sku', 'sku', { unique: false });
          productStore.createIndex('by_ativo', 'ativo', { unique: false });
        }

        // Ingredients store (insumos) - migrate from old ingredients
        if (!db.objectStoreNames.contains('insumos')) {
          const ingredientStore = db.createObjectStore('insumos', { keyPath: 'id' });
          ingredientStore.createIndex('by_nome', 'nome', { unique: false });
          ingredientStore.createIndex('by_validade', 'validade', { unique: false });
          
          // Migrate from old ingredients store if it exists
          if (db.objectStoreNames.contains('ingredients')) {
            // Migration will be handled in a separate function
          }
        }

        // Customers store (clientes) - with new fields
        if (!db.objectStoreNames.contains('clientes')) {
          const customerStore = db.createObjectStore('clientes', { keyPath: 'id' });
          customerStore.createIndex('by_nome', 'nome', { unique: false });
          customerStore.createIndex('by_whatsapp', 'whatsapp', { unique: false });
          
          // Migrate from old customers store if it exists
          if (db.objectStoreNames.contains('customers')) {
            // Migration will be handled in a separate function
          }
        }

        // Orders store (pedidos) - completely new structure
        if (!db.objectStoreNames.contains('pedidos')) {
          const orderStore = db.createObjectStore('pedidos', { keyPath: 'id' });
          orderStore.createIndex('by_status', 'status', { unique: false });
          orderStore.createIndex('by_clienteId', 'clienteId', { unique: false });
          orderStore.createIndex('by_createdAt', 'createdAt', { unique: false });
          orderStore.createIndex('by_paidAt', 'paidAt', { unique: false });
        }

        // Stock movements store (movimentosEstoque)
        if (!db.objectStoreNames.contains('movimentosEstoque')) {
          const movementStore = db.createObjectStore('movimentosEstoque', { keyPath: 'id' });
          movementStore.createIndex('by_tipo', 'tipo', { unique: false });
          movementStore.createIndex('by_createdAt', 'createdAt', { unique: false });
        }

        // Config store for settings
        if (!db.objectStoreNames.contains('config')) {
          const configStore = db.createObjectStore('config', { keyPath: 'key' });
        }

        // Production tasks store
        if (!db.objectStoreNames.contains('productionTasks')) {
          const taskStore = db.createObjectStore('productionTasks', { keyPath: 'id' });
          taskStore.createIndex('dataVencimento', 'dataVencimento', { unique: false });
          taskStore.createIndex('categoria', 'categoria', { unique: false });
        }

        // Alerts store
        if (!db.objectStoreNames.contains('alerts')) {
          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('tipo', 'tipo', { unique: false });
          alertStore.createIndex('data', 'data', { unique: false });
        }

        // Products Cardapio store
        if (!db.objectStoreNames.contains('productsCardapio')) {
          const productStore = db.createObjectStore('productsCardapio', { keyPath: 'id' });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('isActive', 'isActive', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Recipe methods
  async saveRecipe(recipe: Omit<Recipe, 'id' | 'dataAtualizacao'>): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      dataAtualizacao: new Date(),
    };

    const store = await this.getStore('receitas', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newRecipe);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newRecipe;
  }

  async getRecipes(): Promise<Recipe[]> {
    const store = await this.getStore('receitas');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    const store = await this.getStore('receitas', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Product methods
  async saveProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const store = await this.getStore('produtos', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newProduct);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newProduct;
  }

  async getProducts(): Promise<Product[]> {
    const store = await this.getStore('produtos');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProduct(product: Product): Promise<void> {
    const store = await this.getStore('produtos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(product);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const store = await this.getStore('produtos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Ingredient methods (now insumos)
  async saveIngredient(ingredient: Omit<Ingredient, 'id' | 'createdAt'>): Promise<Ingredient> {
    const newIngredient: Ingredient = {
      ...ingredient,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const store = await this.getStore('insumos', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newIngredient);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newIngredient;
  }

  async getIngredients(): Promise<Ingredient[]> {
    const store = await this.getStore('insumos');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateIngredient(ingredient: Ingredient): Promise<void> {
    const store = await this.getStore('insumos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(ingredient);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteIngredient(id: string): Promise<void> {
    const store = await this.getStore('insumos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Customer methods
  async saveCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const store = await this.getStore('clientes', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newCustomer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newCustomer;
  }

  async getCustomers(): Promise<Customer[]> {
    const store = await this.getStore('clientes');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCustomer(customer: Customer): Promise<void> {
    const store = await this.getStore('clientes', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(customer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    const store = await this.getStore('clientes', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Order methods
  async saveOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
    };

    const store = await this.getStore('pedidos', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newOrder);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    const store = await this.getStore('pedidos');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateOrder(order: Order): Promise<void> {
    const store = await this.getStore('pedidos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const store = await this.getStore('pedidos', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Stock movement methods
  async saveStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const newMovement: StockMovement = {
      ...movement,
      id: crypto.randomUUID(),
    };

    const store = await this.getStore('movimentosEstoque', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newMovement);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newMovement;
  }

  async getStockMovements(): Promise<StockMovement[]> {
    const store = await this.getStore('movimentosEstoque');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Config methods
  async getConfig(key: string): Promise<any> {
    const store = await this.getStore('config');
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async setConfig(key: string, value: any): Promise<void> {
    const config: Config = { key, value };
    const store = await this.getStore('config', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(config);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Stock deduction when order is paid
  async processOrderPayment(orderId: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order || order.status === 'pago') return;

    // Update order status
    order.status = 'pago';
    order.paidAt = new Date();
    await this.updateOrder(order);

    // Process stock deduction for each item
    const products = await this.getProducts();
    const ingredients = await this.getIngredients();
    
    const stockMovementItems = [];

    for (const item of order.itens) {
      const product = products.find(p => p.id === item.produtoId);
      if (product && product.composicao.length > 0) {
        // Product has ingredient composition, deduct stock
        for (const comp of product.composicao) {
          const totalDeduction = comp.quantidadePorUnidade * item.quantidade;
          stockMovementItems.push({
            insumoId: comp.insumoId,
            quantidade: totalDeduction
          });
          
          // Update ingredient quantity
          const ingredient = ingredients.find(i => i.id === comp.insumoId);
          if (ingredient) {
            ingredient.quantidade = Math.max(0, ingredient.quantidade - totalDeduction);
            await this.updateIngredient(ingredient);
          }
        }
      }
    }

    // Record stock movement
    if (stockMovementItems.length > 0) {
      await this.saveStockMovement({
        tipo: 'baixa',
        referencia: orderId,
        itens: stockMovementItems,
        createdAt: new Date()
      });
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order | null> {
    const store = await this.getStore('pedidos');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Production task methods
  async saveProductionTask(task: Omit<ProductionTask, 'id'>): Promise<ProductionTask> {
    const newTask: ProductionTask = {
      ...task,
      id: crypto.randomUUID(),
    };

    const store = await this.getStore('productionTasks', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newTask);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newTask;
  }

  async getProductionTasks(): Promise<ProductionTask[]> {
    const store = await this.getStore('productionTasks');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProductionTask(task: ProductionTask): Promise<void> {
    const store = await this.getStore('productionTasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProductionTask(id: string): Promise<void> {
    const store = await this.getStore('productionTasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Alert methods
  async saveAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
    };

    const store = await this.getStore('alerts', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newAlert);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newAlert;
  }

  async getAlerts(): Promise<Alert[]> {
    const store = await this.getStore('alerts');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAlertAsRead(id: string): Promise<void> {
    const store = await this.getStore('alerts', 'readwrite');
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const alert = getRequest.result;
        if (alert) {
          alert.lida = true;
          const putRequest = store.put(alert);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Alert not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Generate alerts for low stock and expiring items
  async generateAlerts(): Promise<void> {
    const ingredients = await this.getIngredients();
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Clear old alerts
    const alertStore = await this.getStore('alerts', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = alertStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Generate new alerts
    for (const ingredient of ingredients) {
      // Expiration alerts
      if (ingredient.validade <= threeDaysFromNow) {
        await this.saveAlert({
          tipo: 'vencimento_proximo',
          titulo: 'Produto próximo do vencimento',
          descricao: `${ingredient.nome} vence em ${Math.ceil((ingredient.validade.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} dias`,
          data: new Date(),
          lida: false,
        });
      }

      // Low stock alerts
      if (ingredient.quantidade <= ingredient.alertaMinimo) {
        await this.saveAlert({
          tipo: 'estoque_baixo',
          titulo: 'Estoque baixo',
          descricao: `${ingredient.nome}: restam apenas ${ingredient.quantidade}${ingredient.unidade}`,
          data: new Date(),
          lida: false,
        });
      }
    }
  }

  // Product Cardapio methods
  async saveProductCardapio(product: Omit<ProductCardapio, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductCardapio> {
    const now = Date.now();
    const newProduct: ProductCardapio = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const store = await this.getStore('productsCardapio', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newProduct);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newProduct;
  }

  async getProductsCardapio(): Promise<ProductCardapio[]> {
    const store = await this.getStore('productsCardapio');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateProductCardapio(product: ProductCardapio): Promise<void> {
    const updatedProduct = { ...product, updatedAt: Date.now() };
    const store = await this.getStore('productsCardapio', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(updatedProduct);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProductCardapio(id: string): Promise<void> {
    const store = await this.getStore('productsCardapio', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async duplicateProductCardapio(id: string): Promise<ProductCardapio> {
    const store = await this.getStore('productsCardapio');
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = async () => {
        const original = getRequest.result;
        if (original) {
          const duplicate = {
            ...original,
            name: `${original.name} (Cópia)`,
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined
          };
          delete duplicate.id;
          delete duplicate.createdAt;
          delete duplicate.updatedAt;
          
          try {
            const newProduct = await this.saveProductCardapio(duplicate);
            resolve(newProduct);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Product not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Export customers CSV
  async exportCustomersCSV(): Promise<string> {
    const customers = await this.getCustomers();
    const headers = ['Nome', 'WhatsApp', 'Endereço', 'Observações'];
    const rows = customers.map(customer => [
      customer.nome,
      customer.whatsapp,
      `${customer.endereco.logradouro}, ${customer.endereco.numero} - ${customer.endereco.bairro}, ${customer.endereco.cidade}/${customer.endereco.uf}`,
      customer.observacoes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Calculate CMV (Cost of Goods Sold) for reports
  async calculateCMV(orders: Order[]): Promise<number> {
    const products = await this.getProducts();
    const ingredients = await this.getIngredients();
    let totalCost = 0;

    // Try to get estimated CMV percentage from config
    const cmvPercent = await this.getConfig('cmvEstimadoPercent') || 35;

    for (const order of orders) {
      if (order.status !== 'pago' && order.status !== 'entregue') {
        continue; // Only count paid/delivered orders
      }
      
      let orderCost = 0;
      let hasComposition = false;

      for (const item of order.itens) {
        const product = products.find(p => p.id === item.produtoId);
        if (product && product.composicao.length > 0) {
          // Calculate real cost based on ingredient composition
          hasComposition = true;
          for (const comp of product.composicao) {
            const ingredient = ingredients.find(i => i.id === comp.insumoId);
            if (ingredient) {
              const ingredientCost = comp.quantidadePorUnidade * item.quantidade * ingredient.custoPorUnidade;
              orderCost += ingredientCost;
            }
          }
        }
      }

      if (!hasComposition) {
        // Use estimated percentage if no composition data
        orderCost = order.valorTotal * (cmvPercent / 100);
      }

      totalCost += orderCost;
    }

    return Number(totalCost.toFixed(2));
  }
}

export const database = new DatabaseManager();