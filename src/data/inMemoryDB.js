// In-memory database simulation for employee CRUD operations
// This mimics a real database with async operations and auto-incrementing IDs
// Data is persisted to localStorage to survive page refreshes

import { employeesData } from './mockData';

const STORAGE_KEY = 'employee-db-data';
const USER_PHOTO_KEY = 'employee-user-photos';

class InMemoryDB {
  constructor() {
    this.employees = this._loadFromStorage() || [...employeesData];
    this.nextId = Math.max(...this.employees.map((e) => e.id), 0) + 1;
    // Profile photos for signed-in users (keyed by email)
    this.profilePhotos = this._loadPhotosFromStorage() || {};
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

  // Load persisted user photos from localStorage
  _loadPhotosFromStorage() {
    try {
      const stored = localStorage.getItem(USER_PHOTO_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user photos from localStorage:', error);
    }
    return null;
  }

  // Persist user photos to localStorage
  _savePhotosToStorage() {
    try {
      localStorage.setItem(USER_PHOTO_KEY, JSON.stringify(this.profilePhotos));
    } catch (error) {
      console.error('Failed to save user photos to localStorage:', error);
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
      photo: employeeData.photo || null,
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

  // UPDATE - Update only an employee's profile photo (data URL string)
  async updateProfilePhoto(id, photo) {
    await this._delay();
    const index = this.employees.findIndex((e) => e.id === Number(id));
    if (index === -1) {
      throw new Error(`Employee with id ${id} not found`);
    }
    this.employees[index] = {
      ...this.employees[index],
      photo,
      id: Number(id),
    };
    this._saveToStorage();
    return { ...this.employees[index] };
  }

  // Create/update the profile photo for a signed-in user (keyed by email).
  // Photos are stored in memory even when the user has no employee record yet.
  async saveProfilePhoto(email, photo) {
    await this._delay(150);
    if (!email) {
      throw new Error('User email is required to save a profile photo.');
    }
    this.profilePhotos[email.toLowerCase()] = photo;
    this._savePhotosToStorage();
    return photo;
  }

  // READ - Get the stored profile photo for a signed-in user (by email)
  async getProfilePhoto(email) {
    await this._delay(80);
    if (!email) return null;
    return this.profilePhotos[email.toLowerCase()] || null;
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