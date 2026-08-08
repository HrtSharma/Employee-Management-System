// In-memory database simulation for employee CRUD operations
// This mimics a real database with async operations and auto-incrementing IDs
// Data is persisted to localStorage to survive page refreshes

import { employeesData } from './mockData';

const STORAGE_KEY = 'employee-db-data';

class InMemoryDB {
  constructor() {
    this.employees = this._loadFromStorage() || [...employeesData];
    this.nextId = Math.max(...this.employees.map((e) => e.id), 0) + 1;
  }

  // Load persisted data from localStorage
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  }

  // Persist current data to localStorage
  _saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.employees));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Simulate network latency
  _delay(ms = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // CREATE - Add a new employee
  async createEmployee(employeeData) {
    await this._delay();
    const newEmployee = {
      id: this.nextId++,
      ...employeeData,
      satisfaction: employeeData.satisfaction || 85,
      status: employeeData.status || 'Active',
    };
    this.employees.push(newEmployee);
    this._saveToStorage();
    return { ...newEmployee };
  }

  // READ - Get all employees
  async getEmployees() {
    await this._delay(150);
    return this.employees.map((e) => ({ ...e }));
  }

  // READ - Get a single employee by ID
  async getEmployeeById(id) {
    await this._delay(100);
    const employee = this.employees.find((e) => e.id === Number(id));
    return employee ? { ...employee } : null;
  }

  // UPDATE - Update an existing employee
  async updateEmployee(id, employeeData) {
    await this._delay();
    const index = this.employees.findIndex((e) => e.id === Number(id));
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`);
    }
    this.employees[index] = {
      ...this.employees[index],
      ...employeeData,
      id: Number(id),
    };
    this._saveToStorage();
    return { ...this.employees[index] };
  }

  // DELETE - Remove an employee
  async deleteEmployee(id) {
    await this._delay();
    const index = this.employees.findIndex((e) => e.id === Number(id));
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`);
    }
    const [deleted] = this.employees.splice(index, 1);
    this._saveToStorage();
    return { ...deleted };
  }

  // Helper: Get next available ID (for form preview)
  getNextId() {
    return this.nextId;
  }

  // Reset the database to initial seed data
  async resetDatabase() {
    await this._delay();
    this.employees = [...employeesData];
    this.nextId = Math.max(...this.employees.map((e) => e.id), 0) + 1;
    this._saveToStorage();
    return this.employees.map((e) => ({ ...e }));
  }
}

// Singleton instance
export const db = new InMemoryDB();