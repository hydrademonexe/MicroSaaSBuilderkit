import { useState, useEffect } from 'react';
import { database } from '@/lib/database';
import { Recipe, Ingredient, Customer, Order, DailyReport, ProductionTask, Alert } from '@/types';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = async () => {
    try {
      const data = await database.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    try {
      const newRecipe = await database.saveRecipe(recipe);
      setRecipes(prev => [...prev, newRecipe]);
      return newRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await database.deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  return { recipes, loading, addRecipe, deleteRecipe, reload: loadRecipes };
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIngredients = async () => {
    try {
      const data = await database.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => {
    try {
      const newIngredient = await database.saveIngredient(ingredient);
      setIngredients(prev => [...prev, newIngredient]);
      return newIngredient;
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  };

  const updateIngredient = async (ingredient: Ingredient) => {
    try {
      await database.updateIngredient(ingredient);
      setIngredients(prev => prev.map(i => i.id === ingredient.id ? ingredient : i));
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await database.deleteIngredient(id);
      setIngredients(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  };

  return { ingredients, loading, addIngredient, updateIngredient, deleteIngredient, reload: loadIngredients };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const data = await database.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer = await database.saveCustomer(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      await database.updateCustomer(customer);
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await database.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  return { customers, loading, addCustomer, updateCustomer, deleteCustomer, reload: loadCustomers };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await database.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const newOrder = await database.saveOrder(order);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (order: Order) => {
    try {
      await database.updateOrder(order);
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await database.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return { orders, loading, addOrder, updateOrder, deleteOrder, reload: loadOrders };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      await database.generateAlerts(); // Generate fresh alerts
      const data = await database.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await database.markAlertAsRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, lida: true } : a));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  };

  return { alerts, loading, markAsRead, reload: loadAlerts };
}

export function useReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const data = await database.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return { reports, loading, reload: loadReports };
}

export function useProductionTasks() {
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await database.getProductionTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading production tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateTask = async (task: ProductionTask) => {
    try {
      await database.updateProductionTask(task);
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const addTask = async (task: Omit<ProductionTask, 'id'>) => {
    try {
      const newTask = await database.saveProductionTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  return { tasks, loading, updateTask, addTask, reload: loadTasks };
}
