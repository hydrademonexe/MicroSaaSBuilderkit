import { Recipe, Ingredient, Customer, Order, DailyReport, ProductionTask, Alert } from '@/types';

class DatabaseManager {
  private dbName = 'SalgadosProDB';
  private version = 1;
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

        // Recipes store
        if (!db.objectStoreNames.contains('recipes')) {
          const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
          recipeStore.createIndex('nome', 'nome', { unique: false });
        }

        // Ingredients store
        if (!db.objectStoreNames.contains('ingredients')) {
          const ingredientStore = db.createObjectStore('ingredients', { keyPath: 'id' });
          ingredientStore.createIndex('nome', 'nome', { unique: false });
          ingredientStore.createIndex('validade', 'validade', { unique: false });
        }

        // Customers store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('nome', 'nome', { unique: false });
        }

        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('clienteId', 'clienteId', { unique: false });
          orderStore.createIndex('status', 'status', { unique: false });
          orderStore.createIndex('dataPedido', 'dataPedido', { unique: false });
        }

        // Reports store
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('data', 'data', { unique: true });
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
  async saveRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const store = await this.getStore('recipes', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newRecipe);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newRecipe;
  }

  async getRecipes(): Promise<Recipe[]> {
    const store = await this.getStore('recipes');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecipe(id: string): Promise<void> {
    const store = await this.getStore('recipes', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Ingredient methods
  async saveIngredient(ingredient: Omit<Ingredient, 'id' | 'createdAt'>): Promise<Ingredient> {
    const newIngredient: Ingredient = {
      ...ingredient,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const store = await this.getStore('ingredients', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newIngredient);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newIngredient;
  }

  async getIngredients(): Promise<Ingredient[]> {
    const store = await this.getStore('ingredients');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateIngredient(ingredient: Ingredient): Promise<void> {
    const store = await this.getStore('ingredients', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(ingredient);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteIngredient(id: string): Promise<void> {
    const store = await this.getStore('ingredients', 'readwrite');
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

    const store = await this.getStore('customers', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newCustomer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newCustomer;
  }

  async getCustomers(): Promise<Customer[]> {
    const store = await this.getStore('customers');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCustomer(customer: Customer): Promise<void> {
    const store = await this.getStore('customers', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(customer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    const store = await this.getStore('customers', 'readwrite');
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

    const store = await this.getStore('orders', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(newOrder);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    const store = await this.getStore('orders');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateOrder(order: Order): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(order);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const store = await this.getStore('orders', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Report methods
  async saveDailyReport(report: Omit<DailyReport, 'id'>): Promise<DailyReport> {
    const newReport: DailyReport = {
      ...report,
      id: crypto.randomUUID(),
    };

    const store = await this.getStore('reports', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.put(newReport); // Use put to overwrite existing reports for the same day
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return newReport;
  }

  async getReports(): Promise<DailyReport[]> {
    const store = await this.getStore('reports');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
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

  // Utility methods
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
      if (ingredient.quantidade <= ingredient.alertaEstoqueBaixo) {
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

  async exportCustomersCSV(): Promise<string> {
    const customers = await this.getCustomers();
    const headers = ['Nome', 'WhatsApp', 'Observações'];
    const rows = customers.map(customer => [
      customer.nome,
      customer.whatsapp,
      customer.observacoes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

export const database = new DatabaseManager();
